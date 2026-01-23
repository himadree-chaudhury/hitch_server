import { Router } from "express";
import { checkAuth } from "../../../middlewares/checkAuth";
import { validateRequest } from "../../../middlewares/validateRequest";
import { UserRole } from "../../../types/user.type";
import { hostController } from "./host.controller";
import { reviewHostSchema } from "./host.validation";

export const hostRouter = Router();

hostRouter.get("", checkAuth(UserRole.ADMIN), hostController.getAllHosts);

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
