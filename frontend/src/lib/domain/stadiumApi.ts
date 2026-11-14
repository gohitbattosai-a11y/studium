import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api/client";
import { errMsg } from "@/lib/utils/format";
import { addBudget, applyServer, myTeam, syncDay, useStadium, type Fixture, type Player, type Team } from "@/lib/domain/football";

export interface ServerSettings {
  interval_minutes: number;
  serie_a_interval_minutes: number;
  min_teams: number;
  max_teams: number;
  default_teams: number;
  walkover_goals: number;
  auto_substitute: boolean;
  serie_a_teams: number;
  serie_a_relegated: number;
  colors: string[];
  discipline: Record<string, number>;
  squad_max: number;
}

export interface ClubInfo {
  id: string;
  name: string;
  color: string;
  formation: string;
  xi: (string | null)[];
  players: Player[];
  status: Record<string, { kind: "injury" | "red"; left: number }>;
  pending: number;
  played: number;
  custom_league_id: string | null;
  serie_a_id: string | null;
}

export interface CardInfo {
  id: string;
  rarity: string;
  exclusive_id: string | null;
  player: Player;
}

export interface NextMatch {
  id: string;
  at: number;
  day: number;
  league_id: string;
  league: string;
  kind: string;
  opponent: string;
  home: boolean;
}

export interface ServerState {
  now: number;
  settings: ServerSettings;
  club: ClubInfo | null;
  cards: CardInfo[];
  next: NextMatch | null;
  warning: string | null;
}

export interface LeagueCard {
  id: string;
  name: string;
  kind: "custom" | "serie_a";
  status: string;
  size: number;
  teams: number;
  season: number;
  private: boolean;
  code?: string | null;
  joined: boolean;
  owner: boolean;
  owner_name?: string | null;
  humans: number;
  interval_minutes: number;
  day: number;
  total_days: number;
  start_at?: number | null;
}

export interface TableRow {
  rank: number;
  id: string;
  name: string;
  color: string;
  bot: boolean;
  p: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
}

export interface FixtureRow {
  id: string;
  day: number;
  at: number;
  status: string;
  home: string;
  away: string;
  hg: number | null;
  ag: number | null;
  walkover: string | null;
  events: { min: number; teamId: string; player: string }[];
}

export interface LeagueDetail extends LeagueCard {
  teams_list: { id: string; name: string; color: string; bot?: boolean; mine?: boolean }[];
  champion: string | null;
  now: number;
  table: TableRow[];
  fixtures: FixtureRow[];
  scorers: { player: string; team: string; goals: number }[];
  promoted_waiting?: number;
  next_season_at?: number | null;
}

export interface LeaguesOut {
  serie_a: LeagueCard | null;
  leagues: LeagueCard[];
  now: number;
}

export interface Snap {
  id: string;
  name: string;
  color: string;
  formation: string;
  xi: (string | null)[];
  players: Player[];
}

export interface Replay {
  id: string;
  league: string;
  day: number;
  at: number;
  hg: number;
  ag: number;
  walkover: string | null;
  reason: string | null;
  events: Fixture["events"];
  log: Fixture["log"];
  home: Snap;
  away: Snap;
  notes: Record<string, unknown>;
}

export interface PackInfo {
  id: string;
  name: string;
  price: number;
  cards: number;
  tone: string;
  blurb: string;
  guarantee: string | null;
  odds: Record<string, number>;
}

export interface PackState {
  participating: boolean;
  balance: number;
  packs: PackInfo[];
  pity: number;
  collection: { id: string; name: string; pos: string; ovr: number; rarity: string; card: string; owned: boolean }[];
}

export interface PulledCard {
  id: string;
  rarity: string;
  exclusive: boolean;
  player: Player;
}

export interface OpenResult {
  pack: PackInfo;
  cards: PulledCard[];
  balance: number;
  pity: number;
}

export const teamOfSnap = (s: Snap): Team => ({ id: s.id, name: s.name, color: s.color, players: s.players, mine: false, formation: s.formation, xi: s.xi, budget: 0 });

const KEY = ["stadium"];
const STATE = [...KEY, "state"];

