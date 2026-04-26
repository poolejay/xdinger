import { createServerClient } from "@/lib/supabase/server";

type Profile = {
  subscription_status?: string | null;
  trial_expires_at?: string | null;
};

export async function getProfile() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return profile;
  } catch {
    return null;
  }
}

export function isPro(profile: Profile | null): boolean {
  if (!profile) return false;
  if (profile.subscription_status === "active") return true;
  if (profile.subscription_status === "trialing") {
    if (!profile.trial_expires_at) return false;
    return new Date(profile.trial_expires_at) > new Date();
  }
  return false;
}
