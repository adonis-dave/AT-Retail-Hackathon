require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: String(process.env.PG_PASSWORD),
    port: Number(process.env.PG_PORT),
    ssl: false,
});

async function getSession(sessionId) {
    const result = await pool.query(
        "SELECT * FROM ussd_sessions WHERE session_id = $1",
        [sessionId]
    );
    return result.rows[0] || null;
}

async function createSession(sessionId, phoneNumber, state, data = {}) {
    await pool.query(
        `INSERT INTO ussd_sessions(session_id, phone_number, state, data)
     VALUES($1,$2,$3,$4)
     ON CONFLICT (session_id) DO NOTHING`,
        [sessionId, phoneNumber, state, data]
    );
}

async function updateSession(sessionId, state, data = {}) {
    await pool.query(
        `UPDATE ussd_sessions 
     SET state=$2, data=$3, updated_at=NOW()
     WHERE session_id=$1`,
        [sessionId, state, data]
    );
}

async function deleteSession(sessionId) {
    await pool.query("DELETE FROM ussd_sessions WHERE session_id=$1", [
        sessionId,
    ]);
}

module.exports = {
    getSession,
    createSession,
    updateSession,
    deleteSession,
};
