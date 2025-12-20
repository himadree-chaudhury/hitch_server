import { Router } from "express";
import { authRouter } from "../modules/v1/auth/auth.route";
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
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
