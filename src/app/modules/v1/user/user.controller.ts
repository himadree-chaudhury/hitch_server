import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { asyncTryCatch } from "../../../utils/asyncTryCatch";
import { genericResponse } from "../../../utils/genericResponse";
import { userService } from "./user.service";

const credentialRegister = asyncTryCatch(
  async (req: Request, res: Response) => {
    await userService.credentialRegister(req.body);
    genericResponse(res, {
      success: true,
      status: httpStatus.CREATED,
      message: "User registered successfully",
      data: null,
    });
  }
);

const getAllUsers = asyncTryCatch(async (req: Request, res: Response) => {
  res.send("Get All Users");
});

const getUser = asyncTryCatch(async (req: Request, res: Response) => {
  const email = req?.authUser?.email;
  const user = await userService.getUser(email);
  genericResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "User retrieved successfully",
    data: user,
  });
});

export const userController = {
  credentialRegister,
  getAllUsers,
  getUser,
};
