import { CookieOptions, Response } from "express";
import { envSecrets } from "../configs/env";

const isProd = envSecrets.NODE_ENV === "production";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/"
};

export const setCookie = (
  res: Response,
  tokenInfo: { accessToken: string; refreshToken: string }
) => {
  if (tokenInfo.accessToken) {
    res.cookie("accessToken", tokenInfo.accessToken, cookieOptions);
  }
  if (tokenInfo.refreshToken) {
    res.cookie("refreshToken", tokenInfo.refreshToken, cookieOptions);
  }
};

export const clearCookies = (res: Response) => {
  res.clearCookie("accessToken", cookieOptions as CookieOptions);
  res.clearCookie("refreshToken", cookieOptions as CookieOptions);
};
