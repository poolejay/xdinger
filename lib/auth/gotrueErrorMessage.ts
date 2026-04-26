/**
 * GoTrue/Supabase auth error JSON varies by version. Pull the first useful string.
 */
export function gotrueErrorMessage(data: unknown, action: "signin" | "signup", status: number): string {
  if (typeof data === "string" && data.trim()) {
    return data.trim();
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return `Auth request failed (HTTP ${status}).`;
  }
  const o = data as Record<string, unknown>;
  const parts = [
    o.error_description,
    o.message,
    o.msg,
    o.hint,
    typeof o.error === "string" ? o.error : null,
  ];
  for (const p of parts) {
    if (typeof p === "string" && p.trim()) {
      return p.trim();
    }
  }
  if (o.weak_password && typeof o.weak_password === "object" && o.weak_password !== null) {
    const w = o.weak_password as Record<string, unknown>;
    if (typeof w.message === "string") return w.message;
    if (Array.isArray(w.reasons) && w.reasons.length) {
      return w.reasons.filter((r): r is string => typeof r === "string").join(". ");
    }
  }
  try {
    const s = JSON.stringify(data);
    if (s && s !== "{}") return s;
  } catch {
    /* ignore */
  }
  return `${action === "signin" ? "Sign in" : "Sign up"} failed (HTTP ${status}).`;
}
