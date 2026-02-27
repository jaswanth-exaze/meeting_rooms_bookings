const app = require("./app");
const { port } = require("./config/env");
const { pool, query } = require("./config/db");

async function startServer() {
  try {
    await query("SELECT 1");
    app.listen(port, () => {
      console.log(`Backend API running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server. Check database connection settings.", error.message);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  await pool.end();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await pool.end();
  process.exit(0);
});

startServer();
