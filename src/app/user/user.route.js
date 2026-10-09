import { Router } from "express";
import { authenticate } from "../../common/lib/auth/authenticate.js";
import { withCache } from "../../common/lib/cache/with-cache.js";
import { getProfile } from "./controller/user.controller.js";

const userRouter = Router();

userRouter.get(
  "/me",
  authenticate,
  withCache((req) => `ngl:profile:${req.userId}`),
  getProfile
);

export default userRouter;
