import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { envSecrets } from "../../../configs/env";
import { stripe } from "../../../configs/stripe";
import { asyncTryCatch } from "../../../utils/asyncTryCatch";
import { genericResponse } from "../../../utils/genericResponse";
import { paymentService } from "./payment.service";

const handleStripeWebhookEvent = asyncTryCatch(
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = envSecrets.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error("⚠️ Webhook signature verification failed:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
    const result = await paymentService.handleStripeWebhookEvent(event);

    genericResponse(res, {
      success: true,
      status: httpStatus.OK,
      message: "Webhook req send successfully",
      data: result,
    });
  }
);

const confirmPaymentSuccess = asyncTryCatch(
  async (req: Request, res: Response) => {
    const paymentId = req.params.paymentId;
    const result = await paymentService.confirmPaymentSuccess(paymentId);
    genericResponse(res, {
      success: true,
      status: httpStatus.OK,
      message: "Payment verified successfully",
      data: result,
    });
  }
);


export const paymentController = {
  confirmPaymentSuccess,
  handleStripeWebhookEvent,
};
