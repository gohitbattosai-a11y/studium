import cfgRaw from "@/config/stadium.config.json";
import rosterRaw from "@/config/stadium.roster.json";

export type PosId = "POR" | "DIF" | "CEN" | "ATT";
export type StatId = "rit" | "tir" | "pas" | "dri" | "dif" | "fis";

export interface TierCfg {
  id: string;
  name: string;
  min: number;
}

export interface RosterEntry {
  id: string;
  name: string;
  pos: PosId;
  ovr: number;
  pot?: number;
  price?: number;
  stats?: Partial<Record<StatId, number>>;
  team?: string;
  card?: string;
  skin?: string;
  hair?: string;
  hairStyle?: number;
}

export interface StadiumConfig {
  economy: { startBudget: number; squadMax: number; squadMin: number; sellRatio: number; teamPriceRatio: number; prizes: number[] };
  price: { base: number; pivot: number; exponent: number };
  training: { costBase: number; costPerOvr: number; secondsBase: number; secondsPerOvr: number };
  tiers: TierCfg[];
  random: { enabled: boolean; market: Record<PosId, number>; marketOvrMin: number; marketOvrSpread: number; botOvrMin: number; botOvrMax: number };
  teamColors: string[];
  match: {
    secondsPerMinute: number;
    speeds: number[];
    defaultSpeed: number;
    playerSpeed: number;
    gkSpeed: number;
    dribbleSpeed: number;
    passSpeed: number;
    shotSpeed: number;
    minSeparation: number;
    intervalSeconds: number;
    celebrationSeconds: number;
    gkColors: [string, string];
    awayAlt: string;
    clashDistance: number;
  };
}

export const CFG: StadiumConfig = cfgRaw as StadiumConfig;
export const ROSTER: RosterEntry[] = rosterRaw as RosterEntry[];

const tiersDesc = [...CFG.tiers].sort((a, b) => b.min - a.min);
export const tierFor = (ovr: number): TierCfg => tiersDesc.find((t) => ovr >= t.min) ?? tiersDesc[tiersDesc.length - 1];
