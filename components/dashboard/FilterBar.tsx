type FilterBarProps = {
  matchupCount: number;
};

const selectClassName =
  "h-8 rounded-md border border-[#3F3F46] bg-[#27272A] px-2 font-[family-name:var(--font-dm-mono)] text-[11px] text-[#A1A1AA] outline-none";

export function FilterBar({ matchupCount }: FilterBarProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-[#3F3F46] bg-[#27272A] p-3">
      <div className="flex flex-wrap items-center gap-2">
        <select className={selectClassName} defaultValue="all-teams">
          <option value="all-teams">All Teams</option>
        </select>
        <select className={selectClassName} defaultValue="all-matchups">
          <option value="all-matchups">All Matchups</option>
          <option value="r-r">R vs R</option>
          <option value="l-r">L vs R</option>
          <option value="l-l">L vs L</option>
          <option value="r-l">R vs L</option>
        </select>
        <select className={selectClassName} defaultValue="all-tiers">
          <option value="all-tiers">All Tiers</option>
          <option value="green-only">Green only</option>
          <option value="yellow-plus">Yellow &amp; above</option>
        </select>
        <select className={selectClassName} defaultValue="all-rain">
          <option value="no-rain">No Rain</option>
          <option value="all-rain">All</option>
          <option value="under-20">Under 20%</option>
        </select>
        <button className="h-8 rounded-md border border-[#22C55E] px-3 font-[family-name:var(--font-dm-mono)] text-[11px] text-[#22C55E]">
          ⚙ Tune xDinger™
        </button>
      </div>

      <div className="font-[family-name:var(--font-dm-mono)] text-[11px] text-[#A1A1AA]">
        {matchupCount} matchups
      </div>
    </div>
  );
}
