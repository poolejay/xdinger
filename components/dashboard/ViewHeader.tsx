type ViewHeaderProps = {
  title: string;
  matchupCount: number;
  greenCount: number;
  gameCount: number;
};

export function ViewHeader({ title, matchupCount, greenCount, gameCount }: ViewHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="font-[family-name:var(--font-syne)] text-[20px] font-bold text-white">
          {title}
        </h1>
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] text-[#A1A1AA]">
          Today&apos;s slate · <span className="text-[#22C55E]">{matchupCount} matchups</span> ·{" "}
          {greenCount} green · {gameCount} games
        </p>
      </div>

      <div className="flex items-center gap-1 rounded-md border border-[#3F3F46] bg-[#27272A] p-1 font-[family-name:var(--font-dm-mono)] text-[11px]">
        <button className="rounded bg-[#303033] px-3 py-1 text-white">
          xDinger™
        </button>
        <button className="rounded px-3 py-1 text-[#A1A1AA] hover:bg-[#303033] hover:text-white">
          ⚡ Laser
        </button>
        <button className="rounded px-3 py-1 text-[#71717A]" disabled>
          xWhiff™ Soon
        </button>
      </div>
    </div>
  );
}
