import React, { createContext, useContext, useReducer, useCallback, ReactNode, useEffect } from 'react';
import { Player, initialPlayers } from '@/data/players';
import { Team, initialTeams, EMPTY_ROLE_COUNTS } from '@/data/teams';

export type AuctionStatus = 'pre' | 'retention' | 'live' | 'pending_sale' | 'rtm_window' | 'complete';
export type AuctionPhase = 'marquee' | 'premium' | 'mid-tier' | 'budget';

interface FreezeEntry {
  teamId: string;
  playerId: string;
  freezeExpiresAt: number;
  freezeSeconds: number;
  bidAmount: number;
}

interface AuctionState {
  status: AuctionStatus;
  currentPlayerId: string | null;
  currentBid: number;
  leadingTeamId: string | null;
  timerSeconds: number;
  timerRunning: boolean;
  currentPhase: AuctionPhase;
  players: Player[];
  teams: Team[];
  auctionLog: LogEntry[];
  soldCount: number;
  totalValue: number;
  bidIncrement: number;
  freezes: FreezeEntry[];
  freezeConfig: {
    minFreezeSeconds: number;
    baseFreezeSeconds: number;
    incrementUnitLakhs: number;
    incrementSeconds: number;
    maxFreezeSeconds: number;
    globalCooldownSeconds: number;
  };
  globalCooldowns: Record<string, number>; // teamId -> expires_at
}

interface LogEntry {
  type: string;
  playerId?: string;
  teamId?: string;
  amount?: number;
  message: string;
  timestamp: number;
}

type Action =
  | { type: 'SET_CURRENT_PLAYER'; playerId: string }
  | { type: 'PLACE_BID'; teamId: string }
  | { type: 'SELL_PLAYER' }
  | { type: 'MARK_UNSOLD' }
  | { type: 'TIMER_TICK' }
  | { type: 'START_TIMER' }
  | { type: 'PAUSE_TIMER' }
  | { type: 'RESET_TIMER'; seconds: number }
  | { type: 'SET_STATUS'; status: AuctionStatus }
  | { type: 'SET_PHASE'; phase: AuctionPhase }
  | { type: 'SET_INCREMENT'; increment: number }
  | { type: 'ADD_TEAM'; team: Team }
  | { type: 'REMOVE_TEAM'; teamId: string }
  | { type: 'UPDATE_TEAM'; teamId: string; updates: Partial<Team> }
  | { type: 'IMPORT_PLAYERS'; players: Player[] }
  | { type: 'ADD_PLAYER'; player: Player }
  | { type: 'REMOVE_PLAYER'; playerId: string }
  | { type: 'UPDATE_PLAYER'; playerId: string; updates: Partial<Player> }
  | { type: 'CLEAR_FREEZE'; teamId: string; playerId: string }
  | { type: 'CLEAR_ALL_FREEZES_FOR_PLAYER'; playerId: string }
  | { type: 'CLEAR_ALL_FREEZES_FOR_TEAM'; teamId: string }
  | { type: 'UNDO_LAST' }
  | { type: 'LOAD_STATE'; state: AuctionState };

function formatPrice(lakhs: number): string {
  if (lakhs >= 100) return `₹${(lakhs / 100).toFixed(2)} Cr`;
  return `₹${lakhs} L`;
}

function computeFreezeSecs(bidAmountLakhs: number, config: AuctionState['freezeConfig']): number {
  const increments = Math.floor(bidAmountLakhs / config.incrementUnitLakhs);
  const raw = config.baseFreezeSeconds + increments * config.incrementSeconds;
  return Math.min(Math.max(config.minFreezeSeconds, raw), config.maxFreezeSeconds);
}

function isTeamFrozen(state: AuctionState, teamId: string, playerId: string): { frozen: boolean; remaining: number } {
  const now = Date.now();
  const entry = state.freezes.find(f => f.teamId === teamId && f.playerId === playerId && f.freezeExpiresAt > now);
  if (entry) return { frozen: true, remaining: Math.ceil((entry.freezeExpiresAt - now) / 1000) };
  return { frozen: false, remaining: 0 };
}

function isTeamGlobalCooldown(state: AuctionState, teamId: string): { frozen: boolean; remaining: number } {
  const now = Date.now();
  const expiresAt = state.globalCooldowns[teamId];
  if (expiresAt && expiresAt > now) return { frozen: true, remaining: Math.ceil((expiresAt - now) / 1000) };
  return { frozen: false, remaining: 0 };
}

