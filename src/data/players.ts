export type PlayerRole = 'batsman' | 'fast-bowler' | 'spinner' | 'wicket-keeper' | 'all-rounder';
export type PlayerCategory = 'marquee' | 'premium' | 'mid-tier' | 'budget';
export type PlayerStatus = 'available' | 'retained' | 'live' | 'pending_sale' | 'sold' | 'unsold';
export type StatTemplate = 'bowling' | 'batting' | 'allround';

export interface FormatStatRow {
  mts: number | null;
  s1: number | null;
  s2: number | null;
}

export interface PlayerFormatStats {
  template: StatTemplate;
  T20: FormatStatRow;
  IPL: FormatStatRow;
  T201: FormatStatRow;
}

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
  formatStats?: PlayerFormatStats;
}

export const PLAYER_COUNTRY: Record<string, string> = {
  // Sri Lanka
  'Matheesha Pathirana': 'SRI LANKA', 'Dushmantha Chameera': 'SRI LANKA',
  'Wanindu Hasaranga': 'SRI LANKA', 'Kamindu Mendis': 'SRI LANKA', 'Pathum Nissanka': 'SRI LANKA',
  // Afghanistan
  'Rashid Khan': 'AFG', 'Noor Ahmad': 'AFG', 'Allah Ghazanfar': 'AFG',
  // Australia
  'Mitchell Starc': 'AUS', 'Pat Cummins': 'AUS', 'Josh Hazlewood': 'AUS',
  'Nathan Ellis': 'AUS', 'Travis Head': 'AUS', 'David Warner': 'AUS',
  'Glenn Maxwell': 'AUS', 'Marcus Stoinis': 'AUS', 'Tim David': 'AUS',
  'Mitchell Marsh': 'AUS', 'Xavier Bartlett': 'AUS', 'Matthew Short': 'AUS',
  'Cameron Green': 'AUS', 'Cooper Connolly': 'AUS', 'Jacob Bethell': 'AUS',
  // South Africa
  'Kagiso Rabada': 'SA', 'Gerald Coetzee': 'SA', 'Nandre Burger': 'SA',
  'Kwena Maphaka': 'SA', 'Marco Jansen': 'SA', 'Corbin Bosch': 'SA',
  'Tristan Stubbs': 'SA', 'Aiden Markram': 'SA', 'Glenn Phillips': 'SA',
  'Heinrich Klaasen': 'SA', 'Donovan Ferreira': 'SA', 'David Miller': 'SA',
  'Lhuan-dre Pretorius': 'SA', 'Matthew Breetzke': 'SA',
  // New Zealand
  'Trent Boult': 'NZ', 'Matt Henry': 'NZ', 'Kyle Jamieson': 'NZ',
  'Lockie Ferguson': 'NZ', 'Jacob Duffy': 'NZ', 'Rachin Ravindra': 'NZ',
  'Mitchell Santner': 'NZ', 'Finn Allen': 'NZ', 'Josh Inglis': 'NZ',
  'Bevon Jacobs': 'NZ',
  // West Indies
  'Andre Russell': 'WI', 'Sunil Narine': 'WI', 'Akeal Hosein': 'WI',
  'Nicholas Pooran': 'WI', 'Shimron Hetmyer': 'WI', 'Rovman Powell': 'WI',
  'Sherfane Rutherford': 'WI', 'Romario Shepherd': 'WI', 'Jason Holder': 'WI',
  // England
  'Jofra Archer': 'ENG', 'Sam Curran': 'ENG', 'Liam Livingstone': 'ENG',
  'Will Jacks': 'ENG', 'Moeen Ali': 'ENG', 'Ben Duckett': 'ENG',
  'Phil Salt': 'ENG', 'Jordan Cox': 'ENG', 'Jamie Overton': 'ENG',
  'Zak Foulkes': 'ENG', 'Luke Wood': 'ENG', 'Jack Edwards': 'ENG',
  'Brydon Carse': 'ENG',
  // Pakistan
  'Babar Azam': 'PAK',
  // Zimbabwe / Others
  'Sikandar Raza': 'ZIM',
};

