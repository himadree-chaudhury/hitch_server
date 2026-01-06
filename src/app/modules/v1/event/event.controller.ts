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
  const result = await eventService.getEventDetails(req.params.slug);
  genericResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "Event details",
    data: result,
  });
});

const changeStatus = asyncTryCatch(async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const hostId = req?.authUser?.id;
  const result = await eventService.changeEventStatus(
    hostId,
    slug,
    req.body.status
  );
  genericResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "Event status updated successfully",
    data: result,
  });
});

const joinEvent = asyncTryCatch(async (req: Request, res: Response) => {
  const userId = req?.authUser?.id;
  const slug = req.params.slug;
  const result = await eventService.joinEvent(userId, slug);
  genericResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "Successfully joined the event",
    data: result,
  });
});

const leaveEvent = asyncTryCatch(async (req: Request, res: Response) => {
  const userId = req?.authUser?.id;
  const slug = req.params.slug;
  const result = await eventService.leaveEvent(userId, slug);
  genericResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "Successfully left the event",
    data: result,
  });
});

const reviewEvent = asyncTryCatch(async (req: Request, res: Response) => {
  const userId = req.authUser?.id;
  const slug = req.params.slug;
  const result = await eventService.reviewEvent(userId, slug, req.body);
  genericResponse(res, {
    success: true,
    status: httpStatus.CREATED,
    message: "Event reviewed successfully",
    data: result,
  });
});

export const eventController = {
  createEvent,
  updateEvent,
  getAllEvents,
  getEventDetails,
  changeStatus,
  joinEvent,
  leaveEvent,
  reviewEvent,
};