function reducer(state: AuctionState, action: Action): AuctionState {
  switch (action.type) {
    case 'SET_CURRENT_PLAYER': {
      const player = state.players.find(p => p.id === action.playerId);
      if (!player) return state;
      const players = state.players.map(p =>
        p.id === action.playerId ? { ...p, status: 'live' as const } :
        p.status === 'live' ? { ...p, status: 'available' as const } : p
      );
      // Clear freezes for previous player
      const freezes = state.freezes.filter(f => f.playerId !== state.currentPlayerId);
      return {
        ...state,
        players,
        currentPlayerId: action.playerId,
        currentBid: player.basePrice,
        leadingTeamId: null,
        timerSeconds: 15,
        timerRunning: false,
        freezes,
      };
    }
    case 'PLACE_BID': {
      const team = state.teams.find(t => t.id === action.teamId);
      if (!team || !state.currentPlayerId) return state;

      // Check freeze
      const freezeCheck = isTeamFrozen(state, action.teamId, state.currentPlayerId);
      if (freezeCheck.frozen) return state;

      // Check global cooldown
      const globalCheck = isTeamGlobalCooldown(state, action.teamId);
      if (globalCheck.frozen) return state;

      const newBid = state.leadingTeamId ? state.currentBid + state.bidIncrement : state.currentBid;
      if (team.purse < newBid) return state;

      // Compute freeze duration
      const freezeSecs = computeFreezeSecs(newBid, state.freezeConfig);
      const now = Date.now();

      // Add freeze entry (upsert)
      const updatedFreezes = [
        ...state.freezes.filter(f => !(f.teamId === action.teamId && f.playerId === state.currentPlayerId)),
        { teamId: action.teamId, playerId: state.currentPlayerId, freezeExpiresAt: now + freezeSecs * 1000, freezeSeconds: freezeSecs, bidAmount: newBid }
      ];

      // Add global cooldown
      const updatedGlobalCooldowns = {
        ...state.globalCooldowns,
        [action.teamId]: now + state.freezeConfig.globalCooldownSeconds * 1000,
      };

      return {
        ...state,
        currentBid: newBid,
        leadingTeamId: action.teamId,
        timerSeconds: 15,
        timerRunning: true,
        freezes: updatedFreezes,
        globalCooldowns: updatedGlobalCooldowns,
        auctionLog: [{
          type: 'bid',
          playerId: state.currentPlayerId,
          teamId: action.teamId,
          amount: newBid,
          message: `${team.name} bids ${formatPrice(newBid)} (freeze: ${freezeSecs}s)`,
          timestamp: now,
        }, ...state.auctionLog],
      };
    }
    case 'SELL_PLAYER': {
      if (!state.currentPlayerId || !state.leadingTeamId) return state;
      const player = state.players.find(p => p.id === state.currentPlayerId)!;
      const team = state.teams.find(t => t.id === state.leadingTeamId)!;
      const players = state.players.map(p =>
        p.id === state.currentPlayerId ? { ...p, status: 'sold' as const, soldToTeamId: state.leadingTeamId, soldPrice: state.currentBid } : p
      );
      const teams = state.teams.map(t =>
        t.id === state.leadingTeamId ? {
          ...t,
          purse: t.purse - state.currentBid,
          players: [...t.players, state.currentPlayerId!],
          roleCounts: { ...t.roleCounts, [player.role]: (t.roleCounts[player.role] || 0) + 1 },
        } : t
      );
      // Clear freezes for this player
      const freezes = state.freezes.filter(f => f.playerId !== state.currentPlayerId);
      return {
        ...state,
        players,
        teams,
        currentPlayerId: null,
        currentBid: 0,
        leadingTeamId: null,
        timerRunning: false,
        soldCount: state.soldCount + 1,
        totalValue: state.totalValue + state.currentBid,
        freezes,
        auctionLog: [{
          type: 'sold',
          playerId: player.id,
          teamId: team.id,
          amount: state.currentBid,
          message: `${player.name} SOLD to ${team.name} for ${formatPrice(state.currentBid)}`,
          timestamp: Date.now(),
        }, ...state.auctionLog],
      };
    }
    case 'MARK_UNSOLD': {
      if (!state.currentPlayerId) return state;
      const player = state.players.find(p => p.id === state.currentPlayerId)!;
      const players = state.players.map(p =>
        p.id === state.currentPlayerId ? { ...p, status: 'unsold' as const } : p
      );
      const freezes = state.freezes.filter(f => f.playerId !== state.currentPlayerId);
      return {
        ...state,
        players,
        currentPlayerId: null,
        currentBid: 0,
        leadingTeamId: null,
        timerRunning: false,
        freezes,
        auctionLog: [{
          type: 'unsold',
          playerId: player.id,
          message: `${player.name} goes UNSOLD`,
          timestamp: Date.now(),
        }, ...state.auctionLog],
      };
    }
    case 'TIMER_TICK':
      if (!state.timerRunning || state.timerSeconds <= 0) return state;
      const newSeconds = state.timerSeconds - 1;
      if (newSeconds <= 0 && state.leadingTeamId) {
        return reducer({ ...state, timerSeconds: 0, timerRunning: false }, { type: 'SELL_PLAYER' });
      }
      if (newSeconds <= 0) {
        return reducer({ ...state, timerSeconds: 0, timerRunning: false }, { type: 'MARK_UNSOLD' });
      }
      return { ...state, timerSeconds: newSeconds };
    case 'START_TIMER':
      return { ...state, timerRunning: true };
    case 'PAUSE_TIMER':
      return { ...state, timerRunning: false };
    case 'RESET_TIMER':
      return { ...state, timerSeconds: action.seconds, timerRunning: false };
    case 'SET_STATUS':
      return { ...state, status: action.status };
    case 'SET_PHASE':
      return { ...state, currentPhase: action.phase };
    case 'SET_INCREMENT':
      return { ...state, bidIncrement: action.increment };
    case 'ADD_TEAM':
      return { ...state, teams: [...state.teams, action.team] };
    case 'REMOVE_TEAM':
      return { ...state, teams: state.teams.filter(t => t.id !== action.teamId) };
    case 'UPDATE_TEAM':
      return { ...state, teams: state.teams.map(t => t.id === action.teamId ? { ...t, ...action.updates } : t) };
    case 'IMPORT_PLAYERS':
      return { ...state, players: action.players };
    case 'ADD_PLAYER':
      return { ...state, players: [...state.players, action.player] };
    case 'REMOVE_PLAYER':
      return { ...state, players: state.players.filter(p => p.id !== action.playerId) };
    case 'UPDATE_PLAYER':
      return { ...state, players: state.players.map(p => p.id === action.playerId ? { ...p, ...action.updates } : p) };
    case 'CLEAR_FREEZE':
      return { ...state, freezes: state.freezes.filter(f => !(f.teamId === action.teamId && f.playerId === action.playerId)) };
    case 'CLEAR_ALL_FREEZES_FOR_PLAYER':
      return { ...state, freezes: state.freezes.filter(f => f.playerId !== action.playerId) };
    case 'CLEAR_ALL_FREEZES_FOR_TEAM':
      return { ...state, freezes: state.freezes.filter(f => f.teamId !== action.teamId) };
    case 'LOAD_STATE':
      return action.state;
    default:
      return state;
  }
}

