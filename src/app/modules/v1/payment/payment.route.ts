import { Router } from "express";
import { checkAuth } from "../../../middlewares/checkAuth";
import { UserRole } from "../../../types/user.type";
import { paymentController } from "./payment.controller";

export const paymentRouter = Router();

paymentRouter.post(
  "/success",
  checkAuth(UserRole.USER),
  paymentController.verifyPayment
);
paymentRouter.post(
  "/:paymentId/cancel",
  checkAuth(UserRole.USER),
  paymentController.cancelPayment
);
