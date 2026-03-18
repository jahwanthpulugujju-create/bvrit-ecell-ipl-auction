import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Player, initialPlayers, PlayerStatus } from '@/data/players';
import { playBidBeep, playSoldFanfare, playUnsoldSound } from '@/lib/sounds';

export function formatPrice(lakhs: number): string {
  if (lakhs >= 100) return `₹${(lakhs / 100).toFixed(2)} Cr`;
  return `₹${lakhs} L`;
}

export interface TeamDB {
  id: string;
  name: string;
  slug: string;
  city: string;
  color: string;
  purse: number;
  initial_purse: number;
  rtm_remaining: number;
  password_hash: string;
  is_active: boolean;
}

export interface AuctionStateDB {
  id: number;
  status: string;
  current_player_id: string | null;
  current_bid_amount: number;
  leading_team_id: string | null;
  timer_expires_at: number | null;
  timer_running: boolean;
  current_phase: string;
  bid_increment: number;
  bid_reset_seconds: number;
}

export interface TeamPlayerFreeze {
  id: string;
  team_id: string;
  player_id: string;
  freeze_expires_at: number;
  freeze_seconds: number;
  bid_amount: number;
}

export interface TeamGlobalCooldown {
  team_id: string;
  global_expires_at: number;
  last_bid_at: number;
}

export interface RtmState {
  id: number;
  active: boolean;
  player_id: string | null;
  eligible_team_id: string | null;
  matched_price: number;
  timer_expires_at: number | null;
}

export interface FreezeConfig {
  min_freeze_seconds: number;
  base_freeze_seconds: number;
  increment_unit_lakhs: number;
  increment_seconds: number;
  max_freeze_seconds: number;
  global_cooldown_seconds: number;
}

export type BidResult =
  | { success: true; freezeSeconds: number }
  | { success: false; reason: 'NO_CURRENT_PLAYER' | 'SUPABASE_ERROR' }
  | { success: false; reason: 'PLAYER_COOLDOWN'; remainingSeconds: number }
  | { success: false; reason: 'GLOBAL_COOLDOWN'; remainingSeconds: number }
  | { success: false; reason: 'INSUFFICIENT_PURSE'; purseRemaining: number };

interface AuctionContextValue {
  auctionState: AuctionStateDB | null;
  players: Player[];
  teams: TeamDB[];
  freezes: TeamPlayerFreeze[];
  globalCooldowns: Record<string, TeamGlobalCooldown>;
  rtmState: RtmState | null;
  freezeConfig: FreezeConfig;
  connected: boolean;

  registerBid: (teamId: string) => Promise<BidResult>;
  setCurrentPlayer: (playerId: string) => Promise<void>;
  confirmSale: () => Promise<void>;
  markUnsold: () => Promise<void>;
  reIntroducePlayer: (playerId: string) => Promise<void>;
  startTimer: () => Promise<void>;
  pauseTimer: () => Promise<void>;
  resetTimer: () => Promise<void>;
  setStatus: (status: string) => Promise<void>;
  setPhase: (phase: string) => Promise<void>;
  setBidIncrement: (increment: number) => Promise<void>;
  clearTeamFreeze: (teamId: string, playerId: string) => Promise<void>;
  clearAllFreezesForPlayer: (playerId: string) => Promise<void>;

  useRtm: (teamId: string) => Promise<void>;
  declineRtm: () => Promise<void>;

  getPlayer: (id: string) => Player | undefined;
  getTeam: (id: string) => TeamDB | undefined;
  getTeamBySlug: (slug: string) => TeamDB | undefined;
  computeFreezeSecs: (bidAmountLakhs: number) => number;
  getTeamFreezeForCurrentPlayer: (teamId: string) => TeamPlayerFreeze | null;
}

const DEFAULT_FREEZE_CONFIG: FreezeConfig = {
  min_freeze_seconds: 3,
  base_freeze_seconds: 3,
  increment_unit_lakhs: 20,
  increment_seconds: 2,
  max_freeze_seconds: 30,
  global_cooldown_seconds: 1,
};

const AuctionContext = createContext<AuctionContextValue | null>(null);

