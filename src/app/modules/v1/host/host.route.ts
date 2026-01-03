import { Router } from "express";
import { checkAuth } from "../../../middlewares/checkAuth";
import { UserRole } from "../../../types/user.type";
import { hostController } from "./host.controller";

export const hostRouter = Router();

hostRouter.get(
  "/request-to-be-host",
  checkAuth(...Object.values(UserRole)),
  hostController.requestToBeHost
);


hostRouter.put("/toggle-host-role/:email",
  checkAuth(UserRole.ADMIN),
  hostController.toggleHostRole
);