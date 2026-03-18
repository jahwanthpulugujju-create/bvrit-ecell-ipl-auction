export type PlayerRole = 'batsman' | 'fast-bowler' | 'spinner' | 'wicket-keeper' | 'all-rounder';
export type PlayerCategory = 'marquee' | 'premium' | 'mid-tier' | 'budget';
export type PlayerStatus = 'available' | 'retained' | 'live' | 'pending_sale' | 'sold' | 'unsold';

export interface Player {
  id: string;
  name: string;
  franchise: string;
  role: PlayerRole;
  subRole: string;
  category: PlayerCategory;
  nationality: 'indian' | 'overseas';
  basePrice: number; // in lakhs
  batting: number;
  bowling: number;
  fielding: number;
  rating: number;
  battingStyle: string;
  bowlingStyle: string;
  photo: string;
  status: PlayerStatus;
  soldToTeamId: string | null;
  soldPrice: number | null;
  previousTeamId: string | null;
}

export const roleEmojis: Record<string, string> = {
  'batsman': '🏏',
  'fast-bowler': '⚡',
  'spinner': '🌀',
  'wicket-keeper': '🧤',
  'all-rounder': '🔄',
};

const OVERSEAS = new Set([
  'Matt Henry', 'Noor Ahmad', 'Akeal Hosein', 'Mitchell Starc',
  'Dushmantha Chameera', 'Lungi Ngidi', 'Kyle Jamieson', 'Kagiso Rabada',
  'Rashid Khan', 'Luke Wood', 'Matheesha Pathirana', 'Trent Boult',
  'Allah Ghazanfar', 'Lockie Ferguson', 'Xavier Bartlett', 'Ben Dwarshuis',
  'Jofra Archer', 'Nandre Burger', 'Kwena Maphaka', 'Adam Milne',
  'Josh Hazlewood', 'Nuwan Thushara', 'Jacob Duffy', 'Pat Cummins', 'Eshan Malinga',
]);

const IMAGE_URLS: Record<string, string> = {
  'Jasprit Bumrah': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Jasprit_Bumrah.jpg/400px-Jasprit_Bumrah.jpg',
  'Rashid Khan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Rashid_Khan_2018.jpg/400px-Rashid_Khan_2018.jpg',
  'Pat Cummins': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Pat_Cummins_2023.jpg/400px-Pat_Cummins_2023.jpg',
  'Arshdeep Singh': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Arshdeep_Singh_2022.jpg/400px-Arshdeep_Singh_2022.jpg',
  'Mohammed Shami': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Mohammed_Shami.jpg/400px-Mohammed_Shami.jpg',
  'Yuzvendra Chahal': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Yuzvendra_Chahal_2018.jpg/400px-Yuzvendra_Chahal_2018.jpg',
  'Kuldeep Yadav': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Kuldeep_Yadav_2019.jpg/400px-Kuldeep_Yadav_2019.jpg',
  'Trent Boult': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Trent_Boult.jpg/400px-Trent_Boult.jpg',
};

function isSpinner(bowlingStyle: string): boolean {
  const s = bowlingStyle.toLowerCase();
  return s.includes('spin') || s.includes('orthodox') || s.includes('unorthodox') || s.includes('off spin');
}

function getCategory(name: string, bowlingStyle: string): PlayerCategory {
  const marquee = ['Jasprit Bumrah','Mitchell Starc','Pat Cummins','Kagiso Rabada','Rashid Khan','Trent Boult','Mohammed Shami','Jofra Archer','Josh Hazlewood','Yuzvendra Chahal','Kuldeep Yadav','Arshdeep Singh','Mohammed Siraj'];
  const premium = ['Varun Chakaravarthy','Bhuvneshwar Kumar','Harshal Patel','Deepak Chahar','Lockie Ferguson','Matheesha Pathirana','Ravi Bishnoi','Khaleel Ahmed','T Natarajan','Umran Malik','Mayank Yadav','Mukesh Kumar'];
  const midTier = ['Harshit Rana','Lungi Ngidi','Kyle Jamieson','Prasidh Krishna','Avesh Khan','Rahul Chahar','Yash Dayal','Tushar Deshpande','Jaydev Unadkat','Shivam Mavi','Mohsin Khan','Nandre Burger','Rasikh Salam','Matt Henry','Xavier Bartlett','Sandeep Sharma'];
  if (marquee.includes(name)) return 'marquee';
  if (premium.includes(name)) return 'premium';
  if (midTier.includes(name)) return 'mid-tier';
  return 'budget';
}

function getStats(cat: PlayerCategory, isSpinnerRole: boolean): { batting: number; bowling: number; fielding: number; rating: number; basePrice: number } {
  switch (cat) {
    case 'marquee': return { batting: isSpinnerRole ? 4 : 3, bowling: 10, fielding: 7, rating: isSpinnerRole ? 9.2 : 9.5, basePrice: 200 };
    case 'premium': return { batting: isSpinnerRole ? 3 : 3, bowling: 8, fielding: 6, rating: 7.8, basePrice: 100 };
    case 'mid-tier': return { batting: 2, bowling: 6, fielding: 5, rating: 6.2, basePrice: 50 };
    case 'budget': return { batting: 2, bowling: 5, fielding: 4, rating: 4.5, basePrice: 20 };
  }
}

// Specific rating overrides for well-known players
const RATING_OVERRIDES: Record<string, number> = {
  'Jasprit Bumrah': 9.8, 'Mitchell Starc': 9.3, 'Pat Cummins': 9.4, 'Kagiso Rabada': 9.1,
  'Rashid Khan': 9.5, 'Trent Boult': 9.0, 'Mohammed Shami': 9.2, 'Jofra Archer': 9.0,
  'Josh Hazlewood': 8.8, 'Yuzvendra Chahal': 8.7, 'Kuldeep Yadav': 8.6, 'Arshdeep Singh': 8.5,
  'Mohammed Siraj': 8.4, 'Varun Chakaravarthy': 8.2, 'Bhuvneshwar Kumar': 8.0, 'Harshal Patel': 7.9,
  'Deepak Chahar': 7.8, 'Lockie Ferguson': 8.1, 'Matheesha Pathirana': 8.3, 'Ravi Bishnoi': 7.7,
  'Umran Malik': 7.5, 'Mayank Yadav': 7.6,
};

