import { Router } from "express";
import { checkAuth } from "../../../middlewares/checkAuth";
import { validateRequest } from "../../../middlewares/validateRequest";
import { UserRole } from "../../../types/user.type";
import { eventController } from "./event.controller";
import {
  changeStatusSchema,
  createEventSchema,
  eventReviewSchema,
} from "./event.validation";

export const eventRouter = Router();

eventRouter.get("/", eventController.getAllEvents);
eventRouter.get("/:slug", eventController.getEventDetails);

eventRouter.post(
  "/",
  checkAuth(UserRole.HOST, UserRole.ADMIN),
  validateRequest(createEventSchema),
  eventController.createEvent
);

eventRouter.post(
  "/:slug/join",
  checkAuth(UserRole.USER),
  eventController.joinEvent
);

eventRouter.post(
  "/:slug/leave",
  checkAuth(UserRole.USER),
  eventController.leaveEvent
);

eventRouter.post(
  "/:slug/review",
  checkAuth(UserRole.USER),
  validateRequest(eventReviewSchema),
  eventController.reviewEvent
);

eventRouter.patch(
  "/:slug/status",
  checkAuth(UserRole.HOST, UserRole.ADMIN),
  validateRequest(changeStatusSchema),
  eventController.changeStatus
);
