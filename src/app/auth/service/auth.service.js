import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import {
  createOtp,
  createUser,
  deleteOtp,
  findOtp,
  findUserByEmail,
  findUserByGoogleId,
  updateUserPassword,
  verifyUser
} from "../repository/auth.repository.js";
import { sendEmail } from "../../../common/email/send-email.js";
import { AppError } from "../../../common/error/app-error.js";
import { invalidateProfile } from "../../../common/lib/cache/cache.js";

const googleClient = new OAuth2Client();

export async function googleLogin({ idToken }) {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new AppError("Google login is not configured", 503);
  }

  let payload;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    payload = ticket.getPayload();
  } catch {
    throw new AppError("Invalid Google ID token", 401);
  }

  if (!payload?.sub || !payload.email || !payload.email_verified) {
    throw new AppError("Google email is not verified", 401);
  }

  let user = await findUserByGoogleId(payload.sub);

  if (!user) {
    const email = payload.email.trim().toLowerCase();
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      throw new AppError("Please use your existing login method", 409);
    }

    const googleName = (payload.name || "Google user").trim();

    user = await createUser({
      name: googleName.length >= 3 ? googleName.slice(0, 20) : "Google user",
      email,
      googleId: payload.sub,
      provider: "Google",
      isVerified: true
    });
  }

  if (user.isDeleted) {
    throw new AppError("Account is not available", 403);
  }

  return jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}

function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

async function createAndSendOtp(email, subject) {
  await deleteOtp(email);

  const value = generateOtp();

  await createOtp({
    email,
    value,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000)
  });

  await sendEmail({
    to: email,
    subject,
    html: `<h2>Your code is ${value}</h2>`
  });
}

export async function register(userData) {
  const email = userData.email.trim().toLowerCase();
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new AppError("User already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const user = await createUser({
    ...userData,
    email,
    password: hashedPassword
  });

  await createAndSendOtp(email, "Verify your account");

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    isVerified: user.isVerified
  };
}

export async function verifyEmail({ email, otp }) {
  email = email.trim().toLowerCase();

  const otpDocument = await findOtp(email, otp);

  if (!otpDocument || otpDocument.expiresAt < new Date()) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isVerified) {
    throw new AppError("Account is already verified", 400);
  }

  await verifyUser(email);
  await deleteOtp(email);
}

export async function login({ email, password }) {
  email = email.trim().toLowerCase();

  const user = await findUserByEmail(email);

  if (!user || user.provider !== "local" || !user.password) {
    throw new AppError("Invalid email or password", 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isVerified) {
    throw new AppError("Please verify your email first", 403);
  }

  if (user.isDeleted) {
    throw new AppError("Account is not available", 403);
  }

  return jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}

export async function resendOtp(email) {
  email = email.trim().toLowerCase();

  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isVerified) {
    throw new AppError("Account is already verified", 400);
  }

  await createAndSendOtp(email, "Verify your account");
}

export async function sendResetOtp(email) {
  email = email.trim().toLowerCase();

  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.isVerified) {
    throw new AppError("Please verify your email first", 403);
  }

  await createAndSendOtp(email, "Reset your password");
}

export async function resetPassword({ email, otp, newPassword }) {
  email = email.trim().toLowerCase();

  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.isVerified) {
    throw new AppError("Please verify your email first", 403);
  }

  const otpDocument = await findOtp(email, otp);

  if (!otpDocument || otpDocument.expiresAt < new Date()) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await updateUserPassword(email, hashedPassword);
  await invalidateProfile(user._id);
  await deleteOtp(email);
}