// Raw CSV data
const CSV_PLAYERS: [string, string, string, string][] = [
  ['Matt Henry', 'Chennai Super Kings', 'Right-arm Fast Medium', 'RHB'],
  ['Khaleel Ahmed', 'Chennai Super Kings', 'Left-arm Fast Medium', 'RHB'],
  ['Mukesh Choudhary', 'Chennai Super Kings', 'Left-arm Fast Medium', 'LHB'],
  ['Noor Ahmad', 'Chennai Super Kings', 'Left-arm Unorthodox Spin', 'RHB'],
  ['Akeal Hosein', 'Chennai Super Kings', 'Left-arm Slow Orthodox', 'LHB'],
  ['Rahul Chahar', 'Chennai Super Kings', 'Right-arm Leg Spin', 'RHB'],
  ['Mitchell Starc', 'Delhi Capitals', 'Left-arm Fast', 'LHB'],
  ['Kuldeep Yadav', 'Delhi Capitals', 'Left-arm Unorthodox Spin', 'LHB'],
  ['Mukesh Kumar', 'Delhi Capitals', 'Right-arm Fast Medium', 'RHB'],
  ['T Natarajan', 'Delhi Capitals', 'Left-arm Fast Medium', 'LHB'],
  ['Dushmantha Chameera', 'Delhi Capitals', 'Right-arm Fast', 'RHB'],
  ['Lungi Ngidi', 'Delhi Capitals', 'Right-arm Fast', 'RHB'],
  ['Kyle Jamieson', 'Delhi Capitals', 'Right-arm Fast Medium', 'RHB'],
  ['Kagiso Rabada', 'Gujarat Titans', 'Right-arm Fast', 'LHB'],
  ['Mohammed Siraj', 'Gujarat Titans', 'Right-arm Fast', 'RHB'],
  ['Prasidh Krishna', 'Gujarat Titans', 'Right-arm Fast', 'RHB'],
  ['Ishant Sharma', 'Gujarat Titans', 'Right-arm Fast Medium', 'RHB'],
  ['Rashid Khan', 'Gujarat Titans', 'Right-arm Leg Spin', 'RHB'],
  ['Manav Suthar', 'Gujarat Titans', 'Left-arm Slow Orthodox', 'LHB'],
  ['Sai Kishore', 'Gujarat Titans', 'Left-arm Slow Orthodox', 'LHB'],
  ['Ashok Sharma', 'Gujarat Titans', 'Right-arm Fast', 'RHB'],
  ['Prithvi Raj', 'Gujarat Titans', 'Left-arm Fast Medium', 'RHB'],
  ['Luke Wood', 'Gujarat Titans', 'Left-arm Fast', 'LHB'],
  ['Varun Chakaravarthy', 'Kolkata Knight Riders', 'Right-arm Leg Spin', 'RHB'],
  ['Harshit Rana', 'Kolkata Knight Riders', 'Right-arm Fast Medium', 'RHB'],
  ['Vaibhav Arora', 'Kolkata Knight Riders', 'Right-arm Fast Medium', 'RHB'],
  ['Umran Malik', 'Kolkata Knight Riders', 'Right-arm Fast', 'RHB'],
  ['Matheesha Pathirana', 'Kolkata Knight Riders', 'Right-arm Fast', 'RHB'],
  ['Prashant Solanki', 'Kolkata Knight Riders', 'Right-arm Leg Spin', 'RHB'],
  ['Mohammed Shami', 'Lucknow Super Giants', 'Right-arm Fast', 'RHB'],
  ['Mayank Yadav', 'Lucknow Super Giants', 'Right-arm Fast', 'RHB'],
  ['Mohsin Khan', 'Lucknow Super Giants', 'Left-arm Fast Medium', 'LHB'],
  ['Avesh Khan', 'Lucknow Super Giants', 'Right-arm Fast Medium', 'RHB'],
  ['M Siddharth', 'Lucknow Super Giants', 'Left-arm Slow Orthodox', 'RHB'],
  ['Jasprit Bumrah', 'Mumbai Indians', 'Right-arm Fast', 'RHB'],
  ['Trent Boult', 'Mumbai Indians', 'Left-arm Fast Medium', 'RHB'],
  ['Deepak Chahar', 'Mumbai Indians', 'Right-arm Fast Medium', 'RHB'],
  ['Mayank Markande', 'Mumbai Indians', 'Right-arm Leg Spin', 'RHB'],
  ['Allah Ghazanfar', 'Mumbai Indians', 'Right-arm Off Spin', 'RHB'],
  ['Vignesh Puthur', 'Mumbai Indians', 'Left-arm Unorthodox Spin', 'RHB'],
  ['Arshdeep Singh', 'Punjab Kings', 'Left-arm Fast Medium', 'LHB'],
  ['Yuzvendra Chahal', 'Punjab Kings', 'Right-arm Leg Spin', 'RHB'],
  ['Lockie Ferguson', 'Punjab Kings', 'Right-arm Fast', 'RHB'],
  ['Xavier Bartlett', 'Punjab Kings', 'Right-arm Fast Medium', 'RHB'],
  ['Yash Thakur', 'Punjab Kings', 'Right-arm Fast Medium', 'RHB'],
  ['Vyshak Vijaykumar', 'Punjab Kings', 'Right-arm Medium', 'RHB'],
  ['Pravin Dubey', 'Punjab Kings', 'Right-arm Leg Spin', 'RHB'],
  ['Vishal Nishad', 'Punjab Kings', 'Right-arm Leg Spin', 'RHB'],
  ['Ben Dwarshuis', 'Punjab Kings', 'Left-arm Fast Medium', 'LHB'],
  ['Jofra Archer', 'Rajasthan Royals', 'Right-arm Fast', 'RHB'],
  ['Sandeep Sharma', 'Rajasthan Royals', 'Right-arm Medium', 'RHB'],
  ['Ravi Bishnoi', 'Rajasthan Royals', 'Right-arm Leg Spin', 'RHB'],
  ['Nandre Burger', 'Rajasthan Royals', 'Left-arm Fast', 'LHB'],
  ['Kwena Maphaka', 'Rajasthan Royals', 'Left-arm Fast', 'LHB'],
  ['Tushar Deshpande', 'Rajasthan Royals', 'Right-arm Fast Medium', 'LHB'],
  ['Adam Milne', 'Rajasthan Royals', 'Right-arm Fast', 'RHB'],
  ['Kuldeep Sen', 'Rajasthan Royals', 'Right-arm Fast', 'RHB'],
  ['Sushant Mishra', 'Rajasthan Royals', 'Left-arm Fast', 'LHB'],
  ['Yash Raj Punja', 'Rajasthan Royals', 'Right-arm Leg Spin', 'RHB'],
  ['Josh Hazlewood', 'Royal Challengers Bengaluru', 'Right-arm Fast Medium', 'LHB'],
  ['Bhuvneshwar Kumar', 'Royal Challengers Bengaluru', 'Right-arm Medium Fast', 'RHB'],
  ['Yash Dayal', 'Royal Challengers Bengaluru', 'Left-arm Fast Medium', 'RHB'],
  ['Nuwan Thushara', 'Royal Challengers Bengaluru', 'Right-arm Fast Medium', 'RHB'],
  ['Rasikh Salam', 'Royal Challengers Bengaluru', 'Right-arm Fast Medium', 'RHB'],
  ['Suyash Sharma', 'Royal Challengers Bengaluru', 'Right-arm Leg Spin', 'RHB'],
  ['Jacob Duffy', 'Royal Challengers Bengaluru', 'Right-arm Fast Medium', 'RHB'],
  ['Pat Cummins', 'Sunrisers Hyderabad', 'Right-arm Fast', 'RHB'],
  ['Harshal Patel', 'Sunrisers Hyderabad', 'Right-arm Fast Medium', 'RHB'],
  ['Jaydev Unadkat', 'Sunrisers Hyderabad', 'Left-arm Fast Medium', 'RHB'],
  ['Shivam Mavi', 'Sunrisers Hyderabad', 'Right-arm Fast Medium', 'RHB'],
  ['Eshan Malinga', 'Sunrisers Hyderabad', 'Right-arm Fast', 'RHB'],
  ['Sakib Hussain', 'Sunrisers Hyderabad', 'Right-arm Fast Medium', 'RHB'],
  ['Onkar Tarmale', 'Sunrisers Hyderabad', 'Right-arm Fast Medium', 'RHB'],
  ['Amit Kumar', 'Sunrisers Hyderabad', 'Right-arm Leg Spin', 'RHB'],
  ['Krains Fuletra', 'Sunrisers Hyderabad', 'Left-arm Slow Unorthodox', 'RHB'],
];

