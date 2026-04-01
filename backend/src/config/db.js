// Create the shared MySQL connection pool and query helper.

const mysql = require("mysql2/promise");
const { db } = require("./env");

const pool = mysql.createPool({
  host: db.host,
  port: db.port,
  user: db.user,
  password: db.password,
  database: db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "Z"
});

// Execute a parameterized SQL query using the shared connection pool.
async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

module.exports = { pool, query };
