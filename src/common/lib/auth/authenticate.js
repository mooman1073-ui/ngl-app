import jwt from "jsonwebtoken";
import { AppError } from "../../error/app-error.js";

export function authenticate(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return next(new AppError("Please log in first", 401));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (typeof payload !== "object" || typeof payload.userId !== "string") {
      throw new Error("Invalid user ID");
    }

    req.userId = payload.userId;
    next();
  } catch {
    next(new AppError("Invalid or expired login token", 401));
  }
}
