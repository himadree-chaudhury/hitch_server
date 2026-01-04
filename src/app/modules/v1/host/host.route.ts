import { Router } from "express";
import { checkAuth } from "../../../middlewares/checkAuth";
import { UserRole } from "../../../types/user.type";
import { hostController } from "./host.controller";

export const hostRouter = Router();

hostRouter.get("/profile/:hostId", hostController.getHostProfile);

hostRouter.get(
  "/request",
  checkAuth(UserRole.USER),
  hostController.requestToBeHost
);

hostRouter.put(
  "/toggle-role/:email",
  checkAuth(UserRole.ADMIN),
  hostController.toggleHostRole
);
