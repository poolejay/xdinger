import { NextResponse } from "next/server";

import { startTrial } from "@/lib/auth/startTrial";
import { createServerClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("trial_used")
    .eq("id", user.id)
    .single();

  if (!profile?.trial_used) {
    const expiresAt = await startTrial(user.id);
    return NextResponse.json({ ok: true, trial_expires_at: expiresAt.toISOString() });
  }

  return NextResponse.json({ ok: true, trial_expires_at: null });
}