const defaultState: AuctionState = {
  status: 'pre',
  currentPlayerId: null,
  currentBid: 0,
  leadingTeamId: null,
  timerSeconds: 15,
  timerRunning: false,
  currentPhase: 'marquee',
  players: initialPlayers,
  teams: initialTeams,
  auctionLog: [],
  soldCount: 0,
  totalValue: 0,
  bidIncrement: 20,
  freezes: [],
  freezeConfig: {
    minFreezeSeconds: 3,
    baseFreezeSeconds: 3,
    incrementUnitLakhs: 20,
    incrementSeconds: 2,
    maxFreezeSeconds: 30,
    globalCooldownSeconds: 1,
  },
  globalCooldowns: {},
};

interface AuctionContextValue {
  state: AuctionState;
  dispatch: React.Dispatch<Action>;
  formatPrice: (lakhs: number) => string;
  getPlayer: (id: string) => Player | undefined;
  getTeam: (id: string) => Team | undefined;
  getTeamBySlug: (slug: string) => Team | undefined;
  isTeamFrozen: (teamId: string, playerId: string) => { frozen: boolean; remaining: number };
  isTeamGlobalCooldown: (teamId: string) => { frozen: boolean; remaining: number };
  computeFreezeSecs: (bidAmountLakhs: number) => number;
}

const AuctionContext = createContext<AuctionContextValue | null>(null);

export function AuctionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, defaultState, (initial) => {
    try {
      const saved = localStorage.getItem('auction_state_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure freezes and freezeConfig exist
        return {
          ...initial,
          ...parsed,
          freezes: parsed.freezes || [],
          freezeConfig: parsed.freezeConfig || initial.freezeConfig,
          globalCooldowns: parsed.globalCooldowns || {},
        };
      }
    } catch {}
    return initial;
  });

  useEffect(() => {
    localStorage.setItem('auction_state_v2', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!state.timerRunning) return;
    const interval = setInterval(() => dispatch({ type: 'TIMER_TICK' }), 1000);
    return () => clearInterval(interval);
  }, [state.timerRunning]);

  const getPlayer = useCallback((id: string) => state.players.find(p => p.id === id), [state.players]);
  const getTeam = useCallback((id: string) => state.teams.find(t => t.id === id), [state.teams]);
  const getTeamBySlug = useCallback((slug: string) => state.teams.find(t => t.slug === slug), [state.teams]);
  const checkFrozen = useCallback((teamId: string, playerId: string) => isTeamFrozen(state, teamId, playerId), [state.freezes]);
  const checkGlobalCooldown = useCallback((teamId: string) => isTeamGlobalCooldown(state, teamId), [state.globalCooldowns]);
  const calcFreeze = useCallback((amount: number) => computeFreezeSecs(amount, state.freezeConfig), [state.freezeConfig]);

  return (
    <AuctionContext.Provider value={{ state, dispatch, formatPrice, getPlayer, getTeam, getTeamBySlug, isTeamFrozen: checkFrozen, isTeamGlobalCooldown: checkGlobalCooldown, computeFreezeSecs: calcFreeze }}>
      {children}
    </AuctionContext.Provider>
  );
}

export function useAuction() {
  const ctx = useContext(AuctionContext);
  if (!ctx) throw new Error('useAuction must be inside AuctionProvider');
  return ctx;
}

export { formatPrice };
