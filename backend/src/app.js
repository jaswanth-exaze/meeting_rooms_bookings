const express = require("express");
const path = require("path");
const cors = require("cors");
const { corsOrigins, isProduction } = require("./config/env");
const authRoutes = require("./routes/auth.routes");
const employeeRoutes = require("./routes/employee.routes");
const locationRoutes = require("./routes/location.routes");
const roomRoutes = require("./routes/room.routes");
const bookingRoutes = require("./routes/booking.routes");
const adminRoutes = require("./routes/admin.routes");
const requestLogger = require("./middleware/requestLogger");
const securityHeaders = require("./middleware/securityHeaders");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");

const app = express();

app.use(requestLogger);
app.use(securityHeaders);

const allowedOrigins = new Set(corsOrigins);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (!isProduction && origin === "null") {
        return callback(null, true);
      }

      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      logger.warn("cors_blocked", { origin });
      const corsError = new Error("Origin is not allowed by CORS policy.");
      corsError.status = 403;
      return callback(corsError);
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use("/frontend", express.static(path.join(__dirname, "..", "..", "frontend")));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
