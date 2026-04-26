/** Strips trailing slashes, whitespace, and accidental quotes (common copy-paste from dashboards). */
export function getNormalizedSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return "";
  return url
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\/+$/, "");
}
