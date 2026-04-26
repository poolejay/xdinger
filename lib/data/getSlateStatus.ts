import { createServerClient } from "@/lib/supabase/server";

export async function getSlateStatus() {
  const supabase = await createServerClient();
  const today = new Date().toISOString().split("T")[0];

  const { count } = await supabase
    .from("games")
    .select("*", { count: "exact", head: true })
    .eq("game_date", today)
    .neq("status", "cancelled");

  return {
    hasGames: (count ?? 0) > 0,
    gameCount: count ?? 0,
    date: today,
  };
}
