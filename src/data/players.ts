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
  // Bowlers
  'Matt Henry', 'Noor Ahmad', 'Akeal Hosein', 'Mitchell Starc',
  'Dushmantha Chameera', 'Lungi Ngidi', 'Kyle Jamieson', 'Kagiso Rabada',
  'Rashid Khan', 'Luke Wood', 'Matheesha Pathirana', 'Trent Boult',
  'Allah Ghazanfar', 'Lockie Ferguson', 'Xavier Bartlett', 'Ben Dwarshuis',
  'Jofra Archer', 'Nandre Burger', 'Kwena Maphaka', 'Adam Milne',
  'Josh Hazlewood', 'Nuwan Thushara', 'Jacob Duffy', 'Pat Cummins', 'Eshan Malinga',
  // All-rounders
  'Jamie Overton', 'Zak Foulkes', 'Matthew Short',
  'Jason Holder', 'Sunil Narine', 'Cameron Green',
  'Mitchell Marsh', 'Wanindu Hasaranga', 'Mitchell Santner',
  'Corbin Bosch', 'Will Jacks', 'Marcus Stoinis', 'Marco Jansen',
  'Cooper Connolly', 'Mitchell Owen', 'Sam Curran',
  'Donovan Ferreira', 'Tim David', 'Romario Shepherd', 'Jacob Bethell',
  'Kamindu Mendis', 'Jack Edwards', 'Brydon Carse',
  // Wicket-keepers
  'Tristan Stubbs', 'Ben Duckett', 'Jos Buttler', 'Tom Banton',
  'Finn Allen', 'Nicholas Pooran', 'Josh Inglis',
  'Quinton de Kock', 'Ryan Rickelton', 'Lhuan-dre Pretorius',
  'Phil Salt', 'Jordan Cox', 'Heinrich Klaasen',
  // Batsmen
  'Dewald Brevis', 'Pathum Nissanka', 'David Miller',
  'Rovman Powell', 'Aiden Markram', 'Matthew Breetzke',
  'Sherfane Rutherford', 'Shimron Hetmyer', 'Travis Head',
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
  return s.includes('spin') || s.includes('orthodox') || s.includes('unorthodox') || s.includes('off spin') || s.includes('leg break') || s.includes('ambidextrous');
}

// ─── Category lookup ─────────────────────────────────────────────────────────

const MARQUEE_PLAYERS = new Set([
  // Bowlers
  'Jasprit Bumrah','Mitchell Starc','Pat Cummins','Kagiso Rabada','Rashid Khan',
  'Trent Boult','Mohammed Shami','Jofra Archer','Josh Hazlewood','Yuzvendra Chahal',
  'Kuldeep Yadav','Arshdeep Singh','Mohammed Siraj',
  // All-rounders
  'Hardik Pandya','Ravindra Jadeja','Sunil Narine','Axar Patel',
  // Wicket-keepers
  'Rishabh Pant','MS Dhoni','KL Rahul','Jos Buttler',
  // Batsmen
  'Virat Kohli','Rohit Sharma','Yashasvi Jaiswal','Shubman Gill','Travis Head',
]);

const PREMIUM_PLAYERS = new Set([
  // Bowlers
  'Varun Chakaravarthy','Bhuvneshwar Kumar','Harshal Patel','Deepak Chahar',
  'Lockie Ferguson','Matheesha Pathirana','Ravi Bishnoi','Khaleel Ahmed',
  'T Natarajan','Umran Malik','Mayank Yadav','Mukesh Kumar',
  // All-rounders
  'Mitchell Marsh','Wanindu Hasaranga','Washington Sundar','Cameron Green',
  'Marco Jansen','Marcus Stoinis','Sam Curran','Venkatesh Iyer',
  'Nitish Kumar Reddy','Abhishek Sharma',
  // Wicket-keepers
  'Sanju Samson','Nicholas Pooran','Quinton de Kock','Heinrich Klaasen',
  'Phil Salt','Ishan Kishan',
  // Batsmen
  'Suryakumar Yadav','Shreyas Iyer','Tilak Varma','Sai Sudharsan',
  'Aiden Markram','Ruturaj Gaikwad','Devdutt Padikkal',
]);

