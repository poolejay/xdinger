import { DashboardClientShell } from "@/components/dashboard/DashboardClientShell";
import { getLaserScores, getXDingerScores } from "@/lib/data/getXDingerScores";
import { getSlateStatus } from "@/lib/data/getSlateStatus";
import { transformLaserRows, transformXDingerRows } from "@/lib/data/transformScores";
import { getProfile, isPro as getIsPro } from "@/lib/auth/getProfile";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const pro = getIsPro(profile);
  const [rawXDinger, rawLaser, slateStatus] = await Promise.all([
    getXDingerScores(),
    getLaserScores(),
    getSlateStatus(),
  ]);
  const xdingerRows = transformXDingerRows(rawXDinger);
  const laserRows = transformLaserRows(rawLaser);
  const greenCount = xdingerRows.filter((row) => row.tier === "green").length;
  const gameCount =
    new Set(xdingerRows.map((row) => `${row.game.home_team}-${row.game.away_team}`)).size ||
    slateStatus.gameCount;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const ymd = yesterday.toISOString().split("T")[0];
  const previewRows = xdingerRows.length
    ? xdingerRows
    : transformXDingerRows(await getXDingerScores(ymd)).slice(0, 5);

  return (
    <DashboardClientShell
      data={xdingerRows}
      laserData={laserRows}
      isPro={pro}
      subscriptionStatus={profile?.subscription_status ?? "free"}
      trialExpiresAt={profile?.trial_expires_at ?? null}
      userId={profile?.id}
      trialUsed={profile?.trial_used}
      hasGames={slateStatus.hasGames}
      greenCount={greenCount}
      gameCount={gameCount}
      previewRows={previewRows}
    />
  );
}
