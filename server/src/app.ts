import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { UPLOADS_ROOT } from "./utils/profileImage.js";
import authRoutes from "./routes/auth.routes.js";
import doctorRoutes from "./routes/doctors.routes.js";
import patientRoutes from "./routes/patients.routes.js";
import scheduleRoutes from "./routes/schedules.routes.js";
import appointmentRoutes from "./routes/appointments.routes.js";
import notificationRoutes from "./routes/notifications.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import employeeRoutes from "./routes/employees.routes.js";
import { errorHandler } from "./middleware/error.js";

const app = express();

import { getAllowedOrigins, verifyOrigin } from "./utils/security.js";

const allowedOrigins = getAllowedOrigins(process.env.TRUSTED_ORIGINS ?? process.env.CLIENT_URL, "http://localhost:5173");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts. Please try again later." },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      if (verifyOrigin(origin, allowedOrigins)) {
        callback(null, true);
        return;
      }
      callback(new Error("CORS policy does not allow this origin"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use("/uploads", express.static(UPLOADS_ROOT));
app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "DentFlow API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/employees", employeeRoutes);

app.use(errorHandler);

export default app;
