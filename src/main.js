import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./app/auth/auth.route.js";
import { connectDB } from "./common/db/mongoose.js";
import { logger } from "./common/logger/logger.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);

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

app.listen(port, () => {
  logger.info(`Server is running on http://localhost:${port}`);
});
