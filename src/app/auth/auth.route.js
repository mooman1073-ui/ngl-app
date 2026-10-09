import { Router } from "express";
import * as authController from "./controller/auth.controller.js";
import {
  googleLoginDTO,
  loginDTO,
  registerDTO,
  resendOtpDTO,
  resetPasswordDTO,
  sendResetOtpDTO,
  verifyEmailDTO
} from "./dto/auth.dto.js";
import { validateBody } from "../../common/validation/validation.js";

const authRouter = Router();

authRouter.post("/register", validateBody(registerDTO), authController.register);
authRouter.post("/verify-email", validateBody(verifyEmailDTO), authController.verifyEmail);
authRouter.post("/login", validateBody(loginDTO), authController.login);
authRouter.post("/google-login", validateBody(googleLoginDTO), authController.googleLogin);
authRouter.post("/resend-otp", validateBody(resendOtpDTO), authController.resendOtp);
authRouter.post("/send-reset-otp", validateBody(sendResetOtpDTO), authController.sendResetOtp);
authRouter.patch("/reset-password", validateBody(resetPasswordDTO), authController.resetPassword);

export default authRouter;
