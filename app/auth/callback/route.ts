import { NextResponse } from "next/server";

import { createServerClient } from "@/lib/supabase/server";

/**
 * Handles the email-confirm and OAuth redirect when Supabase sends a ?code=... to this path.
 * Add this full URL to Supabase → Auth → URL Configuration → Redirect URLs.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
