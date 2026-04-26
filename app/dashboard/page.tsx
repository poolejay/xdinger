import { redirect } from "next/navigation";

import { DashboardClientShell } from "@/components/dashboard/DashboardClientShell";
import { getProfile, isPro as getIsPro } from "@/lib/auth/getProfile";
import { getLaserScores, getXDingerScores } from "@/lib/data/getXDingerScores";
import { getSlateStatus } from "@/lib/data/getSlateStatus";
import { transformLaserRows, transformXDingerRows } from "@/lib/data/transformScores";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

function parseDashboardDate(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }
  return new Date().toISOString().split("T")[0];
}

function dayBefore(iso: string): string {
  const d = new Date(`${iso}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().split("T")[0];
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const selectedDate = parseDashboardDate(searchParams.date);
  const profile = await getProfile();
  const pro = getIsPro(profile);

  let rawXDinger: unknown[] = [];
  let rawLaser: unknown[] = [];
  let slateStatus = {
    hasGames: false,
    gameCount: 0,
    date: selectedDate,
  };

  try {
    const [xd, las, sl] = await Promise.all([
      getXDingerScores(selectedDate),
      getLaserScores(selectedDate),
      getSlateStatus(selectedDate),
    ]);
    rawXDinger = Array.isArray(xd) ? xd : [];
    rawLaser = Array.isArray(las) ? las : [];
    if (sl && typeof sl === "object") {
      slateStatus = {
        hasGames: Boolean((sl as { hasGames?: boolean }).hasGames),
        gameCount: Number((sl as { gameCount?: number }).gameCount) || 0,
        date: String((sl as { date?: string }).date) || selectedDate,
      };
    }
  } catch (e) {
    console.error("Dashboard data fetch failed:", e);
  }

  let xdingerRows = [] as ReturnType<typeof transformXDingerRows>;
  let laserRows = [] as ReturnType<typeof transformLaserRows>;
  const asRaw = (rows: unknown[]) => rows as Parameters<typeof transformXDingerRows>[0];
  try {
    xdingerRows = transformXDingerRows(asRaw(rawXDinger));
  } catch (e) {
    console.error("transformXDingerRows:", e);
  }
  try {
    laserRows = transformLaserRows(asRaw(rawLaser));
  } catch (e) {
    console.error("transformLaserRows:", e);
  }

  const greenCount = xdingerRows.filter((row) => row.tier === "green").length;
  const gameCount =
    new Set(
      xdingerRows.map((row) => `${row.game.home_team}-${row.game.away_team}`),
    ).size || slateStatus.gameCount;

  let previewRows: ReturnType<typeof transformXDingerRows> = [];
  if (xdingerRows.length === 0) {
    try {
      const ymd = dayBefore(selectedDate);
      const rawPrev = await getXDingerScores(ymd);
      const list = Array.isArray(rawPrev) ? rawPrev : [];
      previewRows = transformXDingerRows(asRaw(list)).slice(0, 5);
    } catch (e) {
      console.error("Empty slate preview rows:", e);
    }
  }

  return (
    <DashboardClientShell
      data={xdingerRows}
      laserData={laserRows}
      isPro={pro}
      subscriptionStatus={profile?.subscription_status ?? "free"}
      trialExpiresAt={profile?.trial_expires_at ?? null}
      userId={profile?.id ?? user.id}
      trialUsed={profile?.trial_used}
      hasGames={slateStatus.hasGames}
      greenCount={greenCount}
      gameCount={gameCount}
      previewRows={previewRows}
      selectedDate={selectedDate}
    />
  );
}