function fs(template: StatTemplate, t20: [number|null,number|null,number|null], ipl: [number|null,number|null,number|null], t201: [number|null,number|null,number|null]): PlayerFormatStats {
  return {
    template,
    T20:  { mts: t20[0],  s1: t20[1],  s2: t20[2]  },
    IPL:  { mts: ipl[0],  s1: ipl[1],  s2: ipl[2]  },
    T201: { mts: t201[0], s1: t201[1], s2: t201[2]  },
  };
}

const PLAYER_FORMAT_STATS: Record<string, PlayerFormatStats> = {
  // ── BOWLERS (template: bowling — s1=WKTS, s2=ECON) ────────────────────────
  'Jasprit Bumrah':       fs('bowling', [233,295,6.89], [133,165,7.30], [70,89,6.27]),
  'Matheesha Pathirana':  fs('bowling', [11,12,8.71],  [20,34,7.88],   [19,30,8.44]),
  'Syed Khaleel Ahmed':   fs('bowling', [118,152,8.34],[61,82,8.75],   [18,16,8.51]),
  'Khaleel Ahmed':        fs('bowling', [118,152,8.34],[61,82,8.75],   [18,16,8.51]),
  'Noor Ahmad':           fs('bowling', [136,160,7.17],[27,34,8.01],   [14,7,6.94]),
  'Varun Chakaravarthy':  fs('bowling', [110,144,7.34],[75,89,7.49],   [18,33,7.02]),
  'Mukesh Choudhary':     fs('bowling', [35,47,9.14],  [15,16,9.92],   [null,null,null]),
  'Nathan Ellis':         fs('bowling', [161,194,8.10],[17,19,8.66],   [20,15,5.48]),
  'Kamlesh Nagarkoti':    fs('bowling', [32,29,7.75],  [12,19,9.50],   [null,null,null]),
  'Shreyas Gopal':        fs('bowling', [104,124,7.48],[52,52,8.16],   [null,null,null]),
  'Mitchell Starc':       fs('bowling', [145,202,7.79],[44,60,8.26],   [65,79,7.74]),
  'T Natarajan':          fs('bowling', [95,104,8.45], [61,67,8.83],   [4,7,7.62]),
  'Trent Boult':          fs('bowling', [250,289,8.02],[108,124,8.28], [61,83,7.68]),
  'Mohit Sharma':         fs('bowling', [167,166,8.42],[115,133,8.69], [8,6,8.04]),
  'Mukesh Kumar':         fs('bowling', [68,73,8.88],  [23,26,10.32],  [17,20,9.01]),
  'Dushmantha Chameera':  fs('bowling', [137,142,8.15],[13,9,9.19],    [55,55,8.08]),
  'Kagiso Rabada':        fs('bowling', [222,278,8.02],[82,119,8.53],  [65,71,8.30]),
  'Prasidh Krishna':      fs('bowling', [86,86,8.54],  [55,54,8.80],   [5,8,11.00]),
  'Manav Suthar':         fs('bowling', [15,10,7.05],  [1,0,13.00],    [null,null,null]),
  'Gerald Coetzee':       fs('bowling', [65,88,8.65],  [10,13,10.17],  [10,12,10.57]),
  'Gurnoor Brar':         fs('bowling', [3,0,13.25],   [1,0,14.00],    [null,null,null]),
  'Gurnoor Singh Brar':   fs('bowling', [3,0,13.25],   [1,0,14.00],    [null,null,null]),
  'Ishant Sharma':        fs('bowling', [175,152,7.89],[113,93,8.32],  [14,8,8.63]),
  'Mohammed Siraj':       fs('bowling', [null,null,null],[null,null,null],[null,null,null]),
  'Pat Cummins':          fs('bowling', [null,null,null],[null,null,null],[null,null,null]),
  'Josh Hazlewood':       fs('bowling', [null,null,null],[null,null,null],[null,null,null]),
  'Yuzvendra Chahal':     fs('bowling', [null,null,null],[null,null,null],[null,null,null]),
  'Kuldeep Yadav':        fs('bowling', [null,null,null],[null,null,null],[null,null,null]),
  'Arshdeep Singh':       fs('bowling', [null,null,null],[null,null,null],[null,null,null]),
  'Jofra Archer':         fs('bowling', [null,null,null],[null,null,null],[null,null,null]),
  'Mohammed Shami':       fs('bowling', [null,null,null],[null,null,null],[null,null,null]),
  'Deepak Chahar':        fs('bowling', [null,null,null],[null,null,null],[null,null,null]),
  'Bhuvneshwar Kumar':    fs('bowling', [null,null,null],[null,null,null],[null,null,null]),
  'Harshal Patel':        fs('bowling', [203,1269,248],[110,269,139],  [25,77,29]),
  'Ravi Bishnoi':         fs('bowling', [null,null,null],[null,null,null],[null,null,null]),
  'Rashid Khan':          fs('bowling', [466,635,6.52],[125,150,6.92], [96,161,6.08]),
  'Ravichandran Ashwin':  fs('bowling', [329,315,7.10],[217,185,7.18], [65,72,6.90]),
  'Axar Patel':           fs('bowling', [277,239,7.02],[153,123,7.29], [71,71,7.30]),
  'Gurjapneet Singh':     fs('bowling', [5,9,9.82],    [null,null,null],[null,null,null]),

  // ── ALL-ROUNDERS (template: allround — s1=RUNS, s2=WKTS) ─────────────────
  'Hardik Pandya':        fs('allround', [291,5432,200], [141,2606,74],  [114,1812,94]),
  'Glenn Maxwell':        fs('allround', [462,10407,176],[124,2317,31],  [116,2664,43]),
  'Rahul Tewatia':        fs('allround', [158,1818,69],  [null,null,null],[null,null,null]),
  'Ravindra Jadeja':      fs('allround', [336,3760,null],[244,3035,162], [74,515,54]),
  'Abdul Samad':          fs('allround', [93,1531,4],    [53,630,2],     [null,null,null]),
  'Abhishek Sharma':      fs('allround', [137,3646,47],  [47,676,7],     [17,535,6]),
  'Andre Russell':        fs('allround', [542,9018,470], [131,2262,119], [83,1063,60]),
  'Ashutosh Sharma':      fs('allround', [33,839,3],     [13,256,null],  [null,null,null]),
  'Glenn Phillips':       fs('allround', [260,6624,25],  [8,65,2],       [83,1929,6]),
  'Krunal Pandya':        fs('allround', [211,2850,152], [130,1652,78],  [19,124,15]),
  'Nitish Kumar Reddy':   fs('allround', [29,597,6],     [20,415,3],     [4,90,3]),
  'Liam Livingstone':     fs('allround', [304,6851,130], [43,1018,13],   [60,955,33]),
  'Marco Jansen':         fs('allround', [102,910,115],  [14,63,12],     [17,166,16]),
  'Mitchell Santner':     fs('allround', [218,2374,217], [23,109,16],    [109,725,120]),
  'Moeen Ali':            fs('allround', [375,7140,245], [69,916,37],    [92,1229,51]),
  'Nitish Rana':          fs('allround', [197,4743,51],  [111,2748,10],  [2,15,null]),
  'Rachin Ravindra':      fs('allround', [84,1246,57],   [14,331,0],     [26,309,13]),
  'Sam Curran':           fs('allround', [270,4083,254], [61,895,58],    [58,356,54]),
  'Marcus Stoinis':       fs('allround', [310,6449,158], [99,1887,43],   [74,1245,45]),
  'Shahbaz Ahmed':        fs('allround', [107,1295,68],  [56,545,21],    [2,null,2]),
  'Tim David':            fs('allround', [273,5207,15],  [42,714,null],  [54,1201,5]),
  'Sunil Narine':         fs('allround', [539,4427,576], [180,1585,182], [51,155,52]),
  'Vijay Shankar':        fs('allround', [148,2414,36],  [74,1193,9],    [9,101,5]),
  'Venkatesh Iyer':       fs('allround', [128,2965,49],  [55,1395,3],    [9,133,5]),
  'Will Jacks':           fs('allround', [206,5144,65],  [12,284,3],     [23,383,1]),
  'Sameer Rizvi':         fs('allround', [30,504,null],  [10,75,null],   [null,null,null]),
  'Washington Sundar':    fs('allround', [150,1344,113], [61,427,37],    [54,193,48]),
  'Mitchell Marsh':       fs('allround', [null,null,null],[null,null,null],[null,null,null]),
  'Wanindu Hasaranga':    fs('allround', [null,null,null],[null,null,null],[null,null,null]),
  'Cameron Green':        fs('allround', [null,null,null],[null,null,null],[null,null,null]),
  'Angkrish Raghuvanshi': fs('allround', [23,437,0],     [14,291,0],     [0,0,0]),
  'Abhinav Manohar':      fs('allround', [44,731,1],     [11,231,0],     [null,null,null]),
  'Shardul Thakur':       fs('allround', [null,null,null],[null,null,null],[null,null,null]),
  'Jason Holder':         fs('allround', [null,null,null],[null,null,null],[null,null,null]),

  // ── BATSMEN (template: batting — s1=RUNS, s2=SR) ─────────────────────────
  'Virat Kohli':          fs('batting', [188,4502,131.59],[48,1092,null],[57,1367,130]),
  'Rohit Sharma':         fs('batting', [null,null,null],[null,null,null],[null,null,null]),
  'Yashasvi Jaiswal':     fs('batting', [108,3079,149.53],[57,1708,149.30],[23,723,164.31]),
  'Shubman Gill':         fs('batting', [null,null,null],[null,null,null],[null,null,null]),
  'Suryakumar Yadav':     fs('batting', [313,8074,152.31],[155,3765,145.98],[83,2598,167.07]),
  'Travis Head':          fs('batting', [151,4084,149.65],[30,920,176.24],[38,1093,160.49]),
  'Tilak Varma':          fs('batting', [107,3410,146.28],[43,1251,143.13],[25,749,155.07]),
  'Devdutt Padikkal':     fs('batting', [102,2847,132.23],[68,1637,124.48],[2,38,100]),
  'Shreyas Iyer':         fs('batting', [null,null,null],[null,null,null],[null,null,null]),
  'Ruturaj Gaikwad':      fs('batting', [null,null,null],[null,null,null],[null,null,null]),
  'Sai Sudharsan':        fs('batting', [null,null,null],[null,null,null],[null,null,null]),
  'Aiden Markram':        fs('batting', [null,null,null],[null,null,null],[null,null,null]),
  'David Miller':         fs('batting', [523,11276,137.96],[134,3010,139.48],[130,4611,103.68]),
  'Shimron Hetmyer':      fs('batting', [null,null,null],[null,null,null],[null,null,null]),
  'Rinku Singh':          fs('batting', [null,null,null],[null,null,null],[null,null,null]),
  'Sherfane Rutherford':  fs('batting', [null,null,null],[null,null,null],[null,null,null]),
  'Rovman Powell':        fs('batting', [null,null,null],[null,null,null],[null,null,null]),
  'Prithvi Shaw':         fs('batting', [null,null,null],[null,null,null],[null,null,null]),
  'Aniket Verma':         fs('batting', [6,141,180.76],  [5,141,183.11], [null,null,null]),
  'Vaibhav Suryavanshi':  fs('batting', [1,13,216.66],   [null,null,null],[null,null,null]),
  'Dewald Brevis':        fs('batting', [null,null,null],[null,null,null],[null,null,null]),
  'Ajinkya Rahane':       fs('batting', [null,null,null],[null,null,null],[null,null,null]),
  'Rajat Patidar':        fs('batting', [null,null,null],[null,null,null],[null,null,null]),

  // ── WICKET-KEEPERS (template: batting — s1=RUNS, s2=SR) ──────────────────
  'MS Dhoni':             fs('batting', [null,null,null],[null,null,null],[null,null,null]),
  'Rishabh Pant':         fs('batting', [null,null,null],[null,null,null],[null,null,null]),
  'KL Rahul':             fs('batting', [null,null,null],[null,null,null],[null,null,null]),
  'Jos Buttler':          fs('batting', [null,null,null],[null,null,null],[null,null,null]),
  'Sanju Samson':         fs('batting', [null,null,null],[null,null,null],[null,null,null]),
  'Nicholas Pooran':      fs('batting', [null,null,null],[null,null,null],[null,null,null]),
  'Quinton de Kock':      fs('batting', [null,null,null],[null,null,null],[null,null,null]),
  'Heinrich Klaasen':     fs('batting', [null,null,null],[null,null,null],[null,null,null]),
  'Phil Salt':            fs('batting', [null,null,null],[null,null,null],[null,null,null]),
  'Ishan Kishan':         fs('batting', [null,null,null],[null,null,null],[null,null,null]),
  'Tristan Stubbs':       fs('batting', [125,2649,134.80],[21,484,172.24],[35,670,146.03]),
  'Abishek Porel':        fs('batting', [18,990,159.51], [21,427,154.72],[null,null,null]),
  'Anuj Rawat':           fs('batting', [71,1259,120.70],[24,318,119.10],[null,null,null]),
  'Vishnu Vinod':         fs('batting', [67,1620,142.23],[6,56,98.24],   [null,null,null]),
  'Jitesh Sharma':        fs('batting', [null,null,null],[null,null,null],[null,null,null]),
  'Dhruv Jurel':          fs('batting', [null,null,null],[null,null,null],[null,null,null]),
  'Finn Allen':           fs('batting', [null,null,null],[null,null,null],[null,null,null]),
  'Prabhsimran Singh':    fs('batting', [null,null,null],[null,null,null],[null,null,null]),
  'Ryan Rickelton':       fs('batting', [null,null,null],[null,null,null],[null,null,null]),
  'Lhuan-dre Pretorius':  fs('batting', [null,null,null],[null,null,null],[null,null,null]),
  'Ben Duckett':          fs('batting', [null,null,null],[null,null,null],[null,null,null]),
  'Tom Banton':           fs('batting', [null,null,null],[null,null,null],[null,null,null]),
  'Josh Inglis':          fs('batting', [null,null,null],[null,null,null],[null,null,null]),
};

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

function defaultFormatStats(role: PlayerRole): PlayerFormatStats {
  const template: StatTemplate = (role === 'fast-bowler' || role === 'spinner') ? 'bowling' : (role === 'all-rounder') ? 'allround' : 'batting';
  const empty = { mts: null, s1: null, s2: null };
  return { template, T20: empty, IPL: empty, T201: empty };
}

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
    formatStats: PLAYER_FORMAT_STATS[name] ?? defaultFormatStats(role),
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
    formatStats: PLAYER_FORMAT_STATS[name] ?? defaultFormatStats('all-rounder'),
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
    formatStats: PLAYER_FORMAT_STATS[name] ?? defaultFormatStats('wicket-keeper'),
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
    formatStats: PLAYER_FORMAT_STATS[name] ?? defaultFormatStats('batsman'),
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

export const initialPlayers: Player[] = [...batsmen, ...bowlers, ...allrounders, ...wicketKeepers];

// Helper to get initials avatar URL (used as fallback)
export function getInitialsAvatar(name: string, role: PlayerRole): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${ROLE_COLORS[role]}&color=fff&size=128&bold=true`;
}
