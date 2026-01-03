import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { asyncTryCatch } from "../../../utils/asyncTryCatch";
import { genericResponse } from "../../../utils/genericResponse";
import { hostService } from "./host.service";

const requestToBeHost = asyncTryCatch(async (req: Request, res: Response) => {
  const userEmail = req.authUser.email;
  const response = await hostService.requestToBeHost(userEmail);
  genericResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "Account verified successfully.",
    data: response,
  });
});

const toggleHostRole = asyncTryCatch(async (req: Request, res: Response) => {
  const email = req.params.email;
  const result = await hostService.toggleHostRole(email);
  genericResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "Host role changed successfully.",
    data: result,
  });
});

export const hostController = {
  requestToBeHost,
  toggleHostRole,
};
