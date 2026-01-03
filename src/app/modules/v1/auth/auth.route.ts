import { Router } from "express";
import passport from "passport";
import { checkAuth } from "../../../middlewares/checkAuth";
import { validateRequest } from "../../../middlewares/validateRequest";
import { UserRole } from "../../../types/user.type";
import { authController } from "./auth.controller";
import {
  authValidationSchema,
  changePasswordSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
  verifyAccountSchema,
} from "./auth.validation";

export const authRouter = Router();

authRouter.post(
  "/login",
  validateRequest(authValidationSchema),
  authController.credentialLogin
);

authRouter.get("/refresh-token", authController.getNewAccessToken);

authRouter.post(
  "/logout",
  checkAuth(...Object.values(UserRole)),
  authController.logout
);

authRouter.post(
  "/change-password",
  checkAuth(...Object.values(UserRole)),
  validateRequest(changePasswordSchema),
  authController.changePassword
);

authRouter.post(
  "/forget-password",
  validateRequest(forgetPasswordSchema),
  authController.forgetPassword
);

authRouter.post(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  authController.resetPassword
);

authRouter.post(
  "/verify-request",
  checkAuth(...Object.values(UserRole)),
  authController.verifyRequest
);

authRouter.post(
  "/verify-account",
  checkAuth(...Object.values(UserRole)),
  validateRequest(verifyAccountSchema),
  authController.verifyAccount
);

authRouter.get("/google", authController.googleLogin);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  authController.googleCallback
);
