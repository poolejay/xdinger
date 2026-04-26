type StatusBarProps = {
  matchupCount: number;
  gameCount: number;
};

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function StatusBar({ matchupCount, gameCount }: StatusBarProps) {
  return (
    <footer className="sticky bottom-0 z-40 h-[36px] border-t border-[#3F3F46] bg-[#27272A]">
      <div className="mx-auto flex h-full max-w-[1800px] items-center justify-between px-4 font-[family-name:var(--font-dm-mono)] text-[10px] text-[#A1A1AA]">
        <div className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#22C55E]" />
          <span>Live · Refreshes every 15 min</span>
        </div>
        <div>Statcast · MLB StatsAPI · Open-Meteo</div>
        <div>
          {matchupCount} matchups · {gameCount} games · {formatDate(new Date())}
        </div>
      </div>
    </footer>
  );
}
