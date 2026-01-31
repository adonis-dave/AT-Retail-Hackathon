require('dotenv').config();
const express = require("express");
const ussdController = require("./ussd/ussdController");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/api/test", (req, res) => {
    res.send("Testing Server");
});

// sms handler
app.post("/incoming-sms", async (req, res) => {
    const { from, text, to, date, id } = req.body;

    if (!from || !text) {
        console.error("Invalid SMS webhook data:", req.body);
        return res.status(400).json({ status: "error", message: "Invalid data" });
    }

    console.log("Received SMS:", { from, text, to, date, id });

    const responseMessage = processMessage(from, text);

    try {
        await premiumSMS(from, responseMessage);
        res.status(200).json({ status: "success", message: "Response sent" });
    } catch (error) {
        console.error("Failed to send SMS response:", error);
        res.status(500).json({ status: "error", message: "Failed to send response" });
    }
});


app.post("/ussd", ussdController);


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`USSD Server running on http://localhost:${PORT}`);
});
