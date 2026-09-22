import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import {
  createOtp,
  createUser,
  deleteOtp,
  findOtp,
  findUserByEmail,
  verifyUser
} from "../repository/auth.repository.js";
import { sendEmail } from "../../../common/email/send-email.js";

function makeError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

async function createAndSendOtp(email) {
  await deleteOtp(email);

  const value = generateOtp();

  await createOtp({
    email,
    value,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000)
  });

  await sendEmail({
    to: email,
    subject: "Verify your account",
    html: `<h2>Your verification code is ${value}</h2>`
  });
}

export async function register(userData) {
  const email = userData.email.trim().toLowerCase();
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw makeError("User already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const user = await createUser({
    ...userData,
    email,
    password: hashedPassword
  });

  await createAndSendOtp(email);

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
    throw makeError("Invalid or expired OTP", 400);
  }

  const user = await findUserByEmail(email);

  if (!user) {
    throw makeError("User not found", 404);
  }

  if (user.isVerified) {
    throw makeError("Account is already verified", 400);
  }

  await verifyUser(email);
  await deleteOtp(email);
}

export async function login({ email, password }) {
  email = email.trim().toLowerCase();

  const user = await findUserByEmail(email);

  if (!user) {
    throw makeError("Invalid email or password", 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw makeError("Invalid email or password", 401);
  }

  if (!user.isVerified) {
    throw makeError("Please verify your email first", 403);
  }

  if (user.isDeleted) {
    throw makeError("Account is not available", 403);
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
    throw makeError("User not found", 404);
  }

  if (user.isVerified) {
    throw makeError("Account is already verified", 400);
  }

  await createAndSendOtp(email);
}
