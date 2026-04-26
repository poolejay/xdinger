"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type PlayerCellProps = {
  mlbId: number;
  firstName: string;
  lastName: string;
  team: string;
  position: string;
  bats: string;
  stackFlame?: boolean;
};

export function PlayerCell({
  mlbId,
  firstName,
  lastName,
  team,
  position,
  bats,
  stackFlame = false,
}: PlayerCellProps) {
  const [imgError, setImgError] = useState(mlbId === 0);
  const initials = useMemo(
    () => `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase(),
    [firstName, lastName],
  );
  const headshotUrl = `https://img.mlbstatic.com/mlb-photos/image/upload/w_60,q_100/v1/people/${mlbId}/headshot/67/current`;

  return (
    <div className="flex min-w-[220px] items-center gap-3">
      {imgError ? (
        <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[10px] bg-[#303033] font-[family-name:var(--font-syne)] text-sm font-bold text-white">
          {initials}
        </div>
      ) : (
        <Image
          src={headshotUrl}
          alt={`${firstName} ${lastName}`}
          width={42}
          height={42}
          className="h-[42px] w-[42px] rounded-[10px] object-cover object-top"
          onError={() => setImgError(true)}
        />
      )}

      <div className="space-y-0.5">
        <p className="font-[family-name:var(--font-outfit)] text-[11px] leading-tight text-[#A1A1AA]">
          {firstName}
        </p>
        <p className="font-[family-name:var(--font-syne)] text-[15px] font-bold leading-tight text-white">
          {lastName} {stackFlame ? "🔥" : ""}
        </p>
        <span className="inline-flex rounded-full bg-[#18181B] px-2 py-0.5 font-[family-name:var(--font-dm-mono)] text-[10px] text-[#A1A1AA]">
          {team} · {position} · {bats}HB
        </span>
      </div>
    </div>
  );
}