const MID_TIER_PLAYERS = new Set([
  // Bowlers
  'Harshit Rana','Lungi Ngidi','Kyle Jamieson','Prasidh Krishna','Avesh Khan',
  'Rahul Chahar','Yash Dayal','Tushar Deshpande','Jaydev Unadkat','Shivam Mavi',
  'Mohsin Khan','Nandre Burger','Rasikh Salam','Matt Henry','Xavier Bartlett','Sandeep Sharma',
  // All-rounders
  'Jason Holder','Rahul Tewatia','Mitchell Santner','Riyan Parag','Krunal Pandya',
  'Tim David','Romario Shepherd','Jacob Bethell','Corbin Bosch','Shardul Thakur',
  'Will Jacks','Cooper Connolly','Mitchell Owen','Kamindu Mendis','Brydon Carse',
  'Jack Edwards','Shivam Dube','Jamie Overton',
  // Wicket-keepers
  'Dhruv Jurel','Ryan Rickelton','Finn Allen','Josh Inglis','Prabhsimran Singh',
  'Jitesh Sharma','Lhuan-dre Pretorius','Tristan Stubbs','Ben Duckett',
  // Batsmen
  'Ajinkya Rahane','David Miller','Shimron Hetmyer','Rinku Singh',
  'Sherfane Rutherford','Shahrukh Khan','Rajat Patidar','Prithvi Shaw',
  'Karun Nair','Angkrish Raghuvanshi','Rovman Powell','Vaibhav Suryavanshi',
]);

function getCategory(name: string): PlayerCategory {
  if (MARQUEE_PLAYERS.has(name)) return 'marquee';
  if (PREMIUM_PLAYERS.has(name)) return 'premium';
  if (MID_TIER_PLAYERS.has(name)) return 'mid-tier';
  return 'budget';
}

// ─── Stats per role + category ────────────────────────────────────────────────

function getStats(
  cat: PlayerCategory,
  role: PlayerRole
): { batting: number; bowling: number; fielding: number; rating: number; basePrice: number } {
  const bp: Record<PlayerCategory, number> = { marquee: 200, premium: 100, 'mid-tier': 50, budget: 20 };
  const basePrice = bp[cat];

  if (role === 'fast-bowler') {
    switch (cat) {
      case 'marquee':  return { batting: 3, bowling: 10, fielding: 7, rating: 9.5, basePrice };
      case 'premium':  return { batting: 3, bowling: 8,  fielding: 6, rating: 7.8, basePrice };
      case 'mid-tier': return { batting: 2, bowling: 6,  fielding: 5, rating: 6.2, basePrice };
      case 'budget':   return { batting: 2, bowling: 5,  fielding: 4, rating: 4.5, basePrice };
    }
  }
  if (role === 'spinner') {
    switch (cat) {
      case 'marquee':  return { batting: 4, bowling: 10, fielding: 7, rating: 9.2, basePrice };
      case 'premium':  return { batting: 3, bowling: 8,  fielding: 6, rating: 7.8, basePrice };
      case 'mid-tier': return { batting: 2, bowling: 6,  fielding: 5, rating: 6.2, basePrice };
      case 'budget':   return { batting: 2, bowling: 5,  fielding: 4, rating: 4.5, basePrice };
    }
  }
  if (role === 'all-rounder') {
    switch (cat) {
      case 'marquee':  return { batting: 8, bowling: 8, fielding: 8, rating: 9.2, basePrice };
      case 'premium':  return { batting: 7, bowling: 7, fielding: 7, rating: 7.8, basePrice };
      case 'mid-tier': return { batting: 6, bowling: 5, fielding: 5, rating: 6.2, basePrice };
      case 'budget':   return { batting: 5, bowling: 4, fielding: 4, rating: 4.5, basePrice };
    }
  }
  if (role === 'wicket-keeper') {
    switch (cat) {
      case 'marquee':  return { batting: 9, bowling: 1, fielding: 9, rating: 9.3, basePrice };
      case 'premium':  return { batting: 8, bowling: 1, fielding: 8, rating: 7.9, basePrice };
      case 'mid-tier': return { batting: 6, bowling: 1, fielding: 7, rating: 6.2, basePrice };
      case 'budget':   return { batting: 5, bowling: 1, fielding: 6, rating: 4.5, basePrice };
    }
  }
  // batsman fallback
  switch (cat) {
    case 'marquee':  return { batting: 10, bowling: 2, fielding: 8, rating: 9.2, basePrice };
    case 'premium':  return { batting: 8,  bowling: 2, fielding: 7, rating: 7.8, basePrice };
    case 'mid-tier': return { batting: 6,  bowling: 2, fielding: 5, rating: 6.2, basePrice };
    case 'budget':   return { batting: 5,  bowling: 1, fielding: 4, rating: 4.5, basePrice };
  }
}

