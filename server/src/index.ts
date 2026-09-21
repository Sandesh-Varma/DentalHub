import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { setNotificationIo } from "./services/notification.service.js";
import { verifyToken } from "./lib/jwt.js";

const port = Number(process.env.PORT) || 5000;
import { getAllowedOrigins, verifyOrigin } from "./utils/security.js";

const allowedOrigins = getAllowedOrigins(process.env.TRUSTED_ORIGINS ?? process.env.CLIENT_URL, "http://localhost:5173");

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "replace_with_a_long_random_secret") {
  console.warn("JWT_SECRET is not configured securely. Set a strong secret in server/.env before production use.");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required. Provide it in server/.env");
}

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (verifyOrigin(origin, allowedOrigins)) {
        callback(null, true);
        return;
      }
      callback(new Error("CORS policy does not allow this origin"));
    },
    credentials: true,
  },
});

setNotificationIo(io);

io.use((socket, next) => {
  const token = socket.handshake.auth?.token as string | undefined;
  if (!token) return next(new Error("Authentication required"));
  try {
    const user = verifyToken(token);
    socket.data.user = user;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.data.user?.userId as string;
  if (userId) socket.join(`user:${userId}`);
});

server.listen(port, () => {
  console.log(`DentFlow API running on http://localhost:${port}`);
  import("./services/email.service.js").then(({ isEmailConfigured }) => {
    console.log(
      isEmailConfigured()
        ? "SMTP email: configured"
        : "SMTP email: NOT configured (add SMTP_* to server/.env)"
    );
  });
});
