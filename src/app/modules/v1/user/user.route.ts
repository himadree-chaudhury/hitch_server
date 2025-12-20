import { Router } from "express";
import { checkAuth } from "../../../middlewares/checkAuth";
import { validateRequest } from "../../../middlewares/validateRequest";
import { UserRole } from "../../../types/user.type";
import { userController } from "./user.controller";
import {
  userProfileValidationSchema,
  userValidationSchema,
} from "./user.validation";
import { multerConfig } from "../../../configs/multer";

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

userRouter.patch(
  "/update-profile",
  checkAuth(...Object.values(UserRole)),
  multerConfig.single("profileImage"),
  validateRequest(userProfileValidationSchema),
  userController.updateUserProfile
);
