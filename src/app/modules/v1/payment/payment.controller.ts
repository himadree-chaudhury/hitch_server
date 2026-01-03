import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { asyncTryCatch } from "../../../utils/asyncTryCatch";
import { genericResponse } from "../../../utils/genericResponse";
import { paymentService } from "./payment.service";

const verifyPayment = asyncTryCatch(async (req: Request, res: Response) => {
  // This expects the client to send the paymentIntentId after Stripe confirms on frontend
  const result = await paymentService.confirmPaymentSuccess(
    req.body.paymentIntentId
  );
  genericResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "Payment verified successfully",
  });
});

const cancelPayment = asyncTryCatch(async (req: Request, res: Response) => {
  const result = await paymentService.cancelPayment(
    (req as any).user.id,
    req.params.paymentId
  );
  genericResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: result.message,
  });
});

export const paymentController = {
  verifyPayment,
  cancelPayment,
};
