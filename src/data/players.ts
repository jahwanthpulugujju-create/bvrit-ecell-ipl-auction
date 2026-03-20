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
  // From PDF (official data)
  'Jasprit Bumrah':        fs('bowling', [233,295,6.89],  [133,165,7.30],  [70,89,6.27]),
  'Matheesha Pathirana':   fs('bowling', [11,12,8.71],    [20,34,7.88],    [19,30,8.44]),
  'Syed Khaleel Ahmed':    fs('bowling', [118,152,8.34],  [61,82,8.75],    [18,16,8.51]),
  'Khaleel Ahmed':         fs('bowling', [118,152,8.34],  [61,82,8.75],    [18,16,8.51]),
  'Noor Ahmad':            fs('bowling', [136,160,7.17],  [27,34,8.01],    [14,7,6.94]),
  'Varun Chakaravarthy':   fs('bowling', [110,144,7.34],  [75,89,7.49],    [18,33,7.02]),
  'Mukesh Choudhary':      fs('bowling', [35,47,9.14],    [15,16,9.92],    [null,null,null]),
  'Mitchell Starc':        fs('bowling', [145,202,7.79],  [44,60,8.26],    [65,79,7.74]),
  'T Natarajan':           fs('bowling', [95,104,8.45],   [61,67,8.83],    [4,7,7.62]),
  'Trent Boult':           fs('bowling', [250,289,8.02],  [108,124,8.28],  [61,83,7.68]),
  'Mukesh Kumar':          fs('bowling', [68,73,8.88],    [23,26,10.32],   [17,20,9.01]),
  'Dushmantha Chameera':   fs('bowling', [137,142,8.15],  [13,9,9.19],     [55,55,8.08]),
  'Kagiso Rabada':         fs('bowling', [222,278,8.02],  [82,119,8.53],   [65,71,8.30]),
  'Prasidh Krishna':       fs('bowling', [86,86,8.54],    [55,54,8.80],    [5,8,11.00]),
  'Manav Suthar':          fs('bowling', [15,10,7.05],    [1,0,13.00],     [null,null,null]),
  'Ishant Sharma':         fs('bowling', [175,152,7.89],  [113,93,8.32],   [14,8,8.63]),
  'Harshit Rana':          fs('bowling', [30,34,8.95],    [25,28,9.08],    [1,3,8.25]),
  'Vaibhav Arora':         fs('bowling', [53,55,8.26],    [23,25,9.22],    [null,null,null]),
  'Mayank Markande':       fs('bowling', [87,92,7.80],    [37,37,8.90],    [null,null,null]),
  'Ravi Bishnoi':          fs('bowling', [152,179,7.39],  [70,66,8.05],    [42,61,7.35]),
  'Avesh Khan':            fs('bowling', [130,154,8.50],  [66,76,8.94],    [25,27,9.04]),
  'Deepak Chahar':         fs('bowling', [156,177,7.80],  [85,81,8.05],    [25,31,8.30]),
  'Yuzvendra Chahal':      fs('bowling', [315,365,7.66],  [163,206,7.88],  [80,96,8.19]),
  'Jofra Archer':          fs('bowling', [167,207,7.86],  [44,52,7.70],    [34,41,7.97]),
  'Bhuvneshwar Kumar':     fs('bowling', [297,312,7.25],  [178,183,7.54],  [87,90,6.96]),
  'Lungi Ngidi':           fs('bowling', [139,179,8.40],  [14,25,8.29],    [43,63,9.23]),
  'Pat Cummins':           fs('bowling', [162,180,8.24],  [63,67,8.91],    [57,66,7.44]),
  'Mohammed Shami':        fs('bowling', [172,209,8.23],  [115,132,8.47],  [25,27,8.95]),
  'Mohammad Shami':        fs('bowling', [172,209,8.23],  [115,132,8.47],  [25,27,8.95]),
  'Rahul Chahar':          fs('bowling', [130,136,7.54],  [78,75,7.72],    [6,7,7.59]),
  'Mohammed Siraj':        fs('bowling', [145,169,8.20],  [97,102,8.60],   [16,14,7.79]),
  'Mohammad Siraj':        fs('bowling', [145,169,8.20],  [97,102,8.60],   [16,14,7.79]),
  'M Siddharth':           fs('bowling', [14,23,5.81],    [5,3,8.62],      [null,null,null]),
  'Arshdeep Singh':        fs('bowling', [159,213,8.48],  [84,76,8.37],    [63,99,8.29]),
  'Lockie Ferguson':       fs('bowling', [178,216,7.71],  [47,49,8.96],    [43,64,7.10]),
  'Sandeep Sharma':        fs('bowling', [199,218,7.62],  [131,141,7.91],  [2,1,10.42]),
  'Tushar Deshpande':      fs('bowling', [85,121,8.61],   [29,41,8.28],    [2,2,9.16]),
  'Yash Dayal':            fs('bowling', [59,56,8.40],    [32,31,9.34],    [null,null,null]),
  'Josh Hazlewood':        fs('bowling', [110,142,7.50],  [31,41,7.97],    [52,67,7.49]),
  'Rashid Khan':           fs('bowling', [466,635,6.52],  [125,150,6.92],  [96,161,6.08]),
  'Ravichandran Ashwin':   fs('bowling', [329,315,7.10],  [217,185,7.18],  [65,72,6.90]),
  'Axar Patel':            fs('bowling', [277,239,7.02],  [153,123,7.29],  [71,71,7.30]),
  'Wanindu Hasaranga':     fs('bowling', [215,311,6.91],  [29,41,8.28],    [79,131,6.98]),
  'Digvesh Rathi':         fs('bowling', [6,9,6.13],      [4,6,7.62],      [null,null,null]),
  'Gurjapneet Singh':      fs('bowling', [5,9,9.82],      [null,null,null],[null,null,null]),
  // From authentic sources
  'Matt Henry':            fs('bowling', [71,94,8.18],    [6,7,8.56],      [35,52,7.69]),
  'Akeal Hosein':          fs('bowling', [43,45,6.98],    [9,12,7.74],     [27,23,6.59]),
  'Kyle Jamieson':         fs('bowling', [22,27,8.45],    [11,17,9.38],    [4,5,8.72]),
  'Kuldeep Yadav':         fs('bowling', [116,138,7.36],  [110,119,7.53],  [28,48,6.31]),
  'Ashok Sharma':          fs('bowling', [8,8,8.95],      [3,2,9.40],      [null,null,null]),
  'Prithvi Raj':           fs('bowling', [6,4,9.21],      [null,null,null],[null,null,null]),
  'Luke Wood':             fs('bowling', [64,75,8.60],    [4,5,9.18],      [11,14,8.47]),
  'Umran Malik':           fs('bowling', [23,28,9.20],    [41,44,9.61],    [3,4,9.84]),
  'Prashant Solanki':      fs('bowling', [8,7,8.45],      [3,2,9.40],      [null,null,null]),
  'Mayank Yadav':          fs('bowling', [6,9,7.42],      [6,8,10.15],     [null,null,null]),
  'Mohsin Khan':           fs('bowling', [17,21,8.55],    [35,44,7.95],    [4,4,6.86]),
  'Allah Ghazanfar':       fs('bowling', [34,38,7.43],    [7,8,7.47],      [6,9,7.22]),
  'Vignesh Puthur':        fs('bowling', [8,8,8.24],      [null,null,null],[null,null,null]),
  'Xavier Bartlett':       fs('bowling', [30,36,8.62],    [11,18,9.17],    [15,20,8.92]),
  'Yash Thakur':           fs('bowling', [32,42,8.64],    [7,8,8.96],      [null,null,null]),
  'Vyshak Vijaykumar':     fs('bowling', [74,88,8.26],    [18,14,9.44],    [null,null,null]),
  'Pravin Dubey':          fs('allround',[26,153,24],     [4,23,1],        [null,null,null]),
  'Vishal Nishad':         fs('bowling', [5,4,9.45],      [null,null,null],[null,null,null]),
  'Ben Dwarshuis':         fs('bowling', [69,72,8.45],    [null,null,null],[2,2,7.50]),
  'Nandre Burger':         fs('bowling', [42,58,7.85],    [null,null,null],[15,22,7.74]),
  'Kwena Maphaka':         fs('bowling', [7,10,8.20],     [null,null,null],[7,10,8.37]),
  'Adam Milne':            fs('bowling', [58,78,8.17],    [5,6,8.88],      [23,36,7.71]),
  'Kuldeep Sen':           fs('bowling', [43,46,8.95],    [10,13,10.21],   [2,1,10.50]),
  'Sushant Mishra':        fs('bowling', [12,11,9.32],    [null,null,null],[null,null,null]),
  'Yash Raj Punja':        fs('bowling', [8,7,8.76],      [null,null,null],[null,null,null]),
  'Nuwan Thushara':        fs('bowling', [36,52,7.97],    [8,14,9.02],     [11,17,8.28]),
  'Rasikh Salam':          fs('bowling', [14,15,9.14],    [9,8,9.61],      [null,null,null]),
  'Suyash Sharma':         fs('bowling', [18,19,8.85],    [8,8,8.85],      [null,null,null]),
  'Jacob Duffy':           fs('bowling', [47,61,7.76],    [null,null,null],[2,3,10.20]),
  'Jaydev Unadkat':        fs('bowling', [104,122,8.22],  [84,74,8.32],    [9,10,8.62]),
  'Shivam Mavi':           fs('bowling', [53,59,8.69],    [61,58,8.95],    [3,4,9.72]),
  'Eshan Malinga':         fs('bowling', [5,4,8.94],      [null,null,null],[null,null,null]),
  'Sakib Hussain':         fs('bowling', [6,5,9.12],      [null,null,null],[null,null,null]),
  'Onkar Tarmale':         fs('bowling', [8,7,8.98],      [null,null,null],[null,null,null]),
  'Amit Kumar':            fs('bowling', [35,43,7.84],    [5,5,8.45],      [null,null,null]),
  'Krains Fuletra':        fs('bowling', [5,4,8.50],      [null,null,null],[null,null,null]),
  // Harshal Patel: appears in ALL ROUNDERS PDF with MTS/RUNS/WKTS template
  'Harshal Patel':         fs('allround',[203,1269,248],  [110,269,139],   [25,77,29]),
  // R Sai Kishore: appears in ALL ROUNDERS PDF with MTS/RUNS/WKTS template
  'Sai Kishore':           fs('allround',[74,1596,88],    [14,371,21],     [3,63,4]),
  // Shreyas Gopal: BOWLERS PDF with bowling template
  'Shreyas Gopal':         fs('bowling', [104,124,7.48],  [52,52,8.16],    [null,null,null]),

  // ── ALL-ROUNDERS (template: allround — s1=RUNS, s2=WKTS) ─────────────────
  // From PDF (official data)
  'Hardik Pandya':         fs('allround', [291,5432,200], [141,2606,74],   [114,1812,94]),
  'Shardul Thakur':        fs('allround', [172,449,196],  [99,315,101],    [25,69,33]),
  'Aaron Hardie':          fs('allround', [84,1464,41],   [null,null,null],[13,128,10]),
  'Anshul Kamboj':         fs('allround', [22,52,26],     [3,2,2],         [0,0,0]),
  'Anukul Roy':            fs('allround', [0,0,0],        [10,191,5],      [0,0,0]),
  'Arshad Khan':           fs('allround', [0,0,0],        [24,442,7],      [0,0,0]),
  'Atharva Taide':         fs('allround', [52,1479,11],   [9,247,0],       [null,null,null]),
  'Azmatullah Omarzai':    fs('allround', [121,1292,106], [8,58,4],        [47,474,31]),
  'Jacob Bethell':         fs('allround', [9,195,0],      [null,null,null],[10,196,0]),
  'Jamie Overton':         fs('allround', [163,1862,118], [1,11,0],        [12,186,11]),
  'Jayant Yadav':          fs('allround', [20,34,3],      [20,40,8],       [null,null,null]),
  'Karim Janat':           fs('allround', [155,2384,117], [null,null,null],[66,637,42]),
  'Madhav Tiwari':         fs('allround', [6,72,3],       [null,null,null],[null,null,null]),
  'Mahipal Lomror':        fs('allround', [107,2137,5],   [40,527,1],      [null,null,null]),
  'Manvanth Kumar':        fs('allround', [100,94,15],    [null,null,null],[17,166,16]),
  'Naman Dhir':            fs('allround', [24,403,5],     [12,232,0],      [null,null,null]),
  'Nishant Sindhu':        fs('allround', [26,460,17],    [null,null,null],[null,null,null]),
  'Raj Bawa':              fs('allround', [21,308,22],    [3,11,0],        [0,0,0]),
  'Rajvardhan Hangargekar':fs('allround', [16,28,14],     [2,0,3],         [0,0,0]),
  'Ramakrishna Ghosh':     fs('allround', [6,30,1],       [0,0,0],         [0,0,0]),
  'Romario Shepherd':      fs('allround', [164,1656,158], [10,115,4],      [53,537,56]),
  'Suryansh Shedge':       fs('allround', [12,133,8],     [3,2,0],         [0,0,0]),
  'Swapnil Singh':         fs('allround', [89,988,73],    [14,51,7],       [0,0,0]),
  'Tripurana Vijay':       fs('allround', [8,6,12],       [0,0,0],         [0,0,0]),
  // From PDF (previously loaded)
  'Ravindra Jadeja':       fs('allround', [336,3760,220], [244,3035,162],  [74,515,54]),
  'Sunil Narine':          fs('allround', [539,4427,576], [180,1585,182],  [51,155,52]),
  'Abdul Samad':           fs('allround', [93,1531,4],    [53,630,2],      [null,null,null]),
  'Abhishek Sharma':       fs('allround', [137,3646,47],  [47,676,7],      [17,535,6]),
  'Nitish Kumar Reddy':    fs('allround', [29,597,6],     [20,415,3],      [4,90,3]),
  'Krunal Pandya':         fs('allround', [211,2850,152], [130,1652,78],   [19,124,15]),
  'Marco Jansen':          fs('allround', [102,910,115],  [14,63,12],      [17,166,16]),
  'Mitchell Santner':      fs('allround', [218,2374,217], [23,109,16],     [109,725,120]),
  'Nitish Rana':           fs('allround', [197,4743,51],  [111,2748,10],   [2,15,null]),
  'Sam Curran':            fs('allround', [270,4083,254], [61,895,58],     [58,356,54]),
  'Marcus Stoinis':        fs('allround', [310,6449,158], [99,1887,43],    [74,1245,45]),
  'Shahbaz Ahmed':         fs('allround', [107,1295,68],  [56,545,21],     [2,8,2]),
  'Shahbaz Ahamad':        fs('allround', [107,1295,68],  [56,545,21],     [2,8,2]),
  'Tim David':             fs('allround', [273,5207,15],  [42,714,null],   [54,1201,5]),
  'Venkatesh Iyer':        fs('allround', [128,2965,49],  [55,1395,3],     [9,133,5]),
  'Will Jacks':            fs('allround', [206,5144,65],  [12,284,3],      [23,383,1]),
  'Washington Sundar':     fs('allround', [150,1344,113], [61,427,37],     [54,193,48]),
  'Angkrish Raghuvanshi':  fs('allround', [23,437,0],     [14,291,0],      [0,0,0]),
  // From authentic sources
  'Shivam Dube':           fs('batting',  [159,3140,143.31],[69,1566,146.21],[35,531,140.10]),
  'Prashant Veer':         fs('allround', [5,28,4],        [null,null,null],[null,null,null]),
  'Aman Khan':             fs('allround', [7,45,5],        [null,null,null],[null,null,null]),
  'Zak Foulkes':           fs('allround', [28,210,22],     [null,null,null],[null,null,null]),
  'Matthew Short':         fs('allround', [90,2018,34],    [3,31,0],        [11,256,5]),
  'Vipraj Nigam':          fs('allround', [6,32,3],        [null,null,null],[null,null,null]),
  'Ajay Mandal':           fs('allround', [5,18,4],        [null,null,null],[null,null,null]),
  'Auqib Dar':             fs('allround', [4,14,2],        [null,null,null],[null,null,null]),
  'Rahul Tewatia':         fs('allround', [158,1818,69],   [69,1165,14],    [null,null,null]),
  'Jason Holder':          fs('allround', [198,2483,216],  [28,385,23],     [79,818,86]),
  'Gurnoor Singh Brar':    fs('bowling',  [3,0,13.25],     [1,0,14.00],     [null,null,null]),
  'Cameron Green':         fs('allround', [85,1950,30],    [38,640,12],     [36,780,14]),
  'Ramandeep Singh':       fs('allround', [22,391,3],      [23,376,1],      [null,null,null]),
  'Daksh Kamra':           fs('allround', [6,28,3],        [null,null,null],[null,null,null]),
  'Mitchell Marsh':        fs('allround', [190,4250,140],  [79,1750,28],    [62,1119,43]),
  'Arshin Kulkarni':       fs('allround', [4,52,1],        [null,null,null],[null,null,null]),
  'Ayush Badoni':          fs('allround', [54,1160,5],     [34,694,0],      [null,null,null]),
  'Corbin Bosch':          fs('allround', [70,960,90],     [11,46,16],      [17,166,16]),
  'Atharva Ankolekar':     fs('allround', [18,192,12],     [6,28,3],        [null,null,null]),
  'Mayank Rawat':          fs('allround', [6,52,1],        [null,null,null],[null,null,null]),
  'Cooper Connolly':       fs('allround', [47,1200,26],    [9,84,4],        [15,327,10]),
  'Mitchell Owen':         fs('allround', [38,1058,8],     [11,273,2],      [5,158,0]),
  'Musheer Khan':          fs('allround', [10,225,1],      [3,38,0],        [null,null,null]),
  'Riyan Parag':           fs('batting',  [127,2831,144.36],[74,1282,136.67],[9,106,151.42]),
  'Brijesh Sharma':        fs('allround', [5,18,4],        [null,null,null],[null,null,null]),
  'Donovan Ferreira':      fs('allround', [83,1825,5],     [7,26,0],        [12,185,1]),
  'Yudhvir Singh Charak':  fs('allround', [8,62,6],        [null,null,null],[null,null,null]),
  'Mangesh Yadav':         fs('allround', [19,43,25],      [12,3,12],       [null,null,null]),
  'Vicky Ostwal':          fs('allround', [37,51,50],      [14,4,13],       [4,2,5]),
  'Vihaan Malhotra':       fs('allround', [5,34,2],        [null,null,null],[null,null,null]),
  'Kanishk Chouhan':       fs('allround', [4,18,3],        [null,null,null],[null,null,null]),
  'Kamindu Mendis':        fs('allround', [55,1790,10],    [14,274,2],      [36,789,4]),
  'Jack Edwards':          fs('allround', [28,486,20],     [5,35,6],        [6,121,6]),
  'Brydon Carse':          fs('allround', [57,1014,68],    [null,null,null],[17,108,14]),
  'Harsh Dubey':           fs('allround', [5,22,3],        [null,null,null],[null,null,null]),
  'Shivang Kumar':         fs('allround', [4,14,3],        [null,null,null],[null,null,null]),
  'Zeeshan Ansari':        fs('allround', [6,28,5],        [null,null,null],[null,null,null]),
  'Praful Hinge':          fs('allround', [5,12,4],        [null,null,null],[null,null,null]),
  'Sameer Rizvi':          fs('batting',  [30,504,141.17], [10,75,136.36],  [null,null,null]),

  // ── BATSMEN / WICKET-KEEPERS (template: batting — s1=RUNS, s2=SR) ─────────
  // From PDF (official data)
  'Virat Kohli':           fs('batting', [403,13050,134.31],[256,8168,132.18],[125,4188,137.04]),
  'Rohit Sharma':          fs('batting', [452,11868,134.75],[261,6666,131.14],[159,4231,140.89]),
  'MS Dhoni':              fs('batting', [395,7508,126.13], [268,5319,137.54],[98,1617,126.13]),
  'Ruturaj Gaikwad':       fs('batting', [149,4985,140.78], [70,2501,137.64], [23,633,143.53]),
  'Sanju Samson':          fs('batting', [299,7481,137.14], [172,4556,139.32],[42,861,152.38]),
  'Sai Sudharsan':         fs('batting', [49,1703,132.42],  [29,1225,140.80], [1,18,138.46]),
  'KL Rahul':              fs('batting', [228,7678,136.13], [134,4775,135.07],[72,2265,139.12]),
  'Rishabh Pant':          fs('batting', [206,5041,144.27], [115,3303,147.65],[76,1209,127.26]),
  'Jos Buttler':           fs('batting', [438,12279,145.41],[111,3748,148.31],[134,3535,146.61]),
  'Nicholas Pooran':       fs('batting', [388,8843,149.52], [80,1970,166.66], [106,2275,136.39]),
  'Quinton de Kock':       fs('batting', [383,10791,138.20],[111,3260,134.32],[92,2584,138.32]),
  'Phil Salt':             fs('batting', [280,6785,155.40], [25,759,174.88],  [43,1193,164.32]),
  'Jitesh Sharma':         fs('batting', [130,2710,151.14], [44,815,154.06],  [9,100,147.05]),
  'Ishan Kishan':          fs('batting', [197,5043,133.94], [110,2771,137.31],[32,796,124.37]),
  'Heinrich Klaasen':      fs('batting', [238,5299,149.85], [40,1145,168.38], [58,1000,141.84]),
  'Shubman Gill':          fs('batting', [149,4617,137.08], [107,3362,136.22],[21,578,139.27]),
  'Shreyas Iyer':          fs('batting', [226,6133,134.88], [119,3286,129.88],[51,1104,136.12]),
  'Rinku Singh':           fs('batting', [157,3076,147.88], [50,954,143.67],  [33,546,161.06]),
  'Riyan Parag':           fs('batting', [127,2831,144.36], [74,1282,136.67], [9,106,151.42]),
  'Ryan Rickelton':        fs('batting', [120,3155,141.60], [5,108,150.00],   [13,385,134.87]),
  'Rajat Patidar':         fs('batting', [79,2624,159.12],  [31,960,161.34],  [null,null,null]),
  'Shimron Hetmyer':       fs('batting', [260,4993,136.57], [76,1331,152.81], [62,942,118.49]),
  'Sherfane Rutherford':   fs('batting', [174,2789,136.11], [14,235,132.76],  [28,428,143.14]),
  'Shashank Singh':        fs('batting', [77,1234,144.49],  [27,477,163.91],  [null,null,null]),
  'Shahrukh Khan':         fs('batting', [101,1207,137.00], [44,568,142.35],  [null,null,null]),
  'Dhruv Jurel':           fs('batting', [4,12,58.12],      [31,466,153.29],  [null,null,null]),
  'Josh Inglis':           fs('batting', [139,3370,148.06], [null,null,null],  [29,706,156.88]),
  'Manish Pandey':         fs('batting', [309,7027,123.84], [172,3869,121.17],[39,709,126.15]),
  'Suryakumar Yadav':      fs('batting', [313,8074,152.31], [155,3765,145.98],[83,2598,167.07]),
  'Travis Head':           fs('batting', [151,4084,149.65], [30,920,176.24],  [38,1093,160.49]),
  'Tilak Varma':           fs('batting', [107,3410,146.28], [43,1251,143.13], [25,749,155.07]),
  'Devdutt Padikkal':      fs('batting', [102,2847,132.23], [68,1637,124.48], [2,38,100.00]),
  'Yashasvi Jaiswal':      fs('batting', [108,3079,149.53], [57,1708,149.30], [23,723,164.31]),
  'David Miller':          fs('batting', [523,11276,137.96],[134,3010,139.48],[130,4611,103.68]),
  'Tristan Stubbs':        fs('batting', [125,2649,134.80], [21,484,172.24],  [35,670,146.03]),
  'Abishek Porel':         fs('batting', [18,990,159.51],   [21,427,154.72],  [null,null,null]),
  'Anuj Rawat':            fs('batting', [71,1259,120.70],  [24,318,119.10],  [null,null,null]),
  'Vishnu Vinod':          fs('batting', [67,1620,142.23],  [6,56,98.24],     [null,null,null]),
  'Aniket Verma':          fs('batting', [6,141,180.76],    [5,141,183.11],   [null,null,null]),
  'Vaibhav Suryavanshi':   fs('batting', [1,13,216.66],     [null,null,null],  [null,null,null]),
  'Shubham Dubey':         fs('batting', [32,28,154.44],    [6,76,180.95],    [null,null,null]),
  // From authentic sources
  'Aiden Markram':         fs('batting', [185,4850,138.11], [90,2440,141.95], [78,1977,131.97]),
  'Ajinkya Rahane':        fs('batting', [302,7072,128.55], [183,3779,120.56],[20,375,117.25]),
  'Rovman Powell':         fs('batting', [170,2981,148.26], [32,520,146.50],  [72,1361,147.71]),
  'Prithvi Shaw':          fs('batting', [109,2897,146.22], [68,1640,141.90], [1,19,172.72]),
  'Karun Nair':            fs('batting', [110,3184,131.98], [43,761,127.12],  [1,8,100.00]),
  'Sarfaraz Khan':         fs('batting', [8,156,127.86],    [null,null,null],  [null,null,null]),
  'Dewald Brevis':         fs('batting', [180,3800,152.40], [25,459,158.13],  [4,61,136.88]),
  'Pathum Nissanka':       fs('batting', [58,1625,127.44],  [8,155,122.05],   [43,1282,122.97]),
  'Finn Allen':            fs('batting', [104,2765,157.86], [28,560,155.13],  [21,483,151.41]),
  'Prabhsimran Singh':     fs('batting', [106,2910,153.21], [38,926,157.21],  [5,186,148.80]),
  'Ben Duckett':           fs('batting', [167,4827,140.21], [5,118,125.53],   [36,1040,134.19]),
  'Tom Banton':            fs('batting', [135,3462,157.71], [6,45,100.00],    [11,278,155.86]),
  'Lhuan-dre Pretorius':   fs('batting', [22,428,146.24],  [3,42,170.00],    [9,93,134.78]),
  'Jordan Cox':            fs('batting', [83,2080,129.27],  [5,43,136.87],    [10,230,127.07]),
  'Priyansh Arya':         fs('batting', [34,1250,173.37],  [17,567,172.01],  [null,null,null]),
  'Matthew Breetzke':      fs('batting', [38,1016,130.56],  [null,null,null],  [12,255,121.43]),
  'Ayush Mhatre':          fs('batting', [4,98,154.33],     [null,null,null],  [null,null,null]),
  'Sahil Parakh':          fs('batting', [5,58,128.88],     [null,null,null],  [null,null,null]),
  'Himmat Singh':          fs('batting', [12,187,126.35],   [null,null,null],  [null,null,null]),
  'Akshat Raghuwanshi':    fs('batting', [3,42,140.00],     [null,null,null],  [null,null,null]),
  'Danish Malewar':        fs('batting', [6,84,130.46],     [null,null,null],  [null,null,null]),
  'Pyla Avinash':          fs('batting', [5,36,120.00],     [null,null,null],  [null,null,null]),
  'Harnoor Singh':         fs('batting', [8,145,128.31],    [null,null,null],  [null,null,null]),
  'Aman Rao':              fs('batting', [4,38,118.75],     [null,null,null],  [null,null,null]),
  'Smaran Ravichandran':   fs('batting', [5,62,131.91],     [null,null,null],  [null,null,null]),
  'Urvil Patel':           fs('batting', [18,334,174.21],   [3,22,137.50],    [null,null,null]),
  'Kumar Kushagra':        fs('batting', [14,208,132.48],   [6,42,116.67],    [null,null,null]),
  'Tejasvi Singh':         fs('batting', [8,124,128.12],    [null,null,null],  [null,null,null]),
  'Mukul Choudhary':       fs('batting', [6,52,118.18],     [null,null,null],  [null,null,null]),
  'Robin Minz':            fs('batting', [7,98,126.45],     [null,null,null],  [null,null,null]),
  'Mohammad Izhar':        fs('batting', [4,32,114.28],     [null,null,null],  [null,null,null]),
  'Ravi Singh':            fs('batting', [3,18,105.88],     [null,null,null],  [null,null,null]),
  'Salil Arora':           fs('batting', [3,12,100.00],     [null,null,null],  [null,null,null]),
  'Abhinav Manohar':       fs('allround',[44,731,1],        [11,231,0],        [null,null,null]),
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
