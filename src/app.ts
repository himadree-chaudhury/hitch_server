import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import httpStatus from "http-status-codes";
import morgan from "morgan";
import passport from "passport";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import { paymentController } from "./app/modules/v1/payment/payment.controller";
import { router } from "./app/routes";

const app = express();
app.use(morgan("dev"));


app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleStripeWebhookEvent
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


app.use(
  cors({
    origin: ["http://localhost:5000", "https://hitch-client.vercel.app"],
    credentials: true,
  })
);

app.use(passport.initialize());

app.use("/api/v1", router);

app.get("/api/v1/health", (req: Request, res: Response) => {
  res.send("Welcome to Hitch API Portal!");
});

app.use(globalErrorHandler);

app.use((req: Request, res: Response) => {
  res.status(httpStatus.NOT_FOUND).json({
    status: false,
    message: "Route Not Found",
  });
});

export default app;
