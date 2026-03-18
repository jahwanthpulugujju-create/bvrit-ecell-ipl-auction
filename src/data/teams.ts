export interface Team {
  id: string;
  name: string;
  slug: string;
  city: string;
  color: string;
  purse: number; // in lakhs (12000 = 120 Cr)
  initialPurse: number;
  players: string[];
  roleCounts: Record<string, number>;
  rtmRemaining: number;
  retainedPlayers: string[];
  passwordHash: string;
  isActive: boolean;
}

// Teams start empty - admin creates them
export const initialTeams: Team[] = [];

export function createTeamSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function generateTeamPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let pw = '';
  for (let i = 0; i < 8; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}

export function hashTeamPassword(slug: string, password: string): string {
  return btoa(`${slug}:${password}`);
}

export function verifyTeamPassword(slug: string, password: string, hash: string): boolean {
  return btoa(`${slug}:${password}`) === hash;
}

export const EMPTY_ROLE_COUNTS: Record<string, number> = {
  'batsman': 0, 'fast-bowler': 0, 'spinner': 0, 'wicket-keeper': 0, 'all-rounder': 0,
};

export const MIN_ROLE_REQUIREMENTS: Record<string, number> = {
  'batsman': 4, 'fast-bowler': 2, 'spinner': 1, 'wicket-keeper': 1, 'all-rounder': 0,
};
