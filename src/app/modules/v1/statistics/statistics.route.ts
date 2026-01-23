import { Router } from "express";
import { checkAuth } from "../../../middlewares/checkAuth";
import { UserRole } from "../../../types/user.type";
import { statisticsController } from "./statistics.controller";

export const statisticsRouter = Router();

statisticsRouter.get(
  "/user",
  checkAuth(UserRole.USER),
  statisticsController.userStatistics,
);

statisticsRouter.get(
  "/host",
  checkAuth(UserRole.HOST),
  statisticsController.hostStatistics,
);

statisticsRouter.get(
  "/admin",
  checkAuth(UserRole.ADMIN),
  statisticsController.adminStatistics,
);
