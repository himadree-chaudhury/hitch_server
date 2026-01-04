import { Router } from "express";
import { multerConfig } from "../../../configs/multer";
import { checkAuth } from "../../../middlewares/checkAuth";
import { validateRequest } from "../../../middlewares/validateRequest";
import { UserRole } from "../../../types/user.type";
import { eventController } from "./event.controller";
import {
  changeStatusSchema,
  createEventSchema,
  eventReviewSchema,
  updateEventSchema,
} from "./event.validation";

export const eventRouter = Router();

eventRouter.get("/", eventController.getAllEvents);
eventRouter.get("/:slug", eventController.getEventDetails);

eventRouter.post(
  "/create",
  checkAuth(UserRole.HOST, UserRole.ADMIN),
  multerConfig.single("image"),
  validateRequest(createEventSchema),
  eventController.createEvent
);
eventRouter.patch(
  "/update/:slug",
  checkAuth(UserRole.HOST, UserRole.ADMIN),
  multerConfig.single("image"),
  validateRequest(updateEventSchema),
  eventController.updateEvent
);

eventRouter.post(
  "/join/:slug",
  checkAuth(UserRole.USER),
  eventController.joinEvent
);

eventRouter.post(
  "/leave/:slug",
  checkAuth(UserRole.USER),
  eventController.leaveEvent
);

eventRouter.post(
  "/review/:slug",
  checkAuth(UserRole.USER),
  validateRequest(eventReviewSchema),
  eventController.reviewEvent
);

eventRouter.patch(
  "/status/:slug",
  checkAuth(UserRole.HOST, UserRole.ADMIN),
  validateRequest(changeStatusSchema),
  eventController.changeStatus
);
