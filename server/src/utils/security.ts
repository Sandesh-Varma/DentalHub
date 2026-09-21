export function getAllowedOrigins(value: string | undefined, fallback: string) {
  return (value ?? fallback)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function verifyOrigin(origin: string | undefined | null, allowedOrigins: string[]) {
  return !origin || allowedOrigins.includes(origin);
}