function buildPlayer(index: number, [name, franchise, bowlingStyle, battingStyle]: [string, string, string, string]): Player {
  const spinnerRole = isSpinner(bowlingStyle);
  const role: PlayerRole = spinnerRole ? 'spinner' : 'fast-bowler';
  const category = getCategory(name, bowlingStyle);
  const stats = getStats(category, spinnerRole);
  const nationality = OVERSEAS.has(name) ? 'overseas' as const : 'indian' as const;
  const rating = RATING_OVERRIDES[name] ?? stats.rating;
  const imageUrl = IMAGE_URLS[name] || '';

  return {
    id: `p${index + 1}`,
    name,
    franchise,
    role,
    subRole: bowlingStyle,
    category,
    nationality,
    basePrice: stats.basePrice,
    batting: stats.batting,
    bowling: stats.bowling,
    fielding: stats.fielding,
    rating,
    battingStyle,
    bowlingStyle,
    photo: imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${spinnerRole ? '6366f1' : 'ff6b00'}&color=fff&size=128&bold=true`,
    status: 'available',
    soldToTeamId: null,
    soldPrice: null,
    previousTeamId: null,
  };
}

export const initialPlayers: Player[] = CSV_PLAYERS.map((data, i) => buildPlayer(i, data));

// Helper to get initials avatar URL (used as fallback)
export function getInitialsAvatar(name: string, role: PlayerRole): string {
  const colors: Record<PlayerRole, string> = {
    'batsman': '00d4ff',
    'fast-bowler': 'ff6b00',
    'spinner': '6366f1',
    'wicket-keeper': '00ff88',
    'all-rounder': 'a855f7',
  };
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${colors[role]}&color=fff&size=128&bold=true`;
}
