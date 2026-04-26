import { NextResponse } from "next/server";

import { getNormalizedSupabaseUrl } from "@/lib/supabase/url";

/**
 * Server-side sign-up against GoTrue REST, without the browser client’s PKCE flow.
 * Avoids "Invalid path specified in request URL" when the client adds query/body the server rejects.
 */
export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const base = getNormalizedSupabaseUrl();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!base || !key) {
    return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 });
  }

  const res = await fetch(`${base}/auth/v1/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ email, password, data: {} }),
  });

  const data: Record<string, unknown> = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const msg =
      (typeof data.error_description === "string" && data.error_description) ||
      (typeof data.msg === "string" && data.msg) ||
      (typeof data.error === "string" && data.error) ||
      "Sign up failed";
    return NextResponse.json({ error: String(msg) }, { status: res.status });
  }

  return NextResponse.json(data);
}
