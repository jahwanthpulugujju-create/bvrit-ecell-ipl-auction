export type PlayerRole = 'batsman' | 'fast-bowler' | 'spinner' | 'wicket-keeper' | 'all-rounder';
export type PlayerCategory = 'marquee' | 'premium' | 'mid-tier' | 'budget';
export type PlayerStatus = 'available' | 'retained' | 'live' | 'sold' | 'unsold';

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  category: PlayerCategory;
  nationality: 'indian' | 'overseas';
  basePrice: number; // in lakhs
  batting: number;
  bowling: number;
  fielding: number;
  rating: number;
  matches: number;
  runs: number;
  wickets: number;
  avg: number;
  sr: number;
  status: PlayerStatus;
  soldToTeamId: string | null;
  soldPrice: number | null;
  previousTeamId: string | null;
  photo: string;
}

const firstNames = [
  'Virat','Rohit','Jasprit','Ravindra','KL','Shubman','Rishabh','Hardik','Suryakumar','Mohammed',
  'Shreyas','Axar','Kuldeep','Ishan','Yuzvendra','Shardul','Prithvi','Devdutt','Ruturaj','Venkatesh',
  'Sanju','Deepak','Washington','Ravi','Bhuvneshwar','Umesh','Dinesh','Krunal','Rahul','Manish',
  'Ajinkya','Cheteshwar','Wriddhiman','Mayank','Hanuma','Prasidh','Navdeep','Avesh','Arshdeep','Mukesh',
  'Rinku','Tilak','Yashasvi','Dhruv','Rajat','Sarfaraz','Abhishek','Shahrukh','Nitish','Rahmanullah',
  'Sai','Ravi','Tushar','Mohit','Anuj','Yash','Kartik','Vijay','Karun','Prabhsimran',
  'Varun','Sandeep','Jaydev','Umran','Mohsin','Raj','Aiden','Faf','David','Kane',
  'Jos','Ben','Pat','Mitchell','Travis','Glenn','Steve','Trent','Tim','Marcus',
  'Rashid','Kagiso','Quinton','Anrich','Shimron','Devon','Wanindu','Dushmantha','Lockie','Adam',
  'Liam','Kyle','Lungi','Reeza','Marco','Heinrich','Gerald','Dwaine','Rassie','Lizaad',
];

const lastNames = [
  'Kohli','Sharma','Bumrah','Jadeja','Rahul','Gill','Pant','Pandya','Yadav','Shami',
  'Iyer','Patel','Chahal','Kishan','Singh','Thakur','Shaw','Padikkal','Gaikwad','Iyer',
  'Samson','Chahar','Sundar','Bishnoi','Kumar','Yadav','Karthik','Pandya','Tewatia','Pandey',
  'Rahane','Pujara','Saha','Agarwal','Vihari','Krishna','Saini','Khan','Singh','Kumar',
  'Singh','Varma','Jaiswal','Jurel','Patidar','Khan','Sharma','Khan','Rana','Gurbaz',
  'Sudharsan','Ashwin','Deshpande','Sharma','Rawat','Dayal','Tyagi','Shankar','Nair','Singh',
  'Chakravarthy','Sharma','Unadkat','Malik','Khan','Bawa','Markram','du Plessis','Warner','Williamson',
  'Buttler','Stokes','Cummins','Starc','Head','Maxwell','Smith','Boult','Southee','Stoinis',
  'Khan','Rabada','de Kock','Nortje','Hetmyer','Conway','Hasaranga','Chameera','Ferguson','Zampa',
  'Livingstone','Mayers','Ngidi','Hendricks','Jansen','Klaasen','Coetzee','Pretorius','van der Dussen','Williams',
];

const roleEmojis: Record<PlayerRole, string> = {
  'batsman': '🏏',
  'fast-bowler': '⚡',
  'spinner': '🌀',
  'wicket-keeper': '🧤',
  'all-rounder': '🔄',
};

const roles: PlayerRole[] = ['batsman', 'fast-bowler', 'spinner', 'wicket-keeper', 'all-rounder'];
const categories: PlayerCategory[] = ['marquee', 'premium', 'mid-tier', 'budget'];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generatePlayers(): Player[] {
  const rand = seededRandom(42);
  const players: Player[] = [];
  const usedNames = new Set<string>();
  const teamIds = ['t1','t2','t3','t4','t5','t6','t7','t8'];

  // Photo URLs using UI Avatars API
  const getPhoto = (name: string) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0c1420&color=00d4ff&size=200&bold=true&font-size=0.4`;

  for (let i = 0; i < 250; i++) {
    let name = '';
    let attempts = 0;
    while (attempts < 100) {
      const fi = Math.floor(rand() * firstNames.length);
      const li = Math.floor(rand() * lastNames.length);
      const candidate = `${firstNames[fi]} ${lastNames[li]}`;
      if (!usedNames.has(candidate)) {
        name = candidate;
        usedNames.add(candidate);
        break;
      }
      attempts++;
    }
    if (!name) {
      name = `Player ${i + 1}`;
      usedNames.add(name);
    }

    const roleIdx = i < 80 ? 0 : i < 130 ? 1 : i < 170 ? 2 : i < 200 ? 3 : 4;
    const role = roles[roleIdx];

    let category: PlayerCategory;
    if (i < 20) category = 'marquee';
    else if (i < 70) category = 'premium';
    else if (i < 160) category = 'mid-tier';
    else category = 'budget';

    const nationality: 'indian' | 'overseas' = i < 170 ? 'indian' : 'overseas';

    const basePrices: Record<PlayerCategory, number[]> = {
      'marquee': [1500, 2000],
      'premium': [100, 200],
      'mid-tier': [50, 100],
      'budget': [20, 50],
    };
    const [minP, maxP] = basePrices[category];
    const basePrice = Math.round(minP + rand() * (maxP - minP));

    const batting = role === 'batsman' || role === 'all-rounder' || role === 'wicket-keeper'
      ? Math.round(5 + rand() * 5) : Math.round(1 + rand() * 4);
    const bowling = role === 'fast-bowler' || role === 'spinner' || role === 'all-rounder'
      ? Math.round(5 + rand() * 5) : Math.round(1 + rand() * 3);
    const fielding = Math.round(4 + rand() * 6);
    const rating = Math.round((batting * 0.4 + bowling * 0.35 + fielding * 0.25) * 10) / 10;

    const matches = Math.round(20 + rand() * 180);
    const runs = role !== 'spinner' && role !== 'fast-bowler' ? Math.round(500 + rand() * 7000) : Math.round(rand() * 500);
    const wickets = role !== 'batsman' ? Math.round(20 + rand() * 200) : Math.round(rand() * 20);
    const avg = Math.round((20 + rand() * 40) * 100) / 100;
    const sr = Math.round((100 + rand() * 80) * 100) / 100;

    const previousTeamId = rand() > 0.7 ? teamIds[Math.floor(rand() * teamIds.length)] : null;

    players.push({
      id: `p${i + 1}`,
      name,
      role,
      category,
      nationality,
      basePrice,
      batting,
      bowling,
      fielding,
      rating,
      matches,
      runs,
      wickets,
      avg,
      sr,
      status: 'available',
      soldToTeamId: null,
      soldPrice: null,
      previousTeamId,
      photo: getPhoto(name),
    });
  }
  return players;
}

export const initialPlayers = generatePlayers();
export { roleEmojis };
