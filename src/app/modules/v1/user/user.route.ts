import { Router } from "express";
import { checkAuth } from "../../../middlewares/checkAuth";
import { validateRequest } from "../../../middlewares/validateRequest";
import { UserRole } from "../../../types/user.type";
import { userController } from "./user.controller";
import {
  userProfileValidationSchema,
  userValidationSchema,
} from "./user.validation";

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

userRouter.get(
  "/profile",
  checkAuth(...Object.values(UserRole)),
  userController.getUserProfile
);

userRouter.put(
  "/profile",
  checkAuth(...Object.values(UserRole)),
  validateRequest(userProfileValidationSchema),
  userController.updateUserProfile
);
