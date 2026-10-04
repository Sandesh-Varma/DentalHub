import { isAxiosError } from "axios";

export function loginErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    if (!error.response) return "Unable to reach the clinic server. Please wait a moment and try again.";
    if (error.response.status === 429) return "Too many sign-in attempts. Please wait before trying again.";
    if (error.response.status >= 500) return "The clinic server is temporarily unavailable. Please try again shortly.";
  }
  return "Invalid email or password";
}
