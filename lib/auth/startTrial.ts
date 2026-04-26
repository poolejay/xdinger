import { createClient } from "@/lib/supabase/server";

export async function startTrial(userId: string) {
  const supabase = await createClient();

  const trialStart = new Date();
  const trialExpiry = new Date(trialStart);
  trialExpiry.setHours(trialExpiry.getHours() + 24);

  await supabase
    .from("profiles")
    .update({
      subscription_status: "trialing",
      trial_started_at: trialStart.toISOString(),
      trial_expires_at: trialExpiry.toISOString(),
      trial_used: true,
      is_pro: true,
    })
    .eq("id", userId)
    .eq("trial_used", false);

  return trialExpiry;
}
