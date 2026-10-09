import { User } from "../../user/model/user.model.js";
import { OTP } from "../model/otp.model.js";

export function findUserByEmail(email) {
  return User.findOne({ email });
}

export function findUserByGoogleId(googleId) {
  return User.findOne({ googleId, provider: "Google" });
}

export function createUser(userData) {
  return User.create(userData);
}

export function verifyUser(email) {
  return User.findOneAndUpdate(
    { email },
    { isVerified: true },
    { new: true }
  );
}

export function updateUserPassword(email, password) {
  return User.findOneAndUpdate(
    { email },
    { password },
    { new: true }
  );
}

export function findOtp(email, value) {
  return OTP.findOne({ email, value });
}

export function createOtp(otpData) {
  return OTP.create(otpData);
}

export function deleteOtp(email) {
  return OTP.deleteMany({ email });
}
