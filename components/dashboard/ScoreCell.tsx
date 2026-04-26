import { Tier } from "@/lib/types/dashboard";

type ScoreCellProps = {
  score: number;
  tier: Tier;
};

const tierStyles = {
  green: {
    bg: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.25)",
    color: "#22C55E",
    label: "● STRONG",
  },
  yellow: {
    bg: "rgba(234,179,8,0.1)",
    border: "rgba(234,179,8,0.25)",
    color: "#EAB308",
    label: "● MODERATE",
  },
  red: {
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.2)",
    color: "#EF4444",
    label: "● WEAK",
  },
} as const;

export function ScoreCell({ score, tier }: ScoreCellProps) {
  const style = tierStyles[tier];

  return (
    <div
      className="flex min-h-[56px] min-w-[108px] flex-col justify-center rounded-l-md border-r px-3"
      style={{
        backgroundColor: style.bg,
        borderColor: style.border,
      }}
    >
      <span
        className="font-[family-name:var(--font-dm-mono)] text-[22px] font-normal leading-tight"
        style={{ color: style.color }}
      >
        {score.toFixed(1)}
      </span>
      <span
        className="font-[family-name:var(--font-dm-mono)] text-[9px] leading-tight opacity-60"
        style={{ color: style.color }}
      >
        {style.label}
      </span>
    </div>
  );
}
