import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ received: true, skipped: "Supabase env missing" });
  }
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const body = await req.json();
  const event = body.event;
  if (!event?.app_user_id || !event?.type) {
    return NextResponse.json({ received: false, error: "Invalid payload" }, { status: 400 });
  }

  const userId = event.app_user_id;
  switch (event.type) {
    case "INITIAL_PURCHASE":
    case "RENEWAL":
      await supabase
        .from("profiles")
        .update({
          subscription_status: "active",
          is_pro: true,
          revenuecat_id: event.app_user_id,
          subscription_expires_at: new Date(event.expiration_at_ms).toISOString(),
        })
        .eq("id", userId);
      break;
    case "CANCELLATION":
      await supabase
        .from("profiles")
        .update({
          subscription_status: "cancelled",
        })
        .eq("id", userId);
      break;
    case "EXPIRATION":
      await supabase
        .from("profiles")
        .update({
          subscription_status: "expired",
          is_pro: false,
        })
        .eq("id", userId);
      break;
    case "BILLING_ISSUE":
      await supabase
        .from("profiles")
        .update({
          subscription_status: "billing_issue",
          is_pro: false,
        })
        .eq("id", userId);
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
