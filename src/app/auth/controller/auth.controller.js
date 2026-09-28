import * as authService from "../service/auth.service.js";

export async function register(req, res, next) {
  try {
    const user = await authService.register(req.body);

    res.status(201).json({
      message: "User created successfully. Check your email for the OTP",
      data: user
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    await authService.verifyEmail(req.body);

    res.status(200).json({
      message: "Account verified successfully"
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const token = await authService.login(req.body);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      message: "Login successful"
    });
  } catch (error) {
    next(error);
  }
}

export async function resendOtp(req, res, next) {
  try {
    await authService.resendOtp(req.body.email);

    res.status(200).json({
      message: "OTP sent successfully"
    });
  } catch (error) {
    next(error);
  }
}

export async function sendResetOtp(req, res, next) {
  try {
    await authService.sendResetOtp(req.body.email);

    res.status(200).json({
      message: "Password reset OTP sent successfully"
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    await authService.resetPassword(req.body);

    res.status(200).json({
      message: "Password reset successfully"
    });
  } catch (error) {
    next(error);
  }
}
