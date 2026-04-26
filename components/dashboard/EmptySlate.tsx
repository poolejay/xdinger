import { XDingerRow } from "@/lib/data/types";

type EmptySlateProps = {
  hasGames: boolean;
  previewRows: XDingerRow[];
};

function getMessage(hasGames: boolean) {
  const now = new Date();
  const etHour = Number(
    new Intl.DateTimeFormat("en-US", { hour: "2-digit", hour12: false, timeZone: "America/New_York" }).format(now),
  );
  if (!hasGames) return "No games scheduled today";
  if (etHour < 10) return "Today's slate is loading...";
  return "Pipeline running — check back in a few minutes";
}

export function EmptySlate({ hasGames, previewRows }: EmptySlateProps) {
  const message = getMessage(hasGames);

  return (
    <div className="rounded-md border border-[#3F3F46] bg-[#27272A] p-8">
      <div className="text-center">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#22C55E]" />
        <p className="mt-3 font-[family-name:var(--font-syne)] text-xl text-white">{message}</p>
      </div>

      {previewRows.length > 0 ? (
        <div className="mt-6 rounded-md border border-[#3F3F46] bg-[#18181B] p-4">
          <p className="mb-3 font-[family-name:var(--font-dm-mono)] text-[11px] text-[#A1A1AA]">
            Yesterday&apos;s top plays
          </p>
          <div className="space-y-2">
            {previewRows.slice(0, 5).map((row, idx) => (
              <div key={row.id} className="flex items-center justify-between rounded bg-[#27272A] px-3 py-2">
                <p className="font-[family-name:var(--font-outfit)] text-sm text-white">
                  {idx + 1}. {row.player.name_first} {row.player.name_last}
                </p>
                <p className="font-[family-name:var(--font-dm-mono)] text-xs text-[#22C55E]">
                  {row.xdinger_score.toFixed(1)}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
