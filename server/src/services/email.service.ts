import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { AppError } from "../middleware/error.js";

let transporter: Transporter | null | undefined;

function getTransporter(): Transporter | null {
  if (transporter !== undefined) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS?.replace(/\s/g, "");

  if (!host || !user || !pass) {
    transporter = null;
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });

  return transporter;
}

export function isEmailConfigured() {
  return !!getTransporter();
}

function assertEmailConfigured() {
  if (!getTransporter()) {
    throw new AppError(
      503,
      "Email is not configured. Add SMTP settings to server/.env and restart the server."
    );
  }
}

export async function sendPasswordResetOtp(email: string, name: string, code: string) {
  const mailer = getTransporter();
  assertEmailConfigured();

  const subject = "Your DentFlow password reset code";
  const text = `Hi ${name},

Your DentFlow password reset code is: ${code}

This code expires in 15 minutes. If you did not request this, you can ignore this email.

— DentFlow`;

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #0d9488;">DentFlow password reset</h2>
      <p>Hi ${name},</p>
      <p>Use this code to reset your password:</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #111;">${code}</p>
      <p style="color: #64748b; font-size: 14px;">Expires in 15 minutes. If you did not request this, ignore this email.</p>
    </div>
  `;

  await mailer!.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to: email,
    subject,
    text,
    html,
  });
}
