type NavbarProps = {
  gameCount: number;
};

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function Navbar({ gameCount }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 h-[52px] border-b border-[#3F3F46] bg-[#27272A]">
      <div className="mx-auto flex h-full max-w-[1800px] items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#22C55E]" />
          <span className="font-[family-name:var(--font-syne)] text-sm font-extrabold tracking-[0.18em] text-white">
            PROPIQ
          </span>
        </div>

        <nav className="flex items-center gap-2 font-[family-name:var(--font-dm-mono)] text-[12px] text-[#A1A1AA]">
          <button className="rounded-md bg-[#303033] px-3 py-1.5 text-white">
            xDinger™
          </button>
          <button className="rounded-md px-3 py-1.5 hover:bg-[#303033] hover:text-white">
            ⚡ Laser
          </button>
          <button
            className="flex items-center gap-2 rounded-md px-3 py-1.5 opacity-35"
            disabled
          >
            <span>xWhiff™</span>
            <span className="rounded-full border border-[#52525B] px-1.5 py-0.5 text-[9px] text-[#A1A1AA]">
              SOON
            </span>
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <div className="rounded-full border border-[#3F3F46] bg-[#18181B] px-3 py-1 font-[family-name:var(--font-dm-mono)] text-[10px] text-[#A1A1AA]">
            {formatDate(new Date())} · {gameCount} games
          </div>
          <button className="rounded-md bg-white px-3 py-1.5 font-[family-name:var(--font-outfit)] text-[12px] font-medium text-[#18181B]">
            Go Pro
          </button>
        </div>
      </div>
    </header>
  );
}
