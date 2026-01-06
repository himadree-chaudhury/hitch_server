import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { asyncTryCatch } from "../../../utils/asyncTryCatch";
import { genericResponse } from "../../../utils/genericResponse";
import { hostService } from "./host.service";

const getHostProfile = asyncTryCatch(async (req: Request, res: Response) => {
  const userId = req.params.hostId;
  const hostProfile = await hostService.getHostProfile(userId);
  genericResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "Host profile retrieved successfully",
    data: hostProfile,
  });
});

const requestToBeHost = asyncTryCatch(async (req: Request, res: Response) => {
  const userEmail = req.authUser.email;
  const response = await hostService.requestToBeHost(userEmail);
  genericResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "Request to be a host submitted successfully.",
    data: response,
  });
});

const toggleHostRole = asyncTryCatch(async (req: Request, res: Response) => {
  const hostId = req.params.hostId;
  const result = await hostService.toggleHostRole(hostId);
  genericResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "Host role changed successfully.",
    data: result,
  });
});

const reviewHost = asyncTryCatch(async (req: Request, res: Response) => {
  const userId = req.authUser!.id;
  const  slug  = req.params.slug; 

  const result = await hostService.reviewHost(userId, slug, req.body);

  genericResponse(res, {
    success: true,
    status: httpStatus.CREATED,
    message: "Host reviewed successfully",
    data: result,
  });
});

export const hostController = {
  getHostProfile,
  requestToBeHost,
  toggleHostRole,
  reviewHost,
};
