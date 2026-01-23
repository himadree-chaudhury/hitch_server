import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { asyncTryCatch } from "../../../utils/asyncTryCatch";
import { genericResponse } from "../../../utils/genericResponse";
import { statisticsService } from "./statistics.service";

const userStatistics = asyncTryCatch(async (req: Request, res: Response) => {
  const userId = req?.authUser?.id;
  const result = await statisticsService.userStatistics(userId);
  genericResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "User statistics retrieved successfully",
    data: result,
  });
});

const hostStatistics = asyncTryCatch(async (req: Request, res: Response) => {
  const userId = req?.authUser?.id;
  const result = await statisticsService.hostStatistics(userId);
  genericResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "Host statistics retrieved successfully",
    data: result,
  });
});

const adminStatistics = asyncTryCatch(async (req: Request, res: Response) => {
  const userId = req?.authUser?.id;
  const result = await statisticsService.adminStatistics();
  genericResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "Admin statistics retrieved successfully",
    data: result,
  });
});

export const statisticsController = {
  hostStatistics,
  userStatistics,
  adminStatistics,
};
