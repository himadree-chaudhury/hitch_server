import { Router } from "express";
import { authRouter } from "../modules/v1/auth/auth.route";
import { eventRouter } from "../modules/v1/event/event.route";
import { hostRouter } from "../modules/v1/host/host.route";
import { paymentRouter } from "../modules/v1/payment/payment.route";
import { statisticsRouter } from "../modules/v1/statistics/statistics.route";
import { userRouter } from "../modules/v1/user/user.route";

export const router = Router();

const moduleRoutes = [
  {
    path: "/user",
    route: userRouter,
  },
  {
    path: "/auth",
    route: authRouter,
  },
  {
    path: "/host",
    route: hostRouter,
  },
  {
    path: "/event",
    route: eventRouter,
  },
  {
    path: "/payment",
    route: paymentRouter,
  },
  {
    path: "/stat",
    route: statisticsRouter,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