// ─── Rating overrides ─────────────────────────────────────────────────────────

const RATING_OVERRIDES: Record<string, number> = {
  // Bowlers
  'Jasprit Bumrah': 9.8, 'Mitchell Starc': 9.3, 'Pat Cummins': 9.4, 'Kagiso Rabada': 9.1,
  'Rashid Khan': 9.5, 'Trent Boult': 9.0, 'Mohammed Shami': 9.2, 'Jofra Archer': 9.0,
  'Josh Hazlewood': 8.8, 'Yuzvendra Chahal': 8.7, 'Kuldeep Yadav': 8.6, 'Arshdeep Singh': 8.5,
  'Mohammed Siraj': 8.4, 'Varun Chakaravarthy': 8.2, 'Bhuvneshwar Kumar': 8.0, 'Harshal Patel': 7.9,
  'Deepak Chahar': 7.8, 'Lockie Ferguson': 8.1, 'Matheesha Pathirana': 8.3, 'Ravi Bishnoi': 7.7,
  'Umran Malik': 7.5, 'Mayank Yadav': 7.6,
  // All-rounders
  'Hardik Pandya': 9.2, 'Ravindra Jadeja': 9.3, 'Sunil Narine': 9.0, 'Axar Patel': 8.8,
  'Mitchell Marsh': 8.5, 'Wanindu Hasaranga': 8.4, 'Washington Sundar': 8.0,
  'Cameron Green': 8.2, 'Nitish Kumar Reddy': 7.8, 'Abhishek Sharma': 7.6,
  'Sam Curran': 8.3, 'Venkatesh Iyer': 7.7, 'Marcus Stoinis': 8.1,
  'Kamindu Mendis': 7.9, 'Tim David': 7.5,
  // Wicket-keepers
  'MS Dhoni': 9.6, 'Rishabh Pant': 9.4, 'KL Rahul': 9.0, 'Jos Buttler': 9.1,
  'Sanju Samson': 8.7, 'Nicholas Pooran': 8.5, 'Quinton de Kock': 8.4,
  'Heinrich Klaasen': 8.6, 'Phil Salt': 8.2, 'Ishan Kishan': 8.1,
  // Batsmen
  'Virat Kohli': 9.7, 'Rohit Sharma': 9.5, 'Yashasvi Jaiswal': 9.2,
  'Shubman Gill': 9.0, 'Travis Head': 8.9, 'Suryakumar Yadav': 8.8,
  'Shreyas Iyer': 8.6, 'Ruturaj Gaikwad': 8.5, 'Tilak Varma': 8.3,
  'Sai Sudharsan': 8.2, 'Aiden Markram': 8.1, 'Devdutt Padikkal': 7.9,
};

// ─── Avatar colour per role ───────────────────────────────────────────────────

const ROLE_COLORS: Record<PlayerRole, string> = {
  'batsman': '00d4ff',
  'fast-bowler': 'ff6b00',
  'spinner': '6366f1',
  'wicket-keeper': '00ff88',
  'all-rounder': 'a855f7',
};

// ─── Sheet 2: Bowlers — [name, franchise, bowlingStyle, battingStyle] ─────────

