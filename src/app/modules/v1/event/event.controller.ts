import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { asyncTryCatch } from "../../../utils/asyncTryCatch";
import { genericResponse } from "../../../utils/genericResponse";
import { eventService } from "./event.service";

const createEvent = asyncTryCatch(async (req: Request, res: Response) => {
  const hostId = req?.authUser?.id;
  const imageUrl = req.file?.path;
  const result = await eventService.createEvent(hostId, {
    ...req.body,
    imageUrl,
  });
  genericResponse(res, {
    success: true,
    status: httpStatus.CREATED,
    message: "Event created successfully.",
    data: result,
  });
});

const updateEvent = asyncTryCatch(async (req: Request, res: Response) => {
  const hostId = req?.authUser?.id;
  const imageUrl = req.file?.path;
  const result = await eventService.updateEvent(hostId, req.params.slug, {
    ...req.body,
    ...(imageUrl && { imageUrl }),
  });
  genericResponse(res, {
    success: true,
    status: httpStatus.CREATED,
    message: "Event updated successfully.",
    data: result,
  });
});

const getAllEvents = asyncTryCatch(async (req: Request, res: Response) => {
  const result = await eventService.getAllEvents(req.query);
  genericResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "Events fetched",
    data: result,
  });
});

const getEventDetails = asyncTryCatch(async (req: Request, res: Response) => {
  const result = await eventService.getEventDetails(req.params.id);
  genericResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "Event details",
    data: result,
  });
});

const joinEvent = asyncTryCatch(async (req: Request, res: Response) => {
  const result = await eventService.joinEvent(
    (req as any).user.id,
    req.params.id
  );
  genericResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: result.message,
    data: result,
  });
});

const leaveEvent = asyncTryCatch(async (req: Request, res: Response) => {
  const result = await eventService.leaveEvent(
    (req as any).user.id,
    req.params.id
  );
  genericResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: result.message,
  });
});

const reviewEvent = asyncTryCatch(async (req: Request, res: Response) => {
  const result = await eventService.reviewEvent(
    (req as any).user.id,
    req.params.id,
    req.body
  );
  genericResponse(res, {
    success: true,
    status: httpStatus.CREATED,
    message: result.message,
  });
});

const changeStatus = asyncTryCatch(async (req: Request, res: Response) => {
  const result = await eventService.changeEventStatus(
    (req as any).user.id,
    req.params.id,
    req.body.status
  );
  genericResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: result.message,
  });
});

export const eventController = {
  createEvent,
  updateEvent,
  getAllEvents,
  getEventDetails,
  joinEvent,
  leaveEvent,
  reviewEvent,
  changeStatus,
};
