"use client";

import { Fragment, useMemo, useState } from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { XDingerRow } from "@/lib/data/types";
import { ExpandedRow } from "./ExpandedRow";
import { HandBadge } from "./HandBadge";
import { PitchBadge } from "./PitchBadge";
import { PlayerCell } from "./PlayerCell";
import { ScoreCell } from "./ScoreCell";
import { Sparkline } from "./Sparkline";

type MatchupTableProps = {
  data: XDingerRow[];
  laserData?: unknown[];
  isPro: boolean;
  onUnlockClick?: () => void;
};

function fmtAvg(value: number) {
  return value.toFixed(3).replace(/^0/, ".");
}

export function MatchupTable({ data, isPro, onUnlockClick }: MatchupTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "score", desc: true },
  ]);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const columns = useMemo<ColumnDef<XDingerRow>[]>(
    () => [
      {
        accessorKey: "xdinger_score",
        header: "xDinger™",
        cell: ({ row }) => (
          <ScoreCell score={row.original.xdinger_score} tier={row.original.tier} />
        ),
      },
      {
        accessorKey: "rain_probability",
        header: "Rain",
        cell: ({ row }) => {
          const rain = row.original.rain_probability;
          return (
            <span className="font-[family-name:var(--font-dm-mono)] text-[11px] text-[#A1A1AA]">
              {rain >= 25 ? "🌧️ " : ""}
              {rain}%
            </span>
          );
        },
      },
      {
        id: "player",
        accessorFn: (row) => row.player.name_last,
        header: "Player",
        cell: ({ row }) => (
          <PlayerCell
            mlbId={row.original.player.mlb_id}
            firstName={row.original.player.name_first}
            lastName={row.original.player.name_last}
            team={row.original.player.team}
            position={row.original.player.position}
            bats={row.original.player.bats}
            stackFlame={row.original.stack_flame}
          />
        ),
      },
      {
        accessorKey: "env_score",
        header: "EnvScore",
        cell: ({ row }) => (
          <div className="font-[family-name:var(--font-dm-mono)] text-[11px] text-[#A1A1AA]">
            <p className="text-white">{Math.round(row.original.env_score)}</p>
            <p>
              Park {row.original.park_factor.toFixed(2)} · {Math.round(row.original.wind_speed)}mph
            </p>
          </div>
        ),
      },
      {
        id: "splitCheck",
        accessorFn: (row) => row.batter_slg_vs_hand,
        header: "Split Check",
        cell: ({ row }) => (
          <div className="space-y-1">
            <HandBadge
              batter={`${row.original.player.bats}HB`}
              pitcher={`${row.original.pitcher.throws}HP`}
              result={row.original.hand_result}
            />
            <p className="font-[family-name:var(--font-dm-mono)] text-[10px] text-[#A1A1AA]">
              AVG {fmtAvg(row.original.batter_avg_vs_hand)} · SLG {fmtAvg(row.original.batter_slg_vs_hand)}
            </p>
          </div>
        ),
      },
      {
        id: "pitchSplits",
        accessorFn: (row) => row.batter_whiff_vs_pitch,
        header: "Pitch Splits",
        cell: ({ row }) => (
          <div className="space-y-1">
            <PitchBadge
              pitchType={row.original.primary_pitch_type}
              pitchPct={Math.round(row.original.primary_pitch_pct)}
              result={row.original.pitch_result}
            />
            <p className="font-[family-name:var(--font-dm-mono)] text-[10px] text-[#A1A1AA]">
              AVG {fmtAvg(row.original.batter_avg_vs_pitch)} · Whiff{" "}
              {(row.original.batter_whiff_vs_pitch * 100).toFixed(0)}%
            </p>
          </div>
        ),
      },
      {
        id: "recentForm",
        accessorFn: (row) => row.recent_avg,
        header: () => (
          <div className="flex items-center gap-1">
            <span>Recent Form</span>
            <select className="rounded border border-[#3F3F46] bg-[#18181B] px-1 py-0.5 text-[9px] text-[#A1A1AA]">
              <option>3G</option>
              <option>4G</option>
              <option>5G</option>
              <option>10G</option>
            </select>
          </div>
        ),
        cell: ({ row }) => (
          <div className="space-y-1">
            <Sparkline
              values={[
                Math.min(1, row.original.recent_avg * 2),
                Math.min(1, row.original.recent_slg),
                Math.min(1, row.original.recent_ev / 100),
              ]}
            />
            <p className="font-[family-name:var(--font-dm-mono)] text-[10px] text-[#A1A1AA]">
              {fmtAvg(row.original.recent_avg)} · {fmtAvg(row.original.recent_slg)} ·{" "}
              {row.original.recent_hr} HR · {row.original.recent_ev.toFixed(1)} EV
            </p>
          </div>
        ),
      },
      {
        id: "bvp",
        accessorFn: (row) => row.bvp_hr,
        header: "BvP",
        cell: ({ row }) => (
          <p className="font-[family-name:var(--font-dm-mono)] text-[11px] text-[#A1A1AA]">
            {row.original.bvp_hr} HR / {row.original.bvp_ab} AB vs {row.original.pitcher.name_last}
          </p>
        ),
      },
      {
        id: "odds",
        accessorFn: (row) => row.hr_odds,
        header: "Odds",
        cell: ({ row }) => (
          <div className="font-[family-name:var(--font-dm-mono)] text-[11px]">
            <p className="text-white">+{row.original.hr_odds}</p>
            <p
              className={
                row.original.odds_movement === "up"
                  ? "text-[#22C55E]"
                  : row.original.odds_movement === "down"
                    ? "text-[#EF4444]"
                    : "text-[#A1A1AA]"
              }
            >
              {row.original.odds_movement}
            </p>
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="relative overflow-hidden rounded-md border border-[#3F3F46] bg-[#27272A]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-[#303033]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className={`px-3 py-2 text-left font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-wide ${
                        sorted ? "text-white" : "text-[#A1A1AA]"
                      }`}
                    >
                      <button
                        className="inline-flex items-center gap-1"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        <span className="text-[#71717A]">↕</span>
                      </button>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, idx) => {
              const isExpanded = expandedRowId === row.original.id;
              const locked = !isPro && idx >= 5;
              return (
                <Fragment key={row.id}>
                  <tr
                    onClick={() =>
                      !locked &&
                      setExpandedRowId((prev) =>
                        prev === row.original.id ? null : row.original.id,
                      )
                    }
                    className={`min-h-16 border-t border-[#3F3F46]/70 transition-colors hover:bg-white/[0.025] ${
                      row.original.rain_probability >= 25 ? "bg-[rgba(239,68,68,0.035)]" : ""
                    } ${locked ? "cursor-not-allowed blur-[1.5px] opacity-45" : "cursor-pointer"}
                    ${
                      !isPro && idx === 5
                        ? "relative after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:to-[#18181B]/80"
                        : ""
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-[14px] align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                  <tr
                    className={`transition-all duration-300 ${isExpanded ? "opacity-100" : "opacity-0"}`}
                  >
                    <td
                      colSpan={row.getVisibleCells().length}
                      className={`bg-[#18181B] p-3 ${isExpanded ? "table-cell" : "hidden"}`}
                    >
                      <ExpandedRow
                        batterName={`${row.original.player.name_first} ${row.original.player.name_last}`}
                        pitcherName={row.original.pitcher.name_last}
                        primaryPitch={row.original.zone_data?.primary_pitch ?? row.original.primary_pitch_type}
                        batterZones={row.original.zone_data?.batter_zones ?? {}}
                        pitcherZones={row.original.zone_data?.pitcher_zones ?? {}}
                        batterVsPitchZones={row.original.zone_data?.batter_vs_pitch_zones ?? {}}
                        isPro={isPro}
                        onUnlockClick={onUnlockClick}
                      />
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {!isPro && data.length > 5 ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#18181B] to-transparent" />
      ) : null}
      {!isPro && data.length > 5 ? (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-md border border-white/20 bg-[#27272A] px-3 py-2 text-center">
          <p className="font-[family-name:var(--font-dm-mono)] text-[10px] text-[#A1A1AA]">
            Showing 5 of {data.length} matchups
          </p>
          <button
            onClick={onUnlockClick}
            className="mt-1 rounded bg-white px-2 py-1 font-[family-name:var(--font-outfit)] text-[10px] text-[#18181B]"
          >
            Unlock Pro
          </button>
        </div>
      ) : null}
    </div>
  );
}
