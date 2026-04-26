import { ZoneCell } from "@/lib/data/types";

type ZoneGridData = Record<number, ZoneCell | null>;

interface ExpandedRowProps {
  batterName: string;
  pitcherName: string;
  primaryPitch: string;
  batterZones: ZoneGridData;
  pitcherZones: ZoneGridData;
  batterVsPitchZones: ZoneGridData;
  isPro: boolean;
  onUnlockClick?: () => void;
}

const zoneOrder = [
  [7, 8, 9],
  [4, 5, 6],
  [1, 2, 3],
];

function colorForXslg(value?: number) {
  if (value === undefined || value === null) return "#52525B";
  if (value > 1.0) return "#DC2626";
  if (value >= 0.8) return "#EA580C";
  if (value >= 0.6) return "#D97706";
  if (value >= 0.4) return "#52525B";
  return "#1D4ED8";
}

function ZoneGrid({
  title,
  zones,
  showPct,
  pairForDanger,
}: {
  title: string;
  zones: ZoneGridData;
  showPct?: boolean;
  pairForDanger?: { batter: ZoneGridData; pitcher: ZoneGridData };
}) {
  return (
    <div className="space-y-2">
      <h4 className="font-[family-name:var(--font-dm-mono)] text-[11px] text-[#A1A1AA]">
        {title}
      </h4>
      <div className="grid grid-cols-[56px_repeat(3,60px)] gap-2">
        <span />
        <span className="text-center font-[family-name:var(--font-dm-mono)] text-[10px] text-[#71717A]">
          Inside
        </span>
        <span className="text-center font-[family-name:var(--font-dm-mono)] text-[10px] text-[#71717A]">
          Middle
        </span>
        <span className="text-center font-[family-name:var(--font-dm-mono)] text-[10px] text-[#71717A]">
          Outside
        </span>

        {zoneOrder.map((row, rowIdx) => (
          <div key={rowIdx} className="contents">
            <span className="my-auto font-[family-name:var(--font-dm-mono)] text-[10px] text-[#71717A]">
              {rowIdx === 0 ? "Upper" : rowIdx === 1 ? "Middle" : "Lower"}
            </span>
            {row.map((zone) => {
              const cell = zones[zone];
              const xslg = cell?.xslg ?? cell?.xslg_allowed;
              const zonePct = cell?.zone_pct;
              const danger =
                pairForDanger &&
                (pairForDanger.batter[zone]?.xslg ?? 0) >= 0.8 &&
                (pairForDanger.pitcher[zone]?.zone_pct ?? 0) >= 0.15;
              return (
                <div
                  key={zone}
                  className={`flex min-h-[60px] min-w-[60px] flex-col items-center justify-center rounded-md border border-[#3F3F46] text-white ${
                    danger ? "shadow-[0_0_0_2px_rgba(255,255,255,0.75)]" : ""
                  }`}
                  style={{ backgroundColor: colorForXslg(xslg) }}
                >
                  <span className="font-[family-name:var(--font-dm-mono)] text-[12px]">
                    {xslg ? xslg.toFixed(3) : "—"}
                  </span>
                  {showPct ? (
                    <span className="font-[family-name:var(--font-dm-mono)] text-[9px] opacity-85">
                      {zonePct ? `${Math.round(zonePct * 100)}%` : " "}
                    </span>
                  ) : (
                    <span className="font-[family-name:var(--font-dm-mono)] text-[9px] opacity-85">
                      {cell?.pa_count ? `${cell.pa_count} PA` : " "}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExpandedRow({
  batterName,
  pitcherName,
  primaryPitch,
  batterZones,
  pitcherZones,
  batterVsPitchZones,
  isPro,
  onUnlockClick,
}: ExpandedRowProps) {
  return (
    <div className="relative overflow-hidden rounded-md border border-[#3F3F46] bg-[#18181B] p-4">
      <div className={isPro ? "" : "pointer-events-none blur-[3px] opacity-75"}>
        <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ZoneGrid
            title={`${batterName} xSLG By Zone`}
            zones={batterZones}
            pairForDanger={{ batter: batterZones, pitcher: pitcherZones }}
          />
          <ZoneGrid
            title={`${pitcherName} xSLG Allowed By Zone`}
            zones={pitcherZones}
            showPct
            pairForDanger={{ batter: batterZones, pitcher: pitcherZones }}
          />
        </div>
        <ZoneGrid
          title={`${batterName} xSLG vs ${primaryPitch} By Zone`}
          zones={batterVsPitchZones}
        />
      </div>

      {!isPro ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="rounded-md border border-white/20 bg-[#27272A] px-5 py-4 text-center">
            <p className="mb-1 text-xl">🔒</p>
            <p className="font-[family-name:var(--font-syne)] text-sm text-white">
              Pro Feature
            </p>
            <a
              href="#"
              onClick={(event) => {
                event.preventDefault();
                onUnlockClick?.();
              }}
              className="mt-3 inline-block rounded-md bg-white px-3 py-1 font-[family-name:var(--font-outfit)] text-xs text-[#18181B]"
            >
              Unlock with Pro
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
