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

  if (userTokens.accessToken && userTokens.refreshToken) {
    setCookie(res, userTokens);
  }

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

const changePassword = asyncTryCatch(async (req: Request, res: Response) => {
  const userEmail = req.authUser.email;
  await authService.changePassword(userEmail, req.body);

  genericResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "Password changed successfully",
  });
});

const forgetPassword = asyncTryCatch(async (req: Request, res: Response) => {
  await authService.forgetPassword(req.body.email);
  genericResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "If an account exists, an OTP has been sent to your email.",
  });
});

const resetPassword = asyncTryCatch(async (req: Request, res: Response) => {
  await authService.resetPassword(req.body);
  genericResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "Password has been reset successfully. Please login.",
  });
});

const verifyRequest = asyncTryCatch(async (req: Request, res: Response) => {
  const userEmail = req.authUser.email;
  await authService.requestVerification(userEmail);
  genericResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "Verification OTP sent.",
  });
});

const verifyAccount = asyncTryCatch(async (req: Request, res: Response) => {
  await authService.verifyAccount(req.body);
  genericResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: "Account verified successfully.",
  });
});

// Google Login Callback
const googleCallback = asyncTryCatch(async (req: Request, res: Response) => {
  // Passport middleware puts the Google Profile in req.user
  const userTokens = await authService.googleLogin(req.user);

  setCookie(res, userTokens);

  // Redirect to frontend
  res.redirect(`${process.env.CLIENT_URL}/dashboard`);
});

export const authController = {
  credentialLogin,
  getNewAccessToken,
  logout,
  changePassword,
  forgetPassword,
  resetPassword,
  verifyRequest,
  verifyAccount,
  googleCallback,
};
