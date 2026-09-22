import { Router } from "express";
import * as authController from "./controller/auth.controller.js";

const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/verify-email", authController.verifyEmail);
authRouter.post("/login", authController.login);
authRouter.post("/resend-otp", authController.resendOtp);

export default authRouter;
