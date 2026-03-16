export interface Team {
  id: string;
  name: string;
  slug: string;
  city: string;
  color: string;
  purse: number; // in lakhs (12000 = 120 Cr)
  players: string[];
  roleCounts: Record<string, number>;
  rtmRemaining: number;
  retainedPlayers: string[];
}

export const initialTeams: Team[] = [
  { id: 't1', name: 'Mumbai Mavericks', slug: 'mumbai', city: 'Mumbai', color: '#004BA0', purse: 12000, players: [], roleCounts: { batsman: 0, 'fast-bowler': 0, spinner: 0, 'wicket-keeper': 0, 'all-rounder': 0 }, rtmRemaining: 2, retainedPlayers: [] },
  { id: 't2', name: 'Chennai Chargers', slug: 'chennai', city: 'Chennai', color: '#FFCC00', purse: 12000, players: [], roleCounts: { batsman: 0, 'fast-bowler': 0, spinner: 0, 'wicket-keeper': 0, 'all-rounder': 0 }, rtmRemaining: 2, retainedPlayers: [] },
  { id: 't3', name: 'Royal Bengaluru', slug: 'bengaluru', city: 'Bengaluru', color: '#D4213D', purse: 12000, players: [], roleCounts: { batsman: 0, 'fast-bowler': 0, spinner: 0, 'wicket-keeper': 0, 'all-rounder': 0 }, rtmRemaining: 2, retainedPlayers: [] },
  { id: 't4', name: 'Kolkata Knights', slug: 'kolkata', city: 'Kolkata', color: '#3A225D', purse: 12000, players: [], roleCounts: { batsman: 0, 'fast-bowler': 0, spinner: 0, 'wicket-keeper': 0, 'all-rounder': 0 }, rtmRemaining: 2, retainedPlayers: [] },
  { id: 't5', name: 'Delhi Dynamos', slug: 'delhi', city: 'Delhi', color: '#004C93', purse: 12000, players: [], roleCounts: { batsman: 0, 'fast-bowler': 0, spinner: 0, 'wicket-keeper': 0, 'all-rounder': 0 }, rtmRemaining: 2, retainedPlayers: [] },
  { id: 't6', name: 'Hyderabad Hawks', slug: 'hyderabad', city: 'Hyderabad', color: '#FF822A', purse: 12000, players: [], roleCounts: { batsman: 0, 'fast-bowler': 0, spinner: 0, 'wicket-keeper': 0, 'all-rounder': 0 }, rtmRemaining: 2, retainedPlayers: [] },
  { id: 't7', name: 'Rajasthan Royals', slug: 'rajasthan', city: 'Jaipur', color: '#EA1A85', purse: 12000, players: [], roleCounts: { batsman: 0, 'fast-bowler': 0, spinner: 0, 'wicket-keeper': 0, 'all-rounder': 0 }, rtmRemaining: 2, retainedPlayers: [] },
  { id: 't8', name: 'Punjab Panthers', slug: 'punjab', city: 'Mohali', color: '#ED1B24', purse: 12000, players: [], roleCounts: { batsman: 0, 'fast-bowler': 0, spinner: 0, 'wicket-keeper': 0, 'all-rounder': 0 }, rtmRemaining: 2, retainedPlayers: [] },
];
