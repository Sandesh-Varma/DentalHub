/** Resolve API upload paths or external URLs for <img src>. */
export function mediaUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  return path.startsWith("/") ? path : `/${path}`;
}
