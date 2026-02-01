require('dotenv').config();
const express = require("express");
const ussdController = require("./ussd/ussdController");
const bcrypt = require('bcryptjs');
const africastalking = require('africastalking');
const { Pool } = require('pg');  // For pool, but import from sessionStore if preferred

// DB pool (from sessionStore.js or redefine here)
const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
    ssl: false,
});

// AfricasTalking setup for SMS
const at = africastalking({
    apiKey: process.env.AT_API_KEY,
    username: process.env.AT_USERNAME,
});

const sms = at.SMS;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Test route
app.get("/api/test", (req, res) => {
    res.send("Testing Server");
});

// SMS handler (existing)
app.post("/incoming-sms", async (req, res) => {
    const { from, text, to, date, id } = req.body;

    if (!from || !text) {
        console.error("Invalid SMS webhook data:", req.body);
        return res.status(400).json({ status: "error", message: "Invalid data" });
    }

    console.log("Received SMS:", { from, text, to, date, id });

    const responseMessage = processMessage(from, text);  // Your existing function

    try {
        await sms.send({
            to: [from],
            message: responseMessage,
            from: process.env.AT_SHORTCODE || 'SMARTRETAIL'
        });
        res.status(200).json({ status: "success", message: "Response sent" });
    } catch (error) {
        console.error("Failed to send SMS response:", error);
        res.status(500).json({ status: "error", message: "Failed to send response" });
    }
});

// USSD handler (existing)
app.post("/ussd", ussdController);

// --- NEW API Routes for Frontend Integration ---

// Middleware: Simple token auth (for demo; replace with JWT.verify in prod)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied' });

    // For demo: just check if token exists (real: verify JWT)
    next();
};

// Auth: Login
// ────────────────────────────────────────────────
// Seller Login for Dashboard (real DB check)
// ────────────────────────────────────────────────

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM admin_users WHERE email = $1',
            [email.trim().toLowerCase()]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // For hackathon/demo: plain password comparison
        // In real production: use bcrypt.compare(password, user.password_hash)
        if (!await bcrypt.compare(password, user.password_hash)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Simple token for demo (later replace with JWT)
        const token = `seller-token-${Date.now()}-${user.id}`;

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name || 'Seller'
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// Auth: Register (optional, for adding sellers)
app.post("/api/auth/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);  // Real hashing
        await pool.query(
            "INSERT INTO admin_users (name, email, password_hash) VALUES ($1, $2, $3)",
            [name, email, hashedPassword]
        );
        res.status(201).json({ message: "User registered" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Dashboard: Stats
app.get("/api/dashboard/stats", authenticateToken, async (req, res) => {
    try {
        const totalCustomers = await pool.query("SELECT COUNT(*) FROM users");
        const todaySales = await pool.query(
            "SELECT SUM(amount_tzs) FROM transactions WHERE type = 'PURCHASE' AND created_at::date = CURRENT_DATE"
        );

        res.json({
            totalCustomers: parseInt(totalCustomers.rows[0].count) || 0,
            todaySales: parseInt(todaySales.rows[0].sum) || 0,
        });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Customers: Get all (from users table)
app.get("/api/customers", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT phone_number AS id, name, phone_number AS phone, points_balance AS points FROM users"
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Customers: Get by ID (phone_number)
app.get("/api/customers/:id", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT phone_number AS id, name, phone_number AS phone, points_balance AS points FROM users WHERE phone_number = $1",
            [req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Customer not found" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Sales: Create (add transaction, earn points)
app.post("/api/sales", authenticateToken, async (req, res) => {
    const { customerId, amount } = req.body;  // customerId = phone_number

    if (!customerId || !amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid data" });
    }

    try {
        const pointsEarned = Math.floor(amount / 1000);  // 1 point per 1000 TZS (tune for profit)

        // Add transaction
        await pool.query(
            `INSERT INTO transactions (phone_number, type, amount_tzs, points_change, description, quantity, total_before_points, location)
             VALUES ($1, 'PURCHASE', $2, $3, 'Sale via dashboard', 1, $2, 'Dashboard')`,
            [customerId, amount, pointsEarned]
        );

        // Update customer points and total spent
        await pool.query(
            `UPDATE users SET points_balance = points_balance + $1, total_spent_tzs = total_spent_tzs + $2 WHERE phone_number = $3`,
            [pointsEarned, amount, customerId]
        );

        res.status(201).json({ message: "Sale recorded", pointsAdded: pointsEarned });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// SMS: Get groups (dynamic based on loyalty criteria)
app.get("/api/sms/groups", authenticateToken, (req, res) => {
    // Predefined groups with descriptions (dynamic queries in send)
    const groups = [
        { id: 'vip', name: 'VIP Customers', description: 'Customers with 2000+ points' },
        { id: 'regular', name: 'Regular Customers', description: 'All active customers' },
        { id: 'new', name: 'New Customers', description: 'Joined this month' },
        { id: 'high_spenders', name: 'High Spenders', description: 'Top 20% by total spent' },
    ];
    res.json(groups);
});

// SMS: Send to group
app.post("/api/sms/send", authenticateToken, async (req, res) => {
    const { groupId, message } = req.body;

    if (!groupId || !message) {
        return res.status(400).json({ error: "Group and message required" });
    }

    try {
        let phonesQuery;
        switch (groupId) {
            case 'vip':
                phonesQuery = "SELECT phone_number FROM users WHERE points_balance >= 2000";
                break;
            case 'regular':
                phonesQuery = "SELECT phone_number FROM users";
                break;
            case 'new':
                phonesQuery = "SELECT phone_number FROM users WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)";
                break;
            case 'high_spenders':
                phonesQuery = "SELECT phone_number FROM users ORDER BY total_spent_tzs DESC LIMIT (SELECT COUNT(*) FROM users) / 5";
                break;
            default:
                return res.status(400).json({ error: "Invalid group" });
        }

        const result = await pool.query(phonesQuery);
        const phones = result.rows.map(row => row.phone_number);

        if (phones.length === 0) {
            return res.status(400).json({ error: "No customers in group" });
        }

        await sms.send({
            to: phones,
            message: message,
            from: process.env.AT_SHORTCODE || 'SMARTRETAIL'
        });

        res.json({ message: "SMS sent to group" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});


// ────────────────────────────────────────────────
// Seller Login for Dashboard (real DB check)
// ────────────────────────────────────────────────

// Global error handler (existing or add)
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});