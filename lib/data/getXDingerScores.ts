import { createClient } from "@/lib/supabase/server";
import { unstable_cache } from "next/cache";

export async function getXDingerScores(date?: string) {
  const targetDate = date ?? new Date().toISOString().split("T")[0];
  return unstable_cache(
    async () => {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("xdinger_scores")
        .select(
          `
          *,
          matchups(*, players(*), pitchers(*), games(*)),
          zone_data(*)
        `,
        )
        .eq("game_date", targetDate)
        .order("xdinger_score", { ascending: false });

      if (error) {
        console.error("Error fetching xDinger scores:", error);
        return [];
      }
      return data ?? [];
    },
    ["xdinger-scores", targetDate],
    { revalidate: 900 },
  )();
}

export async function getLaserScores(date?: string) {
  const supabase = await createClient();
  const today = date ?? new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("laser_scores")
    .select(
      `
      *,
      matchups (
        *,
        players (
          mlb_id,
          name_first,
          name_last,
          team,
          position,
          bats
        ),
        pitchers (
          mlb_id,
          name_first,
          name_last,
          team,
          throws
        ),
        games (
          game_time,
          home_team,
          away_team,
          venue,
          status
        )
      )
    `,
    )
    .eq("game_date", today)
    .order("laser_score", { ascending: false });

  if (error) {
    console.error("Error fetching Laser scores:", error);
    return [];
  }

  return data ?? [];
}