export const useServerState = (enabled = true) => useQuery({ queryKey: STATE, queryFn: () => apiGet<ServerState>("/stadium/state"), enabled, refetchInterval: 20_000, staleTime: 5_000 });
export const useLeagues = (enabled = true) => useQuery({ queryKey: [...KEY, "leagues"], queryFn: () => apiGet<LeaguesOut>("/stadium/leagues"), enabled, refetchInterval: 20_000 });
export const useLeague = (id: string | null) => useQuery({ queryKey: [...KEY, "league", id], queryFn: () => apiGet<LeagueDetail>(id === "serie-a" ? "/stadium/serie-a" : `/stadium/leagues/${id}`), enabled: !!id, refetchInterval: 20_000 });
export const useReplay = (id: string | null) => useQuery({ queryKey: [...KEY, "replay", id], queryFn: () => apiGet<Replay>(`/stadium/fixtures/${id}`), enabled: !!id, staleTime: Infinity });
export const usePacks = (enabled = true) => useQuery({ queryKey: [...KEY, "packs"], queryFn: () => apiGet<PackState>("/stadium/packs"), enabled });

export function useStadiumActions() {
  const qc = useQueryClient();
  const all = () => qc.invalidateQueries({ queryKey: KEY });
  const onError = (e: unknown) => toast.error(errMsg(e));
  return {
    createClub: useMutation({ mutationFn: (v: { name: string; color: string }) => apiPost<ClubInfo>("/stadium/club", v), onSuccess: all, onError }),
    createLeague: useMutation({ mutationFn: (v: { name: string; size: number; private: boolean }) => apiPost<LeagueCard>("/stadium/leagues", v), onSuccess: all, onError }),
    join: useMutation({ mutationFn: (v: { id: string; code?: string }) => apiPost(`/stadium/leagues/${v.id}/join`, { code: v.code ?? null }), onSuccess: all, onError }),
    leave: useMutation({ mutationFn: (id: string) => apiPost(`/stadium/leagues/${id}/leave`), onSuccess: all, onError }),
    remove: useMutation({ mutationFn: (id: string) => apiDelete(`/stadium/leagues/${id}`), onSuccess: all, onError }),
    start: useMutation({ mutationFn: (id: string) => apiPost(`/stadium/leagues/${id}/start`), onSuccess: all, onError }),
    open: useMutation({
      mutationFn: (pack_id: string) => apiPost<OpenResult>("/stadium/packs/open", { pack_id }),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [...KEY, "packs"] });
        qc.invalidateQueries({ queryKey: STATE });
      },
      onError,
    }),
    release: useMutation({
      mutationFn: (card_id: string) => apiPost<{ value: number }>("/stadium/cards/release", { card_id }),
      onSuccess: all,
      onError,
    }),
  };
}

export function useClubSync() {
  const s = useStadium();
  const qc = useQueryClient();
  const mine = myTeam(s);
  const q = useServerState(!!mine);
  const data = q.data;
  const creating = useRef(false);
  const lastSig = useRef("");
  const claiming = useRef(false);

  useEffect(() => {
    if (!mine || !data || data.club || creating.current) return;
    creating.current = true;
    apiPost<ClubInfo>("/stadium/club", { name: mine.name, color: mine.color })
      .then(() => qc.invalidateQueries({ queryKey: KEY }))
      .catch((e) => toast.error(errMsg(e)))
      .finally(() => {
        creating.current = false;
      });
  }, [mine, data, qc]);

  useEffect(() => {
    if (!data?.club) return;
    applyServer(data.club.status, data.cards);
    syncDay(data.club.played);
  }, [data]);

  useEffect(() => {
    if (!data?.club || data.club.pending <= 0 || claiming.current) return;
    claiming.current = true;
    apiPost<{ amount: number }>("/stadium/club/claim")
      .then((r) => {
        if (r.amount > 0) {
          addBudget(r.amount);
          toast.success(`Premi partita incassati: +€${r.amount.toFixed(1)}M`);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        claiming.current = false;
        qc.invalidateQueries({ queryKey: STATE });
      });
  }, [data?.club?.pending, data?.club, qc]);

  const sig = mine && data?.club ? JSON.stringify([mine.formation, mine.xi, mine.players.map((p) => [p.id, p.name, p.pos, p.ovr, p.pot, p.stats, p.price, p.priceAt, p.goals])]) : "";
  useEffect(() => {
    if (!sig || sig === lastSig.current || !mine) return;
    const t = window.setTimeout(() => {
      lastSig.current = sig;
      apiPut<{ club: ClubInfo; warning: string | null }>("/stadium/club/squad", { formation: mine.formation, xi: mine.xi, players: mine.players })
        .then((r) => {
          qc.setQueryData<ServerState>(STATE, (old) => (old ? { ...old, club: r.club, warning: r.warning } : old));
        })
        .catch(() => {
          lastSig.current = "";
        });
    }, 1200);
    return () => window.clearTimeout(t);
  }, [sig, mine, qc]);

  return q;
}