function derivePlayerStatuses(
  base: Player[],
  squadEntries: { player_id: string; team_id: string; purchase_price: number }[],
  unsoldIds: Set<string>,
  livePlayerId: string | null,
  teams: TeamDB[]
): Player[] {
  const soldMap = new Map(squadEntries.map(s => [s.player_id, s]));
  return base.map(p => {
    const squadEntry = soldMap.get(p.id);
    let status: PlayerStatus = 'available';
    let soldToTeamId: string | null = null;
    let soldPrice: number | null = null;
    if (p.id === livePlayerId) {
      status = 'live';
    } else if (squadEntry) {
      status = 'sold';
      soldToTeamId = squadEntry.team_id;
      soldPrice = squadEntry.purchase_price;
    } else if (unsoldIds.has(p.id)) {
      status = 'unsold';
    }
    return { ...p, status, soldToTeamId, soldPrice };
  });
}

function enrichTeams(
  teams: TeamDB[],
  squadEntries: { player_id: string; team_id: string }[]
): TeamDB[] {
  return teams;
}

export function AuctionProvider({ children }: { children: ReactNode }) {
  const [auctionState, setAuctionState] = useState<AuctionStateDB | null>(null);
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [teams, setTeams] = useState<TeamDB[]>([]);
  const [freezes, setFreezes] = useState<TeamPlayerFreeze[]>([]);
  const [globalCooldowns, setGlobalCooldowns] = useState<Record<string, TeamGlobalCooldown>>({});
  const [rtmState, setRtmState] = useState<RtmState | null>(null);
  const [freezeConfig, setFreezeConfig] = useState<FreezeConfig>(DEFAULT_FREEZE_CONFIG);
  const [connected, setConnected] = useState(false);

  const squadRef = useRef<{ player_id: string; team_id: string; purchase_price: number }[]>([]);
  const unsoldIdsRef = useRef<Set<string>>(new Set());

  const refreshPlayers = useCallback((
    livePlayerId: string | null,
    newSquad?: { player_id: string; team_id: string; purchase_price: number }[],
    newUnsold?: Set<string>
  ) => {
    const squad = newSquad ?? squadRef.current;
    const unsold = newUnsold ?? unsoldIdsRef.current;
    if (newSquad) squadRef.current = newSquad;
    if (newUnsold) unsoldIdsRef.current = newUnsold;
    setPlayers(base => derivePlayerStatuses(initialPlayers, squad, unsold, livePlayerId, []));
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      const [
        { data: aState },
        { data: teamsData },
        { data: freezesData },
        { data: cooldownsData },
        { data: rtmData },
        { data: configData },
        { data: squadData },
        { data: unsoldLogs },
      ] = await Promise.all([
        supabase.from('auction_state').select('*').limit(1).maybeSingle(),
        supabase.from('teams').select('*').eq('is_active', true).order('name'),
        supabase.from('team_player_freezes').select('*'),
        supabase.from('team_global_cooldowns').select('*'),
        supabase.from('rtm_state').select('*').limit(1).maybeSingle(),
        supabase.from('auction_config').select('*').limit(1).maybeSingle(),
        supabase.from('team_squads').select('player_id, team_id, purchase_price'),
        supabase.from('auction_log').select('player_id').eq('type', 'unsold'),
      ]);

      if (cancelled) return;

      if (aState) setAuctionState(aState as AuctionStateDB);
      if (teamsData) setTeams(teamsData as TeamDB[]);
      if (freezesData) setFreezes(freezesData as TeamPlayerFreeze[]);
      if (cooldownsData) {
        const map: Record<string, TeamGlobalCooldown> = {};
        (cooldownsData as TeamGlobalCooldown[]).forEach(c => { map[c.team_id] = c; });
        setGlobalCooldowns(map);
      }
      if (rtmData) setRtmState(rtmData as RtmState);
      if (configData) {
        setFreezeConfig({
          min_freeze_seconds: (configData as any).freeze_min_seconds ?? DEFAULT_FREEZE_CONFIG.min_freeze_seconds,
          base_freeze_seconds: (configData as any).freeze_base_seconds ?? DEFAULT_FREEZE_CONFIG.base_freeze_seconds,
          increment_unit_lakhs: (configData as any).freeze_increment_unit_lakhs ?? DEFAULT_FREEZE_CONFIG.increment_unit_lakhs,
          increment_seconds: (configData as any).freeze_increment_seconds ?? DEFAULT_FREEZE_CONFIG.increment_seconds,
          max_freeze_seconds: (configData as any).freeze_max_seconds ?? DEFAULT_FREEZE_CONFIG.max_freeze_seconds,
          global_cooldown_seconds: (configData as any).freeze_global_cooldown_seconds ?? DEFAULT_FREEZE_CONFIG.global_cooldown_seconds,
        });
      }

      const squad = (squadData || []) as { player_id: string; team_id: string; purchase_price: number }[];
      const unsoldSet = new Set<string>(
        (unsoldLogs || []).map((l: any) => l.player_id).filter(Boolean)
      );
      squadRef.current = squad;
      unsoldIdsRef.current = unsoldSet;

      const liveId = (aState as AuctionStateDB | null)?.current_player_id ?? null;
      setPlayers(derivePlayerStatuses(initialPlayers, squad, unsoldSet, liveId, []));
    };

    fetchAll();

    const channels = [
      supabase.channel('ctx-auction')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'auction_state' }, payload => {
          const newState = payload.new as AuctionStateDB;
          setAuctionState(newState);
          setPlayers(prev => {
            const liveId = newState.current_player_id;
            return derivePlayerStatuses(initialPlayers, squadRef.current, unsoldIdsRef.current, liveId, []);
          });
        })
        .subscribe(status => { if (!cancelled) setConnected(status === 'SUBSCRIBED'); }),

      supabase.channel('ctx-teams')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, payload => {
          if (payload.eventType === 'DELETE') {
            setTeams(prev => prev.filter(t => t.id !== (payload.old as any).id));
          } else {
            const updated = payload.new as TeamDB;
            setTeams(prev => {
              const exists = prev.find(t => t.id === updated.id);
              if (exists) return prev.map(t => t.id === updated.id ? updated : t);
              return [...prev, updated];
            });
          }
        })
        .subscribe(),

      supabase.channel('ctx-squads')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'team_squads' }, async () => {
          const { data } = await supabase.from('team_squads').select('player_id, team_id, purchase_price');
          if (data && !cancelled) {
            squadRef.current = data as { player_id: string; team_id: string; purchase_price: number }[];
            setAuctionState(prev => {
              setPlayers(derivePlayerStatuses(initialPlayers, squadRef.current, unsoldIdsRef.current, prev?.current_player_id ?? null, []));
              return prev;
            });
          }
        })
        .subscribe(),

      supabase.channel('ctx-freezes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'team_player_freezes' }, payload => {
          if (payload.eventType === 'DELETE') {
            setFreezes(prev => prev.filter(f => f.id !== (payload.old as any).id));
          } else {
            const updated = payload.new as TeamPlayerFreeze;
            setFreezes(prev => {
              const exists = prev.findIndex(f => f.id === updated.id);
              return exists >= 0 ? prev.map(f => f.id === updated.id ? updated : f) : [...prev, updated];
            });
          }
        })
        .subscribe(),

      supabase.channel('ctx-cooldowns')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'team_global_cooldowns' }, payload => {
          const updated = payload.new as TeamGlobalCooldown;
          setGlobalCooldowns(prev => ({ ...prev, [updated.team_id]: updated }));
        })
        .subscribe(),

      supabase.channel('ctx-rtm')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'rtm_state' }, payload => {
          setRtmState(payload.new as RtmState);
        })
        .subscribe(),
    ];

    return () => {
      cancelled = true;
      channels.forEach(c => supabase.removeChannel(c));
    };
  }, []);

  const computeFreezeSecs = useCallback((bidAmountLakhs: number): number => {
    const cfg = freezeConfig;
    const increments = Math.floor(bidAmountLakhs / cfg.increment_unit_lakhs);
    const raw = cfg.base_freeze_seconds + increments * cfg.increment_seconds;
    return Math.min(Math.max(cfg.min_freeze_seconds, raw), cfg.max_freeze_seconds);
  }, [freezeConfig]);

  const registerBid = useCallback(async (teamId: string): Promise<BidResult> => {
    const team = teams.find(t => t.id === teamId);
    const state = auctionState;
    if (!team || !state || !state.current_player_id) {
      return { success: false, reason: 'NO_CURRENT_PLAYER' };
    }

    const now = Date.now();
    const freeze = freezes.find(f =>
      f.team_id === teamId &&
      f.player_id === state.current_player_id &&
      f.freeze_expires_at > now
    );
    if (freeze) {
      return { success: false, reason: 'PLAYER_COOLDOWN', remainingSeconds: Math.ceil((freeze.freeze_expires_at - now) / 1000) };
    }

    const gc = globalCooldowns[teamId];
    if (gc && gc.global_expires_at > now) {
      return { success: false, reason: 'GLOBAL_COOLDOWN', remainingSeconds: Math.ceil((gc.global_expires_at - now) / 1000) };
    }

    const newBid = state.leading_team_id
      ? state.current_bid_amount + state.bid_increment
      : state.current_bid_amount;

    if (team.purse < newBid) {
      return { success: false, reason: 'INSUFFICIENT_PURSE', purseRemaining: team.purse };
    }

    const freezeSecs = computeFreezeSecs(newBid);
    const freezeExpiresAt = now + freezeSecs * 1000;
    const globalExpiresAt = now + (freezeConfig.global_cooldown_seconds * 1000);
    const timerExpiresAt = now + (state.bid_reset_seconds * 1000);

    const { error } = await supabase.rpc('register_bid', {
      p_player_id: state.current_player_id,
      p_team_id: teamId,
      p_amount: newBid,
      p_timer_expires_at: timerExpiresAt,
      p_freeze_expires_at: freezeExpiresAt,
      p_freeze_seconds: freezeSecs,
      p_global_expires_at: globalExpiresAt,
    });

    if (error) {
      console.error('register_bid RPC error:', error);
      return { success: false, reason: 'SUPABASE_ERROR' };
    }

    playBidBeep();
    return { success: true, freezeSeconds: freezeSecs };
  }, [teams, auctionState, freezes, globalCooldowns, freezeConfig, computeFreezeSecs]);

  const setCurrentPlayer = useCallback(async (playerId: string) => {
    const player = initialPlayers.find(p => p.id === playerId);
    if (!player) return;
    await Promise.all([
      supabase.from('auction_state').update({
        current_player_id: playerId,
        current_bid_amount: player.basePrice,
        leading_team_id: null,
        timer_running: false,
        timer_expires_at: null,
        status: 'live',
        updated_at: new Date().toISOString(),
      }).eq('id', 1),
      supabase.from('team_player_freezes').delete().eq('player_id', playerId),
    ]);
  }, []);

  const confirmSale = useCallback(async () => {
    const state = auctionState;
    if (!state?.current_player_id || !state.leading_team_id) return;
    const team = teams.find(t => t.id === state.leading_team_id);
    if (!team) return;
    const newPurse = team.purse - state.current_bid_amount;

    await Promise.all([
      supabase.from('team_squads').upsert(
        { team_id: state.leading_team_id, player_id: state.current_player_id, purchase_price: state.current_bid_amount },
        { onConflict: 'team_id,player_id' }
      ),
      supabase.from('teams').update({ purse: newPurse, updated_at: new Date().toISOString() }).eq('id', state.leading_team_id),
      supabase.from('team_player_freezes').delete().eq('player_id', state.current_player_id),
      supabase.from('auction_state').update({
        current_player_id: null,
        current_bid_amount: 0,
        leading_team_id: null,
        timer_running: false,
        timer_expires_at: null,
        updated_at: new Date().toISOString(),
      }).eq('id', 1),
      supabase.from('auction_log').insert({
        type: 'sold',
        player_id: state.current_player_id,
        team_id: state.leading_team_id,
        amount: state.current_bid_amount,
        message: `Sold for ${formatPrice(state.current_bid_amount)}`,
      }),
    ]);
    playSoldFanfare();
  }, [auctionState, teams]);

  const markUnsold = useCallback(async () => {
    const state = auctionState;
    if (!state?.current_player_id) return;
    const playerId = state.current_player_id;

    unsoldIdsRef.current = new Set([...unsoldIdsRef.current, playerId]);

    await Promise.all([
      supabase.from('auction_state').update({
        current_player_id: null,
        current_bid_amount: 0,
        leading_team_id: null,
        timer_running: false,
        timer_expires_at: null,
        updated_at: new Date().toISOString(),
      }).eq('id', 1),
      supabase.from('team_player_freezes').delete().eq('player_id', playerId),
      supabase.from('auction_log').insert({
        type: 'unsold',
        player_id: playerId,
        message: 'Went unsold',
      }),
    ]);
    playUnsoldSound();
  }, [auctionState]);

  const reIntroducePlayer = useCallback(async (playerId: string) => {
    unsoldIdsRef.current = new Set([...unsoldIdsRef.current].filter(id => id !== playerId));
    setPlayers(derivePlayerStatuses(initialPlayers, squadRef.current, unsoldIdsRef.current, auctionState?.current_player_id ?? null, []));
  }, [auctionState]);

  const startTimer = useCallback(async () => {
    const state = auctionState;
    if (!state) return;
    const expiresAt = Date.now() + (state.bid_reset_seconds || 15) * 1000;
    await supabase.from('auction_state').update({
      timer_running: true,
      timer_expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    }).eq('id', 1);
  }, [auctionState]);

  const pauseTimer = useCallback(async () => {
    await supabase.from('auction_state').update({
      timer_running: false,
      updated_at: new Date().toISOString(),
    }).eq('id', 1);
  }, []);

  const resetTimer = useCallback(async () => {
    await supabase.from('auction_state').update({
      timer_running: false,
      timer_expires_at: null,
      updated_at: new Date().toISOString(),
    }).eq('id', 1);
  }, []);

  const setStatus = useCallback(async (status: string) => {
    await supabase.from('auction_state').update({ status, updated_at: new Date().toISOString() }).eq('id', 1);
  }, []);

  const setPhase = useCallback(async (phase: string) => {
    await supabase.from('auction_state').update({ current_phase: phase, updated_at: new Date().toISOString() }).eq('id', 1);
  }, []);

  const setBidIncrement = useCallback(async (increment: number) => {
    await supabase.from('auction_state').update({ bid_increment: increment, updated_at: new Date().toISOString() }).eq('id', 1);
  }, []);

  const clearTeamFreeze = useCallback(async (teamId: string, playerId: string) => {
    await supabase.from('team_player_freezes').delete().eq('team_id', teamId).eq('player_id', playerId);
  }, []);

  const clearAllFreezesForPlayer = useCallback(async (playerId: string) => {
    await supabase.from('team_player_freezes').delete().eq('player_id', playerId);
  }, []);

  const useRtm = useCallback(async (teamId: string) => {
    const state = rtmState;
    if (!state?.active || !state.eligible_team_id) return;
    const team = teams.find(t => t.id === teamId);
    if (!team || team.rtm_remaining <= 0) return;
    await Promise.all([
      supabase.from('team_squads').upsert(
        { team_id: teamId, player_id: state.player_id!, purchase_price: state.matched_price },
        { onConflict: 'team_id,player_id' }
      ),
      supabase.from('teams').update({
        purse: team.purse - state.matched_price,
        rtm_remaining: team.rtm_remaining - 1,
        updated_at: new Date().toISOString(),
      }).eq('id', teamId),
      supabase.from('rtm_state').update({
        active: false,
        updated_at: new Date().toISOString(),
      }).eq('id', 1),
      supabase.from('auction_log').insert({
        type: 'rtm_used',
        player_id: state.player_id,
        team_id: teamId,
        amount: state.matched_price,
        message: `RTM used — matched at ${formatPrice(state.matched_price)}`,
      }),
    ]);
  }, [rtmState, teams]);

  const declineRtm = useCallback(async () => {
    await supabase.from('rtm_state').update({ active: false, updated_at: new Date().toISOString() }).eq('id', 1);
  }, []);

  const getPlayer = useCallback((id: string) => players.find(p => p.id === id), [players]);
  const getTeam = useCallback((id: string) => teams.find(t => t.id === id), [teams]);
  const getTeamBySlug = useCallback((slug: string) => teams.find(t => t.slug === slug), [teams]);
  const getTeamFreezeForCurrentPlayer = useCallback((teamId: string): TeamPlayerFreeze | null => {
    const playerId = auctionState?.current_player_id;
    if (!playerId) return null;
    const now = Date.now();
    return freezes.find(f => f.team_id === teamId && f.player_id === playerId && f.freeze_expires_at > now) ?? null;
  }, [freezes, auctionState]);

  return (
    <AuctionContext.Provider value={{
      auctionState, players, teams, freezes, globalCooldowns, rtmState, freezeConfig, connected,
      registerBid, setCurrentPlayer, confirmSale, markUnsold, reIntroducePlayer,
      startTimer, pauseTimer, resetTimer, setStatus, setPhase, setBidIncrement,
      clearTeamFreeze, clearAllFreezesForPlayer,
      useRtm, declineRtm,
      getPlayer, getTeam, getTeamBySlug, computeFreezeSecs, getTeamFreezeForCurrentPlayer,
    }}>
      {children}
    </AuctionContext.Provider>
  );
}

export function useAuction() {
  const ctx = useContext(AuctionContext);
  if (!ctx) throw new Error('useAuction must be inside AuctionProvider');
  return ctx;
}
