import { BadgeResult } from "@/lib/types/dashboard";

type PitchBadgeProps = {
  pitchType: string;
  pitchPct: number;
  result: BadgeResult;
};

const styleMap = {
  hot: "border border-[#22C55E]/40 bg-[#22C55E]/15 text-[#22C55E]",
  neutral: "border border-[#3F3F46] bg-[#303033] text-[#A1A1AA]",
  cold: "border border-[#EAB308]/40 bg-[#EAB308]/15 text-[#EAB308]",
} as const;

const symbolMap = {
  hot: "🎯",
  neutral: "—",
  cold: "⚠",
} as const;

export function PitchBadge({ pitchType, pitchPct, result }: PitchBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-[5px] px-2 py-1 font-[family-name:var(--font-dm-mono)] text-[12px] ${styleMap[result]}`}
    >
      {symbolMap[result]} {pitchType} · {pitchPct}%
    </span>
  );
}
