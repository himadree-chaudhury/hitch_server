import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { asyncTryCatch } from "../../../utils/asyncTryCatch";
import { genericResponse } from "../../../utils/genericResponse";
import { hostService } from "./host.service";

const requestToBeHost = asyncTryCatch(async (req: Request, res: Response) => {
  const userEmail = req.authUser.email;
  await hostService.requestToBeHost(userEmail);
  genericResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "Account verified successfully.",
  });
});

const toggleHostRole = asyncTryCatch(async (req: Request, res: Response) => {
  const email = req.params.email;
  await hostService.toggleHostRole(email);
  genericResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "Host role toggled successfully.",
  });
});

export const hostController = {
  requestToBeHost,
  toggleHostRole,
};
