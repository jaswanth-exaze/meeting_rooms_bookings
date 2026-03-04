const app = require("./app");
const { port } = require("./config/env");
const { pool, query } = require("./config/db");
const logger = require("./utils/logger");

async function startServer() {
  try {
    await query("SELECT 1");
    app.listen(port, () => {
      logger.info("server_started", { port });
    });
  } catch (error) {
    logger.error("server_start_failed", {
      message: "Failed to start server. Check database connection settings.",
      error_message: error?.message || "Unknown error"
    });
    process.exit(1);
  }
}

process.on("unhandledRejection", reason => {
  logger.error("unhandled_rejection", {
    error_message: reason instanceof Error ? reason.message : String(reason || "Unknown reason")
  });
});

process.on("uncaughtException", error => {
  logger.error("uncaught_exception", {
    error_message: error?.message || "Unknown error",
    stack: error?.stack
  });
  process.exit(1);
});

process.on("SIGINT", async () => {
  await pool.end().catch(() => undefined);
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await pool.end().catch(() => undefined);
  process.exit(0);
});

startServer();
