"use client";

import { useRouter } from "next/navigation";

function isoAddDays(iso: string, deltaDays: number): string {
  const d = new Date(`${iso}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return d.toISOString().split("T")[0];
}

type DateToggleProps = {
  /** YYYY-MM-DD (UTC) — must match the date used for data queries */
  selectedDate: string;
};

/**
 * Toggles the dashboard query date via the `?date=` search param. Server re-fetches on navigation.
 */
export function DateToggle({ selectedDate }: DateToggleProps) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const yesterday = isoAddDays(today, -1);

  function goTo(date: string) {
    if (date === today) {
      router.push("/dashboard");
    } else {
      router.push(`/dashboard?date=${encodeURIComponent(date)}`);
    }
    router.refresh();
  }

  return (
    <div className="flex w-fit items-center gap-0 rounded-md border border-[#3F3F46] bg-[#27272A] p-0.5 font-[family-name:var(--font-dm-mono)] text-[11px]">
      <button
        type="button"
        onClick={() => goTo(yesterday)}
        className={`rounded px-3 py-1.5 transition-colors ${
          selectedDate === yesterday ? "bg-[#303033] text-white" : "text-[#A1A1AA] hover:bg-[#303033] hover:text-white"
        }`}
      >
        Yesterday
      </button>
      <button
        type="button"
        onClick={() => goTo(today)}
        className={`rounded px-3 py-1.5 transition-colors ${
          selectedDate === today ? "bg-[#303033] text-white" : "text-[#A1A1AA] hover:bg-[#303033] hover:text-white"
        }`}
      >
        Today
      </button>
    </div>
  );
}
