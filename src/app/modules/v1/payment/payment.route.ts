import { Router } from "express";
import { checkAuth } from "../../../middlewares/checkAuth";
import { UserRole } from "../../../types/user.type";
import { paymentController } from "./payment.controller";

export const paymentRouter = Router();

paymentRouter.get(
  "",
  checkAuth(UserRole.HOST),
  paymentController.getPayments,
);

paymentRouter.get(
  "/success/:paymentId",
  checkAuth(UserRole.HOST),
  paymentController.confirmPaymentSuccess,
);
