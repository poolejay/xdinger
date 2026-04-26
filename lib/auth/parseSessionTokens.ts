/** GoTrue can return access/refresh at the top level or under `session` depending on version. */
export function parseSessionTokens(payload: Record<string, unknown>): {
  access_token: string;
  refresh_token: string;
} | null {
  const a = payload.access_token;
  const b = payload.refresh_token;
  if (typeof a === "string" && typeof b === "string" && a && b) {
    return { access_token: a, refresh_token: b };
  }
  const s = payload.session;
  if (s && typeof s === "object" && s !== null) {
    const o = s as Record<string, unknown>;
    if (typeof o.access_token === "string" && typeof o.refresh_token === "string") {
      return { access_token: o.access_token, refresh_token: o.refresh_token };
    }
  }
  return null;
}
