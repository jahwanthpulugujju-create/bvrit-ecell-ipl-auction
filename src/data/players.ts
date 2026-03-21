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
  // CSK bowlers
  'Matt Henry':            fs('bowling', [130,170,7.99],  [10,8,8.05],     [22,27,7.99]),
  'Syed Khaleel Ahmed':    fs('bowling', [145,158,8.62],  [65,75,8.62],    [18,18,8.8]),
  'Khaleel Ahmed':         fs('bowling', [145,158,8.62],  [65,75,8.62],    [18,18,8.8]),
  'Mukesh Choudhary':      fs('bowling', [75,78,9.1],     [23,20,9.06],    [null,null,null]),
  'Noor Ahmad':            fs('bowling', [140,173,8.0],   [30,35,7.5],     [47,12,4.67]),
  'Akeal Hosein':          fs('bowling', [140,108,6.7],   [9,12,7.74],     [27,23,6.59]),
  'Rahul Chahar':          fs('bowling', [175,175,6.7],   [51,61,6.27],    [14,null,null]),
  // DC bowlers
  'Mitchell Starc':        fs('bowling', [245,295,8.2],   [78,51,8.23],    [14,14,8.01]),
  'Kuldeep Yadav':         fs('bowling', [205,235,8.09],  [94,109,8.09],   [28,42,8.05]),
  'Mukesh Kumar':          fs('bowling', [80,88,8.95],    [23,26,9.95],    [null,null,null]),
  'T Natarajan':           fs('bowling', [135,148,8.95],  [78,84,9.0],     [null,null,null]),
  'Dushmantha Chameera':   fs('bowling', [155,168,8.95],  [13,9,8.95],     [42,45,8.07]),
  'Lungi Ngidi':           fs('bowling', [110,125,8.33],  [16,18,8.89],    [27,33,8.33]),
  'Kyle Jamieson':         fs('bowling', [70,82,8.18],    [14,16,8.89],    [5,7,9.1]),
  'Ashok Sharma':          fs('bowling', [20,18,9.2],     [5,5,9.3],       [null,null,null]),
  'Prithvi Raj':           fs('bowling', [15,14,8.8],     [null,null,null],[null,null,null]),
  'Luke Wood':             fs('bowling', [105,118,8.6],   [5,5,8.7],       [4,5,8.9]),
  // GT bowlers
  'Kagiso Rabada':         fs('bowling', [295,365,8.27],  [77,87,8.27],    [41,42,8.38]),
  'Mohammed Siraj':        fs('bowling', [200,218,8.74],  [24,26,8.66],    [13,13,8.8]),
  'Mohammad Siraj':        fs('bowling', [200,218,8.74],  [24,26,8.66],    [13,13,8.8]),
  'Prasidh Krishna':       fs('bowling', [130,148,8.55],  [65,72,8.55],    [13,13,8.8]),
  'Ishant Sharma':         fs('bowling', [120,115,8.08],  [53,48,8.08],    [20,null,7.72]),
  'Rashid Khan':           fs('bowling', [445,568,6.23],  [114,142,6.31],  [79,112,6.28]),
  'Manav Suthar':          fs('bowling', [15,10,7.05],    [1,0,13.00],     [null,null,null]),
  'Sai Kishore':           fs('bowling', [20,12,7.93],    [null,null,null],[null,null,null]),
  // KKR bowlers
  'Varun Chakaravarthy':   fs('bowling', [155,188,7.83],  [81,102,7.81],   [14,17,7.02]),
  'Harshit Rana':          fs('bowling', [70,80,9.23],    [35,44,9.23],    [5,4,9.5]),
  'Vaibhav Arora':         fs('bowling', [75,80,9.4],     [23,25,9.22],    [null,null,null]),
  'Umran Malik':           fs('bowling', [80,88,8.38],    [41,44,10.05],   [3,4,10.2]),
  'Matheesha Pathirana':   fs('bowling', [110,138,8.3],   [36,49,7.49],    [28,38,8.28]),
  'Prashant Solanki':      fs('bowling', [45,42,8.2],     [20,18,8.25],    [null,null,null]),
  // LSG bowlers
  'Mohammed Shami':        fs('bowling', [200,230,8.09],  [120,120,8.09],  [23,24,8.07]),
  'Mohammad Shami':        fs('bowling', [200,230,8.09],  [120,120,8.09],  [23,24,8.07]),
  'Mayank Yadav':          fs('bowling', [30,37,7.38],    [10,15,7.38],    [null,null,null]),
  'M Siddharth':           fs('bowling', [40,38,7.6],     [10,9,7.65],     [null,null,null]),
  'Avesh Khan':            fs('bowling', [155,175,8.89],  [82,96,8.89],    [10,7,9.1]),
  'Mohsin Khan':           fs('bowling', [17,21,8.55],    [35,44,7.95],    [4,4,6.86]),
  // MI bowlers
  'Jasprit Bumrah':        fs('bowling', [233,295,6.89],  [133,165,7.30],  [70,89,6.27]),
  'Trent Boult':           fs('bowling', [235,278,8.32],  [93,108,8.32],   [38,47,7.39]),
  'Deepak Chahar':         fs('bowling', [198,207,7.61],  [107,91,7.61],   [19,47,7.42]),
  'Mayank Markande':       fs('bowling', [65,68,7.93],    [24,22,7.93],    [null,null,null]),
  'Allah Ghazanfar':       fs('bowling', [45,52,7.2],     [7,10,7.3],      [20,22,7.15]),
  'Vignesh Puthur':        fs('bowling', [20,18,8.5],     [5,4,8.6],       [null,null,null]),
  // PBKS bowlers
  'Arshdeep Singh':        fs('bowling', [220,255,8.47],  [121,84,8.47],   [65,76,8.14]),
  'Yuzvendra Chahal':      fs('bowling', [285,335,7.6],   [163,205,7.59],  [80,96,8.05]),
  'Lockie Ferguson':       fs('bowling', [220,255,8.5],   [40,44,8.96],    [33,41,7.77]),
  'Xavier Bartlett':       fs('bowling', [65,72,8.8],     [12,14,9.0],     [10,11,8.8]),
  'Yash Thakur':           fs('bowling', [65,72,8.9],     [null,null,null],[null,null,null]),
  'Vyshak Vijaykumar':     fs('bowling', [65,72,8.9],     [18,14,9.44],    [null,null,null]),
  'Pravin Dubey':          fs('bowling', [20,18,8.6],     [5,4,8.7],       [null,null,null]),
  'Vishal Nishad':         fs('bowling', [10,8,9.2],      [null,null,null],[null,null,null]),
  'Ben Dwarshuis':         fs('bowling', [105,120,8.5],   [5,5,8.6],       [22,26,6.85]),
  // RR bowlers
  'Jofra Archer':          fs('bowling', [130,163,7.96],  [37,46,7.96],    [22,26,6.85]),
  'Sandeep Sharma':        fs('bowling', [255,285,8.05],  [143,151,8.05],  [null,null,null]),
  'Ravi Bishnoi':          fs('bowling', [185,165,8.22],  [76,78,8.22],    [36,47,7.72]),
  'Nandre Burger':         fs('bowling', [65,75,8.17],    [8,9,8.2],       [10,14,8.17]),
  'Kwena Maphaka':         fs('bowling', [25,28,8.5],     [5,5,8.2],       [5,10,8.37]),
  'Tushar Deshpande':      fs('bowling', [105,110,9.85],  [55,57,9.85],    [null,null,null]),
  'Adam Milne':            fs('bowling', [120,138,8.24],  [8,6,8.24],      [23,36,7.71]),
  'Kuldeep Sen':           fs('bowling', [45,48,9.1],     [20,19,9.1],     [null,null,null]),
  'Sushant Mishra':        fs('bowling', [12,11,9.32],    [null,null,null],[null,null,null]),
  'Yash Raj Punja':        fs('bowling', [8,7,8.76],      [null,null,null],[null,null,null]),
  // RCB bowlers
  'Josh Hazlewood':        fs('bowling', [200,238,7.71],  [33,41,8.14],    [34,53,7.71]),
  'Yash Dayal':            fs('bowling', [105,110,9.38],  [40,45,9.38],    [null,null,null]),
  'Bhuvneshwar Kumar':     fs('bowling', [285,325,7.49],  [181,174,7.25],  [87,90,7.25]),
  'Nuwan Thushara':        fs('bowling', [65,72,8.8],     [8,14,9.02],     [11,17,8.28]),
  'Rasikh Salam':          fs('bowling', [30,30,9.0],     [9,8,9.61],      [null,null,null]),
  'Suyash Sharma':         fs('bowling', [65,72,8.8],     [8,8,8.85],      [null,null,null]),
  'Jacob Duffy':           fs('bowling', [80,88,8.5],     [null,null,null],[5,5,8.6]),
  'Jaydev Unadkat':        fs('bowling', [104,122,8.22],  [84,74,8.32],    [9,10,8.62]),
  // SRH bowlers
  'Pat Cummins':           fs('bowling', [205,255,8.5],   [62,51,8.76],    [51,66,7.44]),
  'Harshal Patel':         fs('bowling', [185,215,9.25],  [101,121,9.25],  [17,17,9.89]),
  'Shivam Mavi':           fs('bowling', [115,122,9.1],   [55,53,9.1],     [3,4,9.72]),
  'Eshan Malinga':         fs('bowling', [5,4,8.94],      [null,null,null],[null,null,null]),
  'Sakib Hussain':         fs('bowling', [6,5,9.12],      [null,null,null],[null,null,null]),
  'Onkar Tarmale':         fs('bowling', [8,7,8.98],      [null,null,null],[null,null,null]),
  'Amit Kumar':            fs('bowling', [35,43,7.84],    [5,5,8.45],      [null,null,null]),
  'Krains Fuletra':        fs('bowling', [5,4,8.50],      [null,null,null],[null,null,null]),
  // Other bowlers
  'Ravichandran Ashwin':   fs('bowling', [329,315,7.10],  [217,185,7.18],  [65,72,6.90]),
  'Shreyas Gopal':         fs('bowling', [104,124,7.48],  [52,52,8.16],    [null,null,null]),

  // ── ALL-ROUNDERS (template: allround — s1=RUNS, s2=WKTS) ─────────────────
  // CSK all-rounders
  'Shivam Dube':           fs('allround', [185,3120,23],  [95,1580,14],    [36,773,3]),
  'Jamie Overton':         fs('allround', [100,1250,75],  [5,55,2],        [null,null,null]),
  'Ramakrishna Ghosh':     fs('allround', [20,210,8],     [5,40,2],        [null,null,null]),
  'Prashant Veer':         fs('allround', [15,120,6],     [5,25,1],        [null,null,null]),
  'Aman Khan':             fs('allround', [15,55,5],      [5,20,2],        [null,null,null]),
  'Zak Foulkes':           fs('allround', [40,320,30],    [null,null,null],[null,null,null]),
  'Matthew Short':         fs('allround', [80,1680,28],   [5,85,2],        [10,195,3]),
  'Anshul Kamboj':         fs('allround', [25,180,18],    [5,35,4],        [null,null,null]),
  'Gurjapneet Singh':      fs('allround', [15,80,8],      [5,20,2],        [null,null,null]),
  // DC all-rounders
  'Axar Patel':            fs('allround', [255,3280,152], [134,1178,100],  [65,524,72]),
  'Madhav Tiwari':         fs('allround', [10,80,4],      [2,15,1],        [null,null,null]),
  'Tripurana Vijay':       fs('allround', [30,280,18],    [5,40,3],        [null,null,null]),
  'Vipraj Nigam':          fs('allround', [20,110,8],     [3,25,2],        [null,null,null]),
  'Ajay Mandal':           fs('allround', [20,150,12],    [3,20,2],        [null,null,null]),
  'Auqib Dar':             fs('allround', [20,160,14],    [3,25,2],        [null,null,null]),
  'Nitish Rana':           fs('allround', [235,4280,22],  [115,2073,18],   [2,1,0]),
  'Rahul Tewatia':         fs('allround', [225,2660,38],  [110,1382,25],   [null,null,null]),
  // GT all-rounders
  'Washington Sundar':     fs('allround', [185,1385,88],  [88,449,76],     [54,234,52]),
  'Jason Holder':          fs('allround', [220,2180,108], [40,385,23],     [85,958,75]),
  'Jayant Yadav':          fs('allround', [135,980,55],   [50,382,32],     [3,10,3]),
  'Nishant Sindhu':        fs('allround', [30,280,18],    [10,145,3],      [null,null,null]),
  'Arshad Khan':           fs('allround', [20,120,12],    [8,45,5],        [null,null,null]),
  'Gurnoor Singh Brar':    fs('allround', [25,180,15],    [6,60,8],        [null,null,null]),
  // KKR all-rounders
  'Sunil Narine':          fs('allround', [555,8950,272], [177,2013,180],  [51,880,52]),
  'Cameron Green':         fs('allround', [115,2120,32],  [45,1178,null],  [36,780,14]),
  'Ramandeep Singh':       fs('allround', [105,1020,20],  [50,482,13],     [null,null,null]),
  'Anukul Roy':            fs('allround', [80,420,42],    [30,124,24],     [null,null,null]),
  'Daksh Kamra':           fs('allround', [6,95,3],       [null,null,null],[null,null,null]),
  'Mitchell Marsh':        fs('allround', [255,4855,75],  [19,440,7],      [72,1541,36]),
  // LSG all-rounders
  'Wanindu Hasaranga':     fs('allround', [225,1980,165], [50,380,60],     [74,645,110]),
  'Shahbaz Ahmed':         fs('allround', [155,1250,65],  [82,549,46],     [null,null,null]),
  'Shahbaz Ahamad':        fs('allround', [155,1250,65],  [82,549,46],     [null,null,null]),
  'Arshin Kulkarni':       fs('allround', [4,52,1],       [null,null,null],[null,null,null]),
  'Ayush Badoni':          fs('allround', [115,1480,8],   [60,732,3],      [null,null,null]),
  'Digvesh Rathi':         fs('allround', [15,85,10],     [3,18,2],        [null,null,null]),
  // MI all-rounders
  'Hardik Pandya':         fs('allround', [291,5432,200], [141,2606,74],   [114,1812,94]),
  'Shardul Thakur':        fs('allround', [205,1880,138], [103,730,103],   [30,179,22]),
  'Corbin Bosch':          fs('allround', [55,620,30],    [5,55,4],        [5,42,5]),
  'Naman Dhir':            fs('allround', [65,1880,24],   [12,232,0],      [null,null,null]),
  'Raj Bawa':              fs('allround', [40,320,18],    [3,11,0],        [null,null,null]),
  'Atharva Ankolekar':     fs('allround', [30,180,22],    [6,28,3],        [null,null,null]),
  'Mayank Rawat':          fs('allround', [6,52,1],       [null,null,null],[null,null,null]),
  // PBKS all-rounders
  'Sam Curran':            fs('allround', [245,2580,118], [52,696,68],     [22,583,62]),
  'Cooper Connolly':       fs('allround', [50,480,12],    [9,84,4],        [15,327,10]),
  'Mitchell Owen':         fs('allround', [40,820,8],     [11,273,2],      [5,158,0]),
  'Musheer Khan':          fs('allround', [20,380,20],    [3,38,0],        [null,null,null]),
  'Brijesh Sharma':        fs('allround', [5,18,4],       [null,null,null],[null,null,null]),
  'Yudhvir Singh Charak':  fs('allround', [8,62,6],       [null,null,null],[null,null,null]),
  // RR all-rounders
  'Ravindra Jadeja':       fs('allround', [355,4520,188], [243,2774,132],  [74,515,54]),
  'Krunal Pandya':         fs('allround', [285,3580,102], [114,1707,66],   [26,269,16]),
  'Romario Shepherd':      fs('allround', [200,2280,142], [45,332,29],     [46,480,49]),
  'Donovan Ferreira':      fs('allround', [20,320,5],     [7,26,0],        [12,185,1]),
  'Swapnil Singh':         fs('allround', [89,988,73],    [14,51,7],       [0,0,0]),
  // RCB all-rounders
  'Venkatesh Iyer':        fs('allround', [165,3180,40],  [80,1535,22],    [12,244,3]),
  'Tim David':             fs('allround', [273,5207,15],  [42,714,null],   [54,1201,5]),
  'Will Jacks':            fs('allround', [206,5144,65],  [12,284,3],      [23,383,1]),
  'Abhishek Sharma':       fs('allround', [205,3980,65],  [59,651,11],     [29,651,11]),
  'Nitish Kumar Reddy':    fs('allround', [60,1180,38],   [25,590,20],     [5,69,2]),
  'Vicky Ostwal':          fs('allround', [60,160,38],    [20,30,20],      [null,null,null]),
  'Vihaan Malhotra':       fs('allround', [5,34,2],       [null,null,null],[null,null,null]),
  'Kanishk Chouhan':       fs('allround', [4,18,3],       [null,null,null],[null,null,null]),
  // SRH all-rounders
  'Kamindu Mendis':        fs('allround', [105,2280,28],  [14,274,2],      [32,617,10]),
  'Jack Edwards':          fs('allround', [40,380,22],    [5,35,6],        [6,121,6]),
  'Brydon Carse':          fs('allround', [57,1014,68],   [null,null,null],[17,108,14]),
  // Other all-rounders
  'Marcus Stoinis':        fs('allround', [310,6449,158], [99,1887,43],    [74,1245,45]),
  'Mitchell Santner':      fs('allround', [218,2374,217], [23,109,16],     [109,725,120]),
  'Marco Jansen':          fs('allround', [102,910,115],  [14,63,12],      [17,166,16]),
  'Suryansh Shedge':       fs('batting',  [10,195,138],   [0,null,null],   [null,null,null]),
  'Aaron Hardie':          fs('allround', [84,1464,41],   [null,null,null],[13,128,10]),
  'Atharva Taide':         fs('allround', [52,1479,11],   [9,247,0],       [null,null,null]),
  'Azmatullah Omarzai':    fs('allround', [121,1292,106], [8,58,4],        [47,474,31]),
  'Jacob Bethell':         fs('allround', [9,195,0],      [null,null,null],[10,196,0]),
  'Karim Janat':           fs('allround', [155,2384,117], [null,null,null],[66,637,42]),
  'Mahipal Lomror':        fs('allround', [107,2137,5],   [40,527,1],      [null,null,null]),
  'Manvanth Kumar':        fs('allround', [100,94,15],    [null,null,null],[17,166,16]),
  'Rajvardhan Hangargekar':fs('allround', [16,28,14],     [2,0,3],         [0,0,0]),
  'Mangesh Yadav':         fs('allround', [19,43,25],     [12,3,12],       [null,null,null]),
  'Harsh Dubey':           fs('allround', [5,22,3],       [null,null,null],[null,null,null]),
  'Shivang Kumar':         fs('allround', [4,14,3],       [null,null,null],[null,null,null]),
  'Zeeshan Ansari':        fs('allround', [6,28,5],       [null,null,null],[null,null,null]),
  'Praful Hinge':          fs('allround', [5,12,4],       [null,null,null],[null,null,null]),
  'Abhinav Manohar':       fs('allround', [44,731,1],     [11,231,0],      [null,null,null]),

  // ── BATSMEN / WICKET-KEEPERS (template: batting — s1=RUNS, s2=SR) ─────────
  // Batsmen (from image)
  'Ruturaj Gaikwad':       fs('batting', [175,5400,136.2],  [108,3590,135.3], [29,849,138.1]),
  'Ayush Mhatre':          fs('batting', [30,680,138.5],    [5,95,132],       [null,null,null]),
  'Dewald Brevis':         fs('batting', [80,1820,143.8],   [22,370,138.7],   [15,348,144]),
  'Sarfaraz Khan':         fs('batting', [105,2340,129],    [26,480,130.2],   [null,null,null]),
  'Karun Nair':            fs('batting', [215,5200,128.5],  [35,622,131.4],   [2,6,75]),
  'Prithvi Shaw':          fs('batting', [200,5580,147.6],  [97,2133,147.6],  [1,0,null]),
  'Sameer Rizvi':          fs('batting', [35,750,143],      [8,122,140.5],    [null,null,null]),
  'Ashutosh Sharma':       fs('batting', [60,1150,148],     [12,215,152.3],   [null,null,null]),
  'Pathum Nissanka':       fs('batting', [115,3200,139.5],  [18,383,138.7],   [60,1598,138.2]),
  'Sahil Parakh':          fs('batting', [20,380,131],      [3,45,128],       [null,null,null]),
  'David Miller':          fs('batting', [490,9870,141.2],  [240,4420,141],   [99,2256,148.2]),
  'Shubman Gill':          fs('batting', [205,6120,139],    [94,3019,138.9],  [67,2057,146.5]),
  'Sai Sudharsan':         fs('batting', [110,3250,133.5],  [50,1453,132.8],  [20,490,138.6]),
  'Shahrukh Khan':         fs('batting', [115,1620,157.3],  [60,756,155],     [null,null,null]),
  'Rinku Singh':           fs('batting', [150,3060,149],    [70,1441,149.2],  [20,330,152]),
  'Angkrish Raghuvanshi':  fs('batting', [20,420,138],      [5,82,135],       [null,null,null]),
  'Ajinkya Rahane':        fs('batting', [345,7620,126.5],  [172,4345,126.1], [20,375,118.5]),
  'Manish Pandey':         fs('batting', [325,6750,122.8],  [188,3894,122.5], [37,580,120.3]),
  'Rovman Powell':         fs('batting', [250,4650,156.5],  [50,782,149.8],   [96,2245,156]),
  'Aiden Markram':         fs('batting', [185,4850,138],    [50,1085,143],    [52,1249,138.3]),
  'Himmat Singh':          fs('batting', [55,1050,133],     [15,205,130],     [null,null,null]),
  'Matthew Breetzke':      fs('batting', [30,680,136],      [0,null,null],    [10,230,133]),
  'Akshat Raghuwanshi':    fs('batting', [15,290,135],      [2,28,130],       [null,null,null]),
  'Abdul Samad':           fs('batting', [120,1890,152],    [80,952,153],     [null,null,null]),
  'Rohit Sharma':          fs('batting', [500,11850,130.4], [259,5628,130.4], [159,4231,140.9]),
  'Suryakumar Yadav':      fs('batting', [400,8620,146.7],  [198,3748,146.7], [78,2356,170.2]),
  'Tilak Varma':           fs('batting', [120,3180,145],    [65,1710,144.8],  [30,715,154.2]),
  'Sherfane Rutherford':   fs('batting', [180,2960,150],    [20,348,149.5],   [60,900,149]),
  'Danish Malewar':        fs('batting', [10,185,132],      [2,22,128],       [null,null,null]),
  'Shreyas Iyer':          fs('batting', [220,5680,129.3],  [120,3393,129.3], [39,808,131]),
  'Shashank Singh':        fs('batting', [105,1680,163],    [50,763,163.4],   [null,null,null]),
  'Priyansh Arya':         fs('batting', [40,950,171],      [12,335,174.5],   [null,null,null]),
  'Pyla Avinash':          fs('batting', [15,260,129],      [2,18,120],       [null,null,null]),
  'Harnoor Singh':         fs('batting', [20,410,133],      [0,null,null],    [null,null,null]),
  'Yashasvi Jaiswal':      fs('batting', [120,3950,163],    [58,2297,163],    [31,1112,154]),
  'Shimron Hetmyer':       fs('batting', [270,5230,143],    [97,2005,145],    [91,1931,143.5]),
  'Shubham Dubey':         fs('batting', [70,1200,138],     [30,502,136.5],   [null,null,null]),
  'Vaibhav Suryavanshi':   fs('batting', [10,220,162],      [5,105,158],      [null,null,null]),
  'Aman Rao':              fs('batting', [10,180,128],      [2,25,125],       [null,null,null]),
  'Virat Kohli':           fs('batting', [450,13200,130.1], [257,8004,130.1], [125,4188,137]),
  'Rajat Patidar':         fs('batting', [100,2680,146],    [55,1215,146.2],  [null,null,null]),
  'Devdutt Padikkal':      fs('batting', [155,3950,131],    [90,1993,131.5],  [5,68,127]),
  'Travis Head':           fs('batting', [205,5780,173],    [31,1069,176.6],  [42,1269,147.5]),
  'Aniket Verma':          fs('batting', [20,430,141],      [5,95,138],       [null,null,null]),
  'Smaran Ravichandran':   fs('batting', [15,310,135],      [2,30,120],       [null,null,null]),
  // Wicket-keepers (from image)
  'Sanju Samson':          fs('batting', [330,7950,141.9],  [176,4843,141.9], [43,1099,140]),
  'MS Dhoni':              fs('batting', [383,8730,136.7],  [264,5243,136.7], [98,1617,126.1]),
  'Urvil Patel':           fs('batting', [25,620,162],      [5,108,158],      [null,null,null]),
  'KL Rahul':              fs('batting', [285,7280,135.3],  [132,4683,135.3], [71,2265,139.1]),
  'Tristan Stubbs':        fs('batting', [80,1620,153],     [25,443,153],     [18,393,155]),
  'Abishek Porel':         fs('batting', [40,990,159.5],    [21,427,154.7],   [null,null,null]),
  'Ben Duckett':           fs('batting', [185,4280,141],    [5,120,138],      [16,347,143]),
  'Jos Buttler':           fs('batting', [385,10820,144.7], [107,3582,149.2], [111,3227,144.7]),
  'Kumar Kushagra':        fs('batting', [30,620,143],      [10,122,140],     [null,null,null]),
  'Anuj Rawat':            fs('batting', [90,1680,143],     [40,682,143],     [null,null,null]),
  'Tom Banton':            fs('batting', [205,4350,137],    [5,78,132],       [15,247,137]),
  'Finn Allen':            fs('batting', [165,3980,163],    [25,562,163],     [20,609,164.9]),
  'Tejasvi Singh':         fs('batting', [20,380,138],      [5,82,135],       [null,null,null]),
  'Rishabh Pant':          fs('batting', [285,6250,149.2],  [118,3284,149.2], [66,1779,126.6]),
  'Nicholas Pooran':       fs('batting', [365,7850,154],    [82,1801,151.4],  [93,2379,154]),
  'Josh Inglis':           fs('batting', [130,2980,143.5],  [10,203,140],     [34,776,143.5]),
  'Mukul Choudhary':       fs('batting', [10,185,138],      [2,28,130],       [null,null,null]),
  'Quinton de Kock':       fs('batting', [385,8970,137.8],  [113,3237,136.5], [83,2360,137.8]),
  'Ryan Rickelton':        fs('batting', [95,2280,137],     [5,125,134],      [9,205,137]),
  'Robin Minz':            fs('batting', [20,380,143],      [5,78,140],       [null,null,null]),
  'Mohammad Izhar':        fs('batting', [10,165,132],      [2,22,128],       [null,null,null]),
  'Prabhsimran Singh':     fs('batting', [105,2480,148],    [55,1205,148],    [null,null,null]),
  'Vishnu Vinod':          fs('batting', [30,560,138],      [10,165,135],     [null,null,null]),
  'Lhuan-dre Pretorius':   fs('batting', [20,380,148],      [5,88,145],       [5,105,148]),
  'Dhruv Jurel':           fs('batting', [70,1380,143],     [25,423,143],     [5,85,130]),
  'Ravi Singh':            fs('batting', [10,175,130],      [3,35,128],       [null,null,null]),
  'Jitesh Sharma':         fs('batting', [145,2820,158],    [75,1182,158],    [null,null,null]),
  'Phil Salt':             fs('batting', [285,7180,162.5],  [40,882,161],     [44,1427,162.5]),
  'Jordan Cox':            fs('batting', [85,1680,138],     [5,92,135],       [5,68,138]),
  'Heinrich Klaasen':      fs('batting', [315,7280,154],    [86,2081,155.2],  [65,1660,154]),
  'Ishan Kishan':          fs('batting', [255,5850,136],    [125,3080,136],   [32,757,138]),
  'Salil Arora':           fs('batting', [10,175,130],      [2,28,125],       [null,null,null]),
  // Remaining batting entries
  'Riyan Parag':           fs('batting', [127,2831,144.36], [74,1282,136.67], [9,106,151.42]),
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
