"use client";

import { useMemo, useState } from "react";

const presets = {
  Balanced: [25, 18, 20, 17, 10, 6, 4],
  Splits: [10, 12, 35, 25, 8, 7, 3],
  Power: [40, 22, 15, 12, 6, 3, 2],
  Env: [15, 15, 18, 15, 28, 6, 3],
  BvP: [15, 18, 20, 15, 8, 9, 15],
  Pitch: [12, 18, 20, 32, 8, 7, 3],
} as const;

const sliderMeta = [
  { label: "Batter Power", desc: "Barrel rate, exit velocity, HR rate" },
  {
    label: "Pitcher Vulnerability",
    desc: "HR allowed rate, xFIP, stuff grade",
  },
  { label: "Handedness Edge", desc: "L/R split AVG, SLG, ISO" },
  {
    label: "Pitch Matchup",
    desc: "AVG + whiff vs pitcher's primary pitch",
  },
  { label: "Park + Wind", desc: "Ballpark HR factor × wind direction" },
  { label: "Recent Form", desc: "AVG · SLG · HR · EV last N games" },
  { label: "BvP History", desc: "Career HR + AVG vs this pitcher" },
] as const;

type TunerPanelProps = {
  isPro: boolean;
  onUnlockClick?: () => void;
};

export function TunerPanel({ isPro, onUnlockClick }: TunerPanelProps) {
  const [activePreset, setActivePreset] = useState<keyof typeof presets>("Balanced");
  const [weights, setWeights] = useState<number[]>([...presets.Balanced]);
  const total = useMemo(() => weights.reduce((sum, value) => sum + value, 0), [weights]);

  const totalClass =
    total === 100
      ? "text-[#22C55E]"
      : total > 100
        ? "text-[#EF4444]"
        : "text-[#EAB308]";

  function applyPreset(preset: keyof typeof presets) {
    setActivePreset(preset);
    setWeights([...presets[preset]]);
  }

  function updateWeight(index: number, value: number) {
    const next = [...weights];
    next[index] = value;
    setWeights(next);
  }

  return (
    <aside className="relative sticky top-[68px] h-[calc(100vh-120px)] w-64 rounded-md border border-[#3F3F46] bg-[#27272A] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-syne)] text-[13px] font-bold text-white">
          Tune xDinger™
        </h2>
        <button
          className="font-[family-name:var(--font-dm-mono)] text-[10px] text-[#A1A1AA]"
          onClick={() => applyPreset("Balanced")}
        >
          Reset
        </button>
      </div>

      <p className="mb-3 font-[family-name:var(--font-dm-mono)] text-[10px] text-[#A1A1AA]">
        Drag to weight each factor. Scores re-rank on Apply.
      </p>

      <div className="mb-4 grid grid-cols-3 gap-1">
        {Object.keys(presets).map((preset) => (
          <button
            key={preset}
            className={`rounded border px-1 py-1 font-[family-name:var(--font-dm-mono)] text-[10px] ${
              activePreset === preset
                ? "border-[#22C55E] bg-[#22C55E]/20 text-[#22C55E]"
                : "border-[#3F3F46] bg-[#18181B] text-[#A1A1AA]"
            }`}
            onClick={() => applyPreset(preset as keyof typeof presets)}
          >
            {preset}
          </button>
        ))}
      </div>

      <div className={`space-y-3 ${isPro ? "" : "pointer-events-none opacity-55"}`}>
        {sliderMeta.map((item, index) => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between">
              <p className="font-[family-name:var(--font-outfit)] text-[11px] text-white">
                {item.label}
              </p>
              <p className="font-[family-name:var(--font-dm-mono)] text-[10px] text-[#A1A1AA]">
                {weights[index]}%
              </p>
            </div>
            <p className="mb-1 font-[family-name:var(--font-dm-mono)] text-[9px] text-[#71717A]">
              {item.desc}
            </p>
            <input
              type="range"
              min={0}
              max={50}
              value={weights[index]}
              disabled={!isPro}
              onChange={(event) => updateWeight(index, Number(event.target.value))}
              className="w-full accent-[#22C55E]"
            />
          </div>
        ))}
      </div>

      <div className={`mt-4 border-t border-[#3F3F46] pt-3 ${isPro ? "" : "pointer-events-none opacity-55"}`}>
        <p className="mb-2 font-[family-name:var(--font-dm-mono)] text-[11px] text-[#A1A1AA]">
          Total Weight: <span className={totalClass}>{total}%</span>
        </p>
        <button className="w-full rounded-md bg-white py-2 font-[family-name:var(--font-outfit)] text-[12px] font-medium text-[#18181B]">
          Apply &amp; Re-sort ↑
        </button>
      </div>
      {!isPro ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-black/45">
          <div className="rounded-md border border-white/20 bg-[#27272A] px-4 py-3 text-center">
            <p className="font-[family-name:var(--font-syne)] text-sm text-white">Pro Feature</p>
            <button
              onClick={onUnlockClick}
              className="mt-2 rounded-md bg-white px-3 py-1 font-[family-name:var(--font-outfit)] text-xs text-[#18181B]"
            >
              Unlock Pro
            </button>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
