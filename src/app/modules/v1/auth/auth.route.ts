import { Router } from "express";
import { checkAuth } from "../../../middlewares/checkAuth";
import { validateRequest } from "../../../middlewares/validateRequest";
import { UserRole } from "../../../types/user.type";
import { authController } from "./auth.controller";
import { authValidationSchema } from "./auth.validation";

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
