import dotenv from "dotenv";
import { cleanEnv, num, port, str } from "envalid";

dotenv.config();

export const envSecrets = cleanEnv(process.env, {
  PORT: port(),
  NODE_ENV: str(),
  JWT_ACCESS_SECRET: str(),
  JWT_REFRESH_SECRET: str(),
  JWT_ACCESS_EXPIRES_IN: str(),
  JWT_REFRESH_EXPIRES_IN: str(),
  SALT_ROUNDS: num(),
  CLOUDINARY_CLOUD_NAME: str(),
  CLOUDINARY_API_KEY: str(),
  CLOUDINARY_API_SECRET: str(),
});
