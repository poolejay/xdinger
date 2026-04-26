import { NextResponse } from "next/server";

import { gotrueErrorMessage } from "@/lib/auth/gotrueErrorMessage";
import { getNormalizedSupabaseUrl } from "@/lib/supabase/url";

/**
 * Email + password sign-in / sign-up via GoTrue REST (no browser PKCE / redirect).
 */
export async function POST(request: Request) {
  let body: { action?: string; email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = body.action === "signin" ? "signin" : "signup";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const base = getNormalizedSupabaseUrl();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!base || !key) {
    return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: key,
    Authorization: `Bearer ${key}`,
  };

  let res: Response;
  if (action === "signin") {
    res = await fetch(`${base}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email, password }),
    });
  } else {
    res = await fetch(`${base}/auth/v1/signup`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email, password, data: {} }),
    });
  }

  const raw = await res.text();
  let data: unknown = {};
  if (raw) {
    try {
      data = JSON.parse(raw) as unknown;
    } catch {
      return NextResponse.json(
        { error: raw.length > 200 ? `${raw.slice(0, 200)}…` : raw || `Auth failed (${res.status})` },
        { status: res.status },
      );
    }
  }

  if (!res.ok) {
    return NextResponse.json(
      { error: gotrueErrorMessage(data, action, res.status) },
      { status: res.status },
    );
  }

  return NextResponse.json(data as Record<string, unknown>);
}
