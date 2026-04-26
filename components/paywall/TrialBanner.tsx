"use client";

import { useEffect, useMemo, useState } from "react";

type TrialBannerProps = {
  trialExpiresAt: string;
  onGoPro: () => void;
};

export function TrialBanner({ trialExpiresAt, onGoPro }: TrialBannerProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const { text, barClass } = useMemo(() => {
    const end = new Date(trialExpiresAt).getTime();
    const deltaMs = Math.max(0, end - now);
    const hours = Math.floor(deltaMs / (1000 * 60 * 60));
    const mins = Math.floor((deltaMs % (1000 * 60 * 60)) / (1000 * 60));

    if (deltaMs < 60 * 60 * 1000) {
      return {
        text: `🔴 Trial expires in ${mins} minutes · Don't lose access →`,
        barClass: "bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40",
      };
    }
    if (deltaMs < 6 * 60 * 60 * 1000) {
      return {
        text: `⚠️ Trial expires in ${hours} hours · Go Pro to keep access →`,
        barClass: "bg-[#EAB308]/20 text-[#EAB308] border-[#EAB308]/40",
      };
    }
    return {
      text: `🟢 Free trial active · ${hours} hours remaining · Go Pro to keep access`,
      barClass: "bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/40",
    };
  }, [trialExpiresAt, now]);

  return (
    <button
      onClick={onGoPro}
      className={`sticky top-[52px] z-30 w-full border-y px-4 py-2 text-left font-[family-name:var(--font-dm-mono)] text-[11px] ${barClass}`}
    >
      {text}
    </button>
  );
}
