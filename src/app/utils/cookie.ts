import { CookieOptions, Response } from "express";

const cookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: "none",
};

export const setCookie = (
  res: Response,
  tokenInfo: { accessToken: string; refreshToken: string }
) => {
  if (tokenInfo.accessToken) {
    res.cookie("accessToken", tokenInfo.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path:"/",
    });
  }
  if (tokenInfo.refreshToken) {
    res.cookie("refreshToken", tokenInfo.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path:"/",
    });
  }
};

export const clearCookies = (res: Response) => {
  res.clearCookie("accessToken", cookieOptions as CookieOptions);
  res.clearCookie("refreshToken", cookieOptions as CookieOptions);
};
