import { config } from "./common/lib/config/config.js";
import express from "express";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import authRouter from "./app/auth/auth.route.js";
import userRouter from "./app/user/user.route.js";
import { connectDB } from "./common/db/mongoose.js";
import { logger } from "./common/logger/logger.js";
import { connectCache } from "./common/lib/cache/cache.js";

const app = express();
const port = config.port;

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);

if (process.env.NODE_ENV !== "production") {
  app.get("/google-test", (req, res) => {
    res.sendFile(fileURLToPath(new URL("./google-test.html", import.meta.url)));
  });

  app.get("/google-client-id", (req, res) => {
    res.json({ clientId: process.env.GOOGLE_CLIENT_ID });
  });
}

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error, req, res, next) => {
  logger.error(error.message || "Something went wrong");

  res.status(error.statusCode || 500).json({
    message: error.message || "Something went wrong"
  });
});

await connectDB();
await connectCache();

app.listen(port, () => {
  logger.info(`Server is running on http://localhost:${port}`);
});
