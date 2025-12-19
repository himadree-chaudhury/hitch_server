import { Router } from "express";
import { UserRole } from "../../../db/prisma/generated/prisma";
import { checkAuth } from "../../../middlewares/checkAuth";
import { validateRequest } from "../../../middlewares/validateRequest";
import { userController } from "./user.controller";
import { userValidationSchema } from "./user.validation";

export const userRouter = Router();

userRouter.post(
  "/register",
  validateRequest(userValidationSchema),
  userController.credentialRegister
);
userRouter.get("/", userController.getAllUsers);

userRouter.get(
  "/me",
  checkAuth(...Object.values(UserRole)),
  userController.getUser
);
