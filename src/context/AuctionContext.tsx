import React, { createContext, useContext, useReducer, useCallback, ReactNode, useEffect } from 'react';
import { Player, initialPlayers } from '@/data/players';
import { Team, initialTeams } from '@/data/teams';

export type AuctionStatus = 'pre' | 'retention' | 'live' | 'rtm_window' | 'complete';
export type AuctionPhase = 'marquee' | 'premium' | 'mid-tier' | 'budget';

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
  | { type: 'UNDO_LAST' }
  | { type: 'LOAD_STATE'; state: AuctionState };

function formatPrice(lakhs: number): string {
  if (lakhs >= 100) return `₹${(lakhs / 100).toFixed(2)} Cr`;
  return `₹${lakhs} L`;
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
      return {
        ...state,
        players,
        currentPlayerId: action.playerId,
        currentBid: player.basePrice,
        leadingTeamId: null,
        timerSeconds: 15,
        timerRunning: false,
      };
    }
    case 'PLACE_BID': {
      const team = state.teams.find(t => t.id === action.teamId);
      if (!team) return state;
      const newBid = state.leadingTeamId ? state.currentBid + state.bidIncrement : state.currentBid;
      if (team.purse < newBid) return state;
      return {
        ...state,
        currentBid: newBid,
        leadingTeamId: action.teamId,
        timerSeconds: 15,
        timerRunning: true,
        auctionLog: [{
          type: 'bid',
          playerId: state.currentPlayerId!,
          teamId: action.teamId,
          amount: newBid,
          message: `${team.name} bids ${formatPrice(newBid)}`,
          timestamp: Date.now(),
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
      return {
        ...state,
        players,
        currentPlayerId: null,
        currentBid: 0,
        leadingTeamId: null,
        timerRunning: false,
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
        // Auto-sell
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
  bidIncrement: 10,
};

interface AuctionContextValue {
  state: AuctionState;
  dispatch: React.Dispatch<Action>;
  formatPrice: (lakhs: number) => string;
  getPlayer: (id: string) => Player | undefined;
  getTeam: (id: string) => Team | undefined;
  getTeamBySlug: (slug: string) => Team | undefined;
}

const AuctionContext = createContext<AuctionContextValue | null>(null);

export function AuctionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, defaultState, (initial) => {
    try {
      const saved = localStorage.getItem('auction_state');
      if (saved) return JSON.parse(saved);
    } catch {}
    return initial;
  });

  useEffect(() => {
    localStorage.setItem('auction_state', JSON.stringify(state));
  }, [state]);

  // Timer interval
  useEffect(() => {
    if (!state.timerRunning) return;
    const interval = setInterval(() => dispatch({ type: 'TIMER_TICK' }), 1000);
    return () => clearInterval(interval);
  }, [state.timerRunning]);

  const getPlayer = useCallback((id: string) => state.players.find(p => p.id === id), [state.players]);
  const getTeam = useCallback((id: string) => state.teams.find(t => t.id === id), [state.teams]);
  const getTeamBySlug = useCallback((slug: string) => state.teams.find(t => t.slug === slug), [state.teams]);

  return (
    <AuctionContext.Provider value={{ state, dispatch, formatPrice, getPlayer, getTeam, getTeamBySlug }}>
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
