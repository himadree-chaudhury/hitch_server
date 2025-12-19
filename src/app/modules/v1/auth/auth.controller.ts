import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { asyncTryCatch } from "../../../utils/asyncTryCatch";
import { clearCookies, setCookie } from "../../../utils/cookie";
import { CustomError } from "../../../utils/error";
import { genericResponse } from "../../../utils/genericResponse";
import { authService } from "./auth.service";

const credentialLogin = asyncTryCatch(async (req: Request, res: Response) => {
  const payload = req.body;
  const userTokens = await authService.credentialLogin(payload);

  setCookie(res, userTokens);

  genericResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "Login successful",
    data: userTokens,
  });
});

const getNewAccessToken = asyncTryCatch(async (req: Request, res: Response) => {
  const refreshToken =
    req.headers.authorization?.split(" ")[1] || req.cookies.refreshToken;
  if (!refreshToken) {
    const error = CustomError.badRequest({
      message: "Refresh token is missing",
      errors: ["Refresh token is required to obtain a new access token."],
      hints:
        "Please provide a valid refresh token in the Authorization header or as a cookie.",
    });
    throw error;
  }

  const userTokens = await authService.getNewAccessToken(refreshToken);
  setCookie(res, userTokens);

  genericResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "New access token generated successfully",
    data: userTokens,
  });
});

const logout = asyncTryCatch(async (req: Request, res: Response) => {
  clearCookies(res);
  genericResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "Logout successful",
  });
});

export const authController = {
  credentialLogin,
  getNewAccessToken,
  logout,
};
