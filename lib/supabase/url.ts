/** Strips trailing slashes so the JS client never builds invalid paths like //auth/v1/... */
export function getNormalizedSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return "";
  return url.replace(/\/+$/, "");
}
