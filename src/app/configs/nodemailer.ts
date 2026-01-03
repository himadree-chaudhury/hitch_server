import nodemailer from "nodemailer";
import { envSecrets } from "./env";


// Create a test account or replace with real credentials.
export const transporter = nodemailer.createTransport({
  host: envSecrets.SMTP_HOST,
  port: envSecrets.SMTP_PORT,
  secure: false,
  auth: {
    user: envSecrets.SMTP_USER,
    pass: envSecrets.SMTP_PASS,
  },
});
