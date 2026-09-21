import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { AppError } from "../middleware/error.js";

export const UPLOADS_ROOT = path.join(process.cwd(), "uploads");
const AVATAR_DIR = path.join(UPLOADS_ROOT, "avatars");
const MAX_BYTES = 2 * 1024 * 1024;

export async function saveDoctorAvatar(
  userId: string,
  input: string | undefined
): Promise<string | undefined | null> {
  if (input === undefined) return undefined;
  if (input === null || input === "") return null;

  if (input.startsWith("http://") || input.startsWith("https://")) {
    return input;
  }

  const match = input.match(/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/i);
  if (!match) {
    throw new AppError(400, "Invalid image. Use JPEG, PNG, or WebP under 2MB.");
  }

  const ext = match[1].toLowerCase() === "jpeg" ? "jpg" : match[1].toLowerCase();
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length > MAX_BYTES) {
    throw new AppError(400, "Image must be smaller than 2MB.");
  }

  await mkdir(AVATAR_DIR, { recursive: true });
  const filename = `${userId}.${ext}`;
  await writeFile(path.join(AVATAR_DIR, filename), buffer);
  return `/uploads/avatars/${filename}`;
}
