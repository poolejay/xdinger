"use client";

import { useState } from "react";

import { EmptySlate } from "@/components/dashboard/EmptySlate";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { MatchupTable } from "@/components/dashboard/MatchupTable";
import { TunerPanel } from "@/components/dashboard/TunerPanel";
import { ViewHeader } from "@/components/dashboard/ViewHeader";
import { Navbar } from "@/components/layout/Navbar";
import { StatusBar } from "@/components/layout/StatusBar";
import { PaywallModal } from "@/components/paywall/PaywallModal";
import { TrialBanner } from "@/components/paywall/TrialBanner";
import { LaserRow, XDingerRow } from "@/lib/data/types";

type DashboardClientShellProps = {
  data: XDingerRow[];
  laserData: LaserRow[];
  isPro: boolean;
  subscriptionStatus: string;
  trialExpiresAt?: string | null;
  userId?: string;
  trialUsed?: boolean;
  hasGames: boolean;
  greenCount: number;
  gameCount: number;
  previewRows: XDingerRow[];
};

export function DashboardClientShell({
  data,
  laserData,
  isPro,
  subscriptionStatus,
  trialExpiresAt,
  userId,
  trialUsed,
  hasGames,
  greenCount,
  gameCount,
  previewRows,
}: DashboardClientShellProps) {
  const [showPaywall, setShowPaywall] = useState(false);
  const matchupCount = data.length;

  return (
    <div className="min-h-screen bg-[#18181B]">
      <Navbar gameCount={gameCount} />
      {subscriptionStatus === "trialing" && trialExpiresAt ? (
        <TrialBanner trialExpiresAt={trialExpiresAt} onGoPro={() => setShowPaywall(true)} />
      ) : null}
      <main className="mx-auto max-w-[1800px] space-y-4 px-4 pb-12 pt-4">
        <ViewHeader
          title="HR Intelligence"
          matchupCount={matchupCount}
          greenCount={greenCount}
          gameCount={gameCount}
        />
        <FilterBar matchupCount={matchupCount} />
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            {matchupCount === 0 ? (
              <EmptySlate hasGames={hasGames} previewRows={previewRows} />
            ) : (
              <MatchupTable
                data={data}
                laserData={laserData}
                isPro={isPro}
                onUnlockClick={() => setShowPaywall(true)}
              />
            )}
          </div>
          <div className="w-64 shrink-0">
            <TunerPanel isPro={isPro} onUnlockClick={() => setShowPaywall(true)} />
          </div>
        </div>
      </main>
      <StatusBar matchupCount={matchupCount} gameCount={gameCount} />
      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        userId={userId}
        trialUsed={trialUsed}
      />
    </div>
  );
}
