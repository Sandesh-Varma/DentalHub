import { OAuth2Client } from "google-auth-library";
import { AppError } from "../middleware/error.js";

const clientId = process.env.GOOGLE_CLIENT_ID;

const client = clientId ? new OAuth2Client(clientId) : null;

export type GoogleProfile = {
  googleId: string;
  email: string;
  name: string;
  emailVerified: boolean;
};

export function isGoogleAuthConfigured() {
  return !!clientId;
}

export async function verifyGoogleCredential(credential: string): Promise<GoogleProfile> {
  if (!client || !clientId) {
    throw new AppError(503, "Google sign-in is not configured");
  }

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: clientId,
  });

  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) {
    throw new AppError(401, "Invalid Google sign-in");
  }

  if (payload.email_verified === false) {
    throw new AppError(401, "Google email is not verified");
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name?.trim() || payload.email.split("@")[0],
    emailVerified: payload.email_verified ?? true,
  };
}
