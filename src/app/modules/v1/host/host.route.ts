import { Router } from "express";
import { checkAuth } from "../../../middlewares/checkAuth";
import { UserRole } from "../../../types/user.type";
import { hostController } from "./host.controller";
import { validateRequest } from "../../../middlewares/validateRequest";
import { reviewHostSchema } from "./host.validation";

export const hostRouter = Router();

hostRouter.get("/profile/:hostId", hostController.getHostProfile);

hostRouter.get(
  "/request",
  checkAuth(UserRole.USER),
  hostController.requestToBeHost
);

hostRouter.patch(
  "/toggle-role/:hostId",
  checkAuth(UserRole.ADMIN),
  hostController.toggleHostRole
);

hostRouter.post(
  "/review/:slug",
  checkAuth(UserRole.USER),
  validateRequest(reviewHostSchema),
  hostController.reviewHost
);