const BOWLER_DATA: [string, string, string, string][] = [
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

// ─── Sheet 3: All-rounders — [name, franchise, battingStyle, bowlingStyle] ────

const ALLROUNDER_DATA: [string, string, string, string][] = [
  ['Shivam Dube', 'Chennai Super Kings', 'LHB', 'Right-arm Medium'],
  ['Jamie Overton', 'Chennai Super Kings', 'RHB', 'Right-arm Fast'],
  ['Ramakrishna Ghosh', 'Chennai Super Kings', 'RHB', 'Right-arm Medium'],
  ['Prashant Veer', 'Chennai Super Kings', 'LHB', 'Left-arm Slow Orthodox'],
  ['Aman Khan', 'Chennai Super Kings', 'RHB', 'Right-arm Medium'],
  ['Zak Foulkes', 'Chennai Super Kings', 'RHB', 'Right-arm Fast Medium'],
  ['Shreyas Gopal', 'Chennai Super Kings', 'RHB', 'Right-arm Leg Spin'],
  ['Anshul Kamboj', 'Chennai Super Kings', 'RHB', 'Right-arm Medium'],
  ['Gurjapneet Singh', 'Chennai Super Kings', 'RHB', 'Left-arm Medium'],
  ['Matthew Short', 'Chennai Super Kings', 'RHB', 'Right-arm Off Spin'],
  ['Axar Patel', 'Delhi Capitals', 'LHB', 'Left-arm Slow Orthodox'],
  ['Madhav Tiwari', 'Delhi Capitals', 'RHB', 'Right-arm Medium Fast'],
  ['Tripurana Vijay', 'Delhi Capitals', 'RHB', 'Right-arm Off break'],
  ['Vipraj Nigam', 'Delhi Capitals', 'RHB', 'Right-arm Leg Spin'],
  ['Ajay Mandal', 'Delhi Capitals', 'LHB', 'Left-arm Slow Orthodox'],
  ['Auqib Dar', 'Delhi Capitals', 'RHB', 'Right-arm Fast Medium'],
  ['Nitish Rana', 'Delhi Capitals', 'LHB', 'Right-arm Off Spin'],
  ['Rahul Tewatia', 'Gujarat Titans', 'LHB', 'Right-arm Leg Spin'],
  ['Washington Sundar', 'Gujarat Titans', 'LHB', 'Right-arm Off Spin'],
  ['Jason Holder', 'Gujarat Titans', 'RHB', 'Right-arm Fast Medium'],
  ['Jayant Yadav', 'Gujarat Titans', 'RHB', 'Right-arm Off Spin'],
  ['Nishant Sindhu', 'Gujarat Titans', 'LHB', 'Left-arm Slow Orthodox'],
  ['Arshad Khan', 'Gujarat Titans', 'LHB', 'Left-arm Medium'],
  ['Gurnoor Singh Brar', 'Gujarat Titans', 'LHB', 'Right-arm Fast Medium'],
  ['Sunil Narine', 'Kolkata Knight Riders', 'LHB', 'Right-arm Off Spin'],
  ['Cameron Green', 'Kolkata Knight Riders', 'RHB', 'Right-arm Fast'],
  ['Ramandeep Singh', 'Kolkata Knight Riders', 'RHB', 'Right-arm Medium'],
  ['Anukul Roy', 'Kolkata Knight Riders', 'LHB', 'Left-arm Slow Orthodox'],
  ['Daksh Kamra', 'Kolkata Knight Riders', 'RHB', 'Right-arm Off break'],
  ['Mitchell Marsh', 'Lucknow Super Giants', 'RHB', 'Right-arm Fast Medium'],
  ['Wanindu Hasaranga', 'Lucknow Super Giants', 'RHB', 'Right-arm Leg Spin'],
  ['Shahbaz Ahamad', 'Lucknow Super Giants', 'LHB', 'Left-arm Slow Orthodox'],
  ['Arshin Kulkarni', 'Lucknow Super Giants', 'RHB', 'Right-arm Medium Fast'],
  ['Ayush Badoni', 'Lucknow Super Giants', 'RHB', 'Right-arm Off Spin'],
  ['Digvesh Rathi', 'Lucknow Super Giants', 'RHB', 'Right-arm Off Spin'],
  ['Hardik Pandya', 'Mumbai Indians', 'RHB', 'Right-arm Fast Medium'],
  ['Mitchell Santner', 'Mumbai Indians', 'LHB', 'Left-arm Slow Orthodox'],
  ['Corbin Bosch', 'Mumbai Indians', 'RHB', 'Right-arm Fast Medium'],
  ['Shardul Thakur', 'Mumbai Indians', 'RHB', 'Right-arm Fast Medium'],
  ['Will Jacks', 'Mumbai Indians', 'RHB', 'Right-arm Off Spin'],
  ['Naman Dhir', 'Mumbai Indians', 'RHB', 'Right-arm Off Spin'],
  ['Raj Bawa', 'Mumbai Indians', 'LHB', 'Right-arm Fast Medium'],
  ['Atharva Ankolekar', 'Mumbai Indians', 'LHB', 'Left-arm Slow Orthodox'],
  ['Mayank Rawat', 'Mumbai Indians', 'RHB', 'Right-arm Off Spin'],
  ['Marcus Stoinis', 'Punjab Kings', 'RHB', 'Right-arm Medium'],
  ['Marco Jansen', 'Punjab Kings', 'RHB', 'Left-arm Fast Medium'],
  ['Cooper Connolly', 'Punjab Kings', 'LHB', 'Left-arm Slow Orthodox'],
  ['Mitchell Owen', 'Punjab Kings', 'RHB', 'Right-arm Fast Medium'],
  ['Musheer Khan', 'Punjab Kings', 'RHB', 'Left-arm Slow Orthodox'],
  ['Sam Curran', 'Rajasthan Royals', 'LHB', 'Left-arm Fast Medium'],
  ['Ravindra Jadeja', 'Rajasthan Royals', 'LHB', 'Left-arm Slow Orthodox'],
  ['Riyan Parag', 'Rajasthan Royals', 'RHB', 'Right-arm Leg break/Off break'],
  ['Brijesh Sharma', 'Rajasthan Royals', 'RHB', 'Right-arm Medium'],
  ['Donovan Ferreira', 'Rajasthan Royals', 'RHB', 'Right-arm Off Spin'],
  ['Yudhvir Singh Charak', 'Rajasthan Royals', 'RHB', 'Right-arm Medium Fast'],
  ['Krunal Pandya', 'Royal Challengers Bengaluru', 'LHB', 'Left-arm Slow Orthodox'],
  ['Venkatesh Iyer', 'Royal Challengers Bengaluru', 'LHB', 'Right-arm Medium'],
  ['Swapnil Singh', 'Royal Challengers Bengaluru', 'RHB', 'Left-arm Slow Orthodox'],
  ['Tim David', 'Royal Challengers Bengaluru', 'RHB', 'Right-arm Off Spin'],
  ['Romario Shepherd', 'Royal Challengers Bengaluru', 'RHB', 'Right-arm Fast Medium'],
  ['Jacob Bethell', 'Royal Challengers Bengaluru', 'LHB', 'Left-arm Slow Orthodox'],
  ['Satvik Deswal', 'Royal Challengers Bengaluru', 'RHB', 'Right-arm Off Spin'],
  ['Mangesh Yadav', 'Royal Challengers Bengaluru', 'LHB', 'Left-arm Fast'],
  ['Vicky Ostwal', 'Royal Challengers Bengaluru', 'RHB', 'Left-arm Slow Orthodox'],
  ['Vihaan Malhotra', 'Royal Challengers Bengaluru', 'RHB', 'Right-arm Leg Spin'],
  ['Kanishk Chouhan', 'Royal Challengers Bengaluru', 'RHB', 'Right-arm Off Spin'],
  ['Abhishek Sharma', 'Sunrisers Hyderabad', 'LHB', 'Left-arm Slow Orthodox'],
  ['Nitish Kumar Reddy', 'Sunrisers Hyderabad', 'RHB', 'Right-arm Medium Fast'],
  ['Kamindu Mendis', 'Sunrisers Hyderabad', 'LHB', 'Ambidextrous Spin'],
  ['Jack Edwards', 'Sunrisers Hyderabad', 'RHB', 'Right-arm Fast Medium'],
  ['Brydon Carse', 'Sunrisers Hyderabad', 'RHB', 'Right-arm Fast'],
  ['Harsh Dubey', 'Sunrisers Hyderabad', 'LHB', 'Left-arm Slow Orthodox'],
  ['Shivang Kumar', 'Sunrisers Hyderabad', 'RHB', 'Left-arm Slow Unorthodox'],
  ['Zeeshan Ansari', 'Sunrisers Hyderabad', 'RHB', 'Right-arm Leg Spin'],
  ['Praful Hinge', 'Sunrisers Hyderabad', 'RHB', 'Right-arm Fast Medium'],
];

// ─── Sheet 4: Wicket-keepers — [name, franchise, battingStyle] ────────────────

const WK_DATA: [string, string, string][] = [
  ['Sanju Samson', 'Chennai Super Kings', 'RHB'],
  ['MS Dhoni', 'Chennai Super Kings', 'RHB'],
  ['Urvil Patel', 'Chennai Super Kings', 'RHB'],
  ['KL Rahul', 'Delhi Capitals', 'RHB'],
  ['Tristan Stubbs', 'Delhi Capitals', 'RHB'],
  ['Abishek Porel', 'Delhi Capitals', 'LHB'],
  ['Ben Duckett', 'Delhi Capitals', 'LHB'],
  ['Jos Buttler', 'Gujarat Titans', 'RHB'],
  ['Kumar Kushagra', 'Gujarat Titans', 'RHB'],
  ['Anuj Rawat', 'Gujarat Titans', 'LHB'],
  ['Tom Banton', 'Gujarat Titans', 'RHB'],
  ['Finn Allen', 'Kolkata Knight Riders', 'RHB'],
  ['Tejasvi Singh', 'Kolkata Knight Riders', 'RHB'],
  ['Rishabh Pant', 'Lucknow Super Giants', 'LHB'],
  ['Nicholas Pooran', 'Lucknow Super Giants', 'LHB'],
  ['Josh Inglis', 'Lucknow Super Giants', 'RHB'],
  ['Mukul Choudhary', 'Lucknow Super Giants', 'RHB'],
  ['Quinton de Kock', 'Mumbai Indians', 'LHB'],
  ['Ryan Rickelton', 'Mumbai Indians', 'LHB'],
  ['Robin Minz', 'Mumbai Indians', 'LHB'],
  ['Mohammad Izhar', 'Mumbai Indians', 'RHB'],
  ['Prabhsimran Singh', 'Punjab Kings', 'RHB'],
  ['Vishnu Vinod', 'Punjab Kings', 'RHB'],
  ['Lhuan-dre Pretorius', 'Rajasthan Royals', 'LHB'],
  ['Dhruv Jurel', 'Rajasthan Royals', 'RHB'],
  ['Ravi Singh', 'Rajasthan Royals', 'RHB'],
  ['Jitesh Sharma', 'Royal Challengers Bengaluru', 'RHB'],
  ['Phil Salt', 'Royal Challengers Bengaluru', 'RHB'],
  ['Jordan Cox', 'Royal Challengers Bengaluru', 'RHB'],
  ['Heinrich Klaasen', 'Sunrisers Hyderabad', 'RHB'],
  ['Ishan Kishan', 'Sunrisers Hyderabad', 'LHB'],
  ['Salil Arora', 'Sunrisers Hyderabad', 'RHB'],
];

// ─── Builder functions ────────────────────────────────────────────────────────

function buildBowler(index: number, [name, franchise, bowlingStyle, battingStyle]: [string, string, string, string]): Player {
  const spinnerRole = isSpinner(bowlingStyle);
  const role: PlayerRole = spinnerRole ? 'spinner' : 'fast-bowler';
  const category = getCategory(name);
  const stats = getStats(category, role);
  const nationality = OVERSEAS.has(name) ? 'overseas' as const : 'indian' as const;
  const rating = RATING_OVERRIDES[name] ?? stats.rating;
  return {
    id: `p${index + 1}`,
    name, franchise, role,
    subRole: bowlingStyle,
    category, nationality,
    basePrice: stats.basePrice,
    batting: stats.batting,
    bowling: stats.bowling,
    fielding: stats.fielding,
    rating,
    battingStyle,
    bowlingStyle,
    photo: IMAGE_URLS[name] || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${ROLE_COLORS[role]}&color=fff&size=128&bold=true`,
    status: 'available',
    soldToTeamId: null,
    soldPrice: null,
    previousTeamId: null,
  };
}

function buildAllrounder(index: number, [name, franchise, battingStyle, bowlingStyle]: [string, string, string, string]): Player {
  const category = getCategory(name);
  const stats = getStats(category, 'all-rounder');
  const nationality = OVERSEAS.has(name) ? 'overseas' as const : 'indian' as const;
  const rating = RATING_OVERRIDES[name] ?? stats.rating;
  return {
    id: `p${index + 1}`,
    name, franchise,
    role: 'all-rounder',
    subRole: bowlingStyle,
    category, nationality,
    basePrice: stats.basePrice,
    batting: stats.batting,
    bowling: stats.bowling,
    fielding: stats.fielding,
    rating,
    battingStyle,
    bowlingStyle,
    photo: IMAGE_URLS[name] || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${ROLE_COLORS['all-rounder']}&color=fff&size=128&bold=true`,
    status: 'available',
    soldToTeamId: null,
    soldPrice: null,
    previousTeamId: null,
  };
}

function buildWicketKeeper(index: number, [name, franchise, battingStyle]: [string, string, string]): Player {
  const category = getCategory(name);
  const stats = getStats(category, 'wicket-keeper');
  const nationality = OVERSEAS.has(name) ? 'overseas' as const : 'indian' as const;
  const rating = RATING_OVERRIDES[name] ?? stats.rating;
  return {
    id: `p${index + 1}`,
    name, franchise,
    role: 'wicket-keeper',
    subRole: 'Wicket-keeper Batsman',
    category, nationality,
    basePrice: stats.basePrice,
    batting: stats.batting,
    bowling: stats.bowling,
    fielding: stats.fielding,
    rating,
    battingStyle,
    bowlingStyle: '—',
    photo: IMAGE_URLS[name] || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${ROLE_COLORS['wicket-keeper']}&color=fff&size=128&bold=true`,
    status: 'available',
    soldToTeamId: null,
    soldPrice: null,
    previousTeamId: null,
  };
}

// ─── Sheet 1: Batsmen — [name, franchise, battingStyle, bowlingStyle] ─────────
// bowlingStyle is the part-time bowling style, or '—' for none

const BATSMAN_DATA: [string, string, string, string][] = [
  ['Ruturaj Gaikwad', 'Chennai Super Kings', 'RHB', '—'],
  ['Ayush Mhatre', 'Chennai Super Kings', 'RHB', '—'],
  ['Dewald Brevis', 'Chennai Super Kings', 'RHB', 'Right-arm Leg Spin'],
  ['Sarfaraz Khan', 'Chennai Super Kings', 'RHB', 'Right-arm Leg Spin'],
  ['Karun Nair', 'Delhi Capitals', 'RHB', 'Right-arm Off Spin'],
  ['Prithvi Shaw', 'Delhi Capitals', 'RHB', '—'],
  ['Sameer Rizvi', 'Delhi Capitals', 'RHB', '—'],
  ['Ashutosh Sharma', 'Delhi Capitals', 'RHB', '—'],
  ['Pathum Nissanka', 'Delhi Capitals', 'RHB', '—'],
  ['Sahil Parakh', 'Delhi Capitals', 'LHB', 'Right-arm Off Spin'],
  ['David Miller', 'Delhi Capitals', 'LHB', '—'],
  ['Shubman Gill', 'Gujarat Titans', 'RHB', 'Right-arm Off Spin'],
  ['Sai Sudharsan', 'Gujarat Titans', 'LHB', 'Right-arm Leg Spin'],
  ['Shahrukh Khan', 'Gujarat Titans', 'RHB', 'Right-arm Off Spin'],
  ['Rinku Singh', 'Kolkata Knight Riders', 'LHB', 'Right-arm Off Spin'],
  ['Angkrish Raghuvanshi', 'Kolkata Knight Riders', 'RHB', 'Right-arm Off Spin'],
  ['Ajinkya Rahane', 'Kolkata Knight Riders', 'RHB', '—'],
  ['Manish Pandey', 'Kolkata Knight Riders', 'RHB', '—'],
  ['Rovman Powell', 'Kolkata Knight Riders', 'RHB', 'Right-arm Medium'],
  ['Aiden Markram', 'Lucknow Super Giants', 'RHB', 'Right-arm Off Spin'],
  ['Himmat Singh', 'Lucknow Super Giants', 'RHB', '—'],
  ['Matthew Breetzke', 'Lucknow Super Giants', 'RHB', '—'],
  ['Akshat Raghuwanshi', 'Lucknow Super Giants', 'RHB', '—'],
  ['Abdul Samad', 'Lucknow Super Giants', 'RHB', 'Right-arm Leg Spin'],
  ['Rohit Sharma', 'Mumbai Indians', 'RHB', 'Right-arm Off Spin'],
  ['Suryakumar Yadav', 'Mumbai Indians', 'RHB', 'Right-arm Medium'],
  ['Tilak Varma', 'Mumbai Indians', 'LHB', 'Right-arm Off Spin'],
  ['Sherfane Rutherford', 'Mumbai Indians', 'LHB', 'Right-arm Fast Medium'],
  ['Danish Malewar', 'Mumbai Indians', 'RHB', 'Right-arm Leg Spin'],
  ['Shreyas Iyer', 'Punjab Kings', 'RHB', 'Right-arm Leg Spin'],
  ['Shashank Singh', 'Punjab Kings', 'RHB', 'Right-arm Medium'],
  ['Priyansh Arya', 'Punjab Kings', 'LHB', '—'],
  ['Pyla Avinash', 'Punjab Kings', 'RHB', '—'],
  ['Suryansh Shedge', 'Punjab Kings', 'RHB', '—'],
  ['Harnoor Singh', 'Punjab Kings', 'LHB', '—'],
  ['Yashasvi Jaiswal', 'Rajasthan Royals', 'LHB', 'Right-arm Leg Spin'],
  ['Shimron Hetmyer', 'Rajasthan Royals', 'LHB', '—'],
  ['Shubham Dubey', 'Rajasthan Royals', 'LHB', 'Right-arm Off break'],
  ['Vaibhav Suryavanshi', 'Rajasthan Royals', 'LHB', '—'],
  ['Aman Rao', 'Rajasthan Royals', 'RHB', 'Right-arm Off Spin'],
  ['Virat Kohli', 'Royal Challengers Bengaluru', 'RHB', 'Right-arm Medium'],
  ['Rajat Patidar', 'Royal Challengers Bengaluru', 'RHB', 'Right-arm Off Spin'],
  ['Devdutt Padikkal', 'Royal Challengers Bengaluru', 'LHB', 'Right-arm Off Spin'],
  ['Travis Head', 'Sunrisers Hyderabad', 'LHB', 'Right-arm Off Spin'],
  ['Aniket Verma', 'Sunrisers Hyderabad', 'RHB', '—'],
  ['Smaran Ravichandran', 'Sunrisers Hyderabad', 'LHB', '—'],
];

function buildBatsman(index: number, [name, franchise, battingStyle, bowlingStyle]: [string, string, string, string]): Player {
  const category = getCategory(name);
  const stats = getStats(category, 'batsman');
  const nationality = OVERSEAS.has(name) ? 'overseas' as const : 'indian' as const;
  const rating = RATING_OVERRIDES[name] ?? stats.rating;
  return {
    id: `p${index + 1}`,
    name, franchise,
    role: 'batsman',
    subRole: bowlingStyle !== '—' ? `Part-time ${bowlingStyle}` : 'Batsman',
    category, nationality,
    basePrice: stats.basePrice,
    batting: stats.batting,
    bowling: stats.bowling,
    fielding: stats.fielding,
    rating,
    battingStyle,
    bowlingStyle,
    photo: IMAGE_URLS[name] || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${ROLE_COLORS['batsman']}&color=fff&size=128&bold=true`,
    status: 'available',
    soldToTeamId: null,
    soldPrice: null,
    previousTeamId: null,
  };
}

// ─── Combine all players ───────────────────────────────────────────────────────
// p1–p75:    Bowlers     (Sheet 2)
// p76–p150:  All-rounders (Sheet 3)
// p151–p182: Wicket-keepers (Sheet 4)
// p183–p228: Batsmen    (Sheet 1)

const bowlers = BOWLER_DATA.map((data, i) => buildBowler(i, data));
const allrounders = ALLROUNDER_DATA.map((data, i) => buildAllrounder(75 + i, data));
const wicketKeepers = WK_DATA.map((data, i) => buildWicketKeeper(150 + i, data));
const batsmen = BATSMAN_DATA.map((data, i) => buildBatsman(182 + i, data));

export const initialPlayers: Player[] = [...bowlers, ...allrounders, ...wicketKeepers, ...batsmen];

// Helper to get initials avatar URL (used as fallback)
export function getInitialsAvatar(name: string, role: PlayerRole): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${ROLE_COLORS[role]}&color=fff&size=128&bold=true`;
}
