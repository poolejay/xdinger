import { createClient } from "@/lib/supabase/server";

export async function getSlateStatus(date?: string) {
  const supabase = await createClient();
  const day = date ?? new Date().toISOString().split("T")[0];

  const { count, error } = await supabase
    .from("games")
    .select("*", { count: "exact", head: true })
    .eq("game_date", day)
    .neq("status", "cancelled");

  if (error) {
    console.error("getSlateStatus:", error);
    return {
      hasGames: false,
      gameCount: 0,
      date: day,
    };
  }

  return {
    hasGames: (count ?? 0) > 0,
    gameCount: count ?? 0,
    date: day,
  };
}
