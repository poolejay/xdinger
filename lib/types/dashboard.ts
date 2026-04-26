export type Tier = "green" | "yellow" | "red";
export type BadgeResult = "hot" | "neutral" | "cold";
export type OddsMove = "up" | "down" | "flat";

export type XDingerScore = {
  id: number;
  score: number;
  tier: Tier;
  mlbId: number;
  firstName: string;
  lastName: string;
  team: string;
  position: string;
  bats: string;
  stackFlame?: boolean;
  rainPct: number;
  dome?: boolean;
  envScore: number;
  envDetail: string;
  handBatter: string;
  handPitcher: string;
  handResult: BadgeResult;
  splitAvg: number;
  splitSlg: number;
  pitchType: string;
  pitchPct: number;
  pitchAvg: number;
  pitchWhiff: number;
  pitchResult: BadgeResult;
  formValues: number[];
  formAvg: number;
  formSlg: number;
  formHr: number;
  formEv: number;
  bvpHr: number;
  bvpAb: number;
  pitcher: string;
  odds: number;
  oddsMove: OddsMove;
};

export type ZoneCell = {
  xslg?: number;
  zone_pct?: number;
  xslg_allowed?: number;
  pa_count?: number;
} | null;

export type ZoneData = {
  [zone: number]: ZoneCell;
};
