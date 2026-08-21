import { Fighter } from '../types';
import fighterOneImg from '../assets/images/gakuran_fighter_one_1787275118531.jpg';
import fighterTwoImg from '../assets/images/gakuran_fighter_two_1787275129052.jpg';
import fighterThreeImg from '../assets/images/gakuran_fighter_three_1787275141107.jpg';
import fighterFourImg from '../assets/images/gakuran_fighter_four_1787275181834.jpg';
import fighterFiveImg from '../assets/images/gakuran_fighter_five_1787275193725.jpg';
import bossMgrImg from '../assets/images/gakuran_boss_mgr_1787275151429.jpg';

export const initialFighters: Fighter[] = [
  {
    id: 'marcus-vane',
    firstName: 'MARCUS',
    nickname: 'THE ANVIL',
    lastName: 'VANE',
    rankingBadge: '#1 CONTENDER',
    status: 'ACTIVE ROSTER',
    record: '24-3-0',
    wins: 24,
    losses: 3,
    draws: 0,
    height: "6'2\"",
    reach: '76"',
    weight: '170 LBS',
    weightClass: 'WELTERWEIGHT (170 LBS)',
    stance: 'ORTHODOX',
    fightingStyle: 'BANCHO BRAWLING / BJJ',
    strikingAccuracy: 68,
    grapplingDefense: 82,
    takedownAverage: 3.4,
    takedownAccuracy: 64,
    koPower: 92,
    cardio: 89,
    imageUrl: fighterOneImg,
    recentHistory: [
      {
        id: 'h1',
        event: 'UGC 300 · APR 13, 2024',
        date: 'APR 13, 2024',
        opponent: 'VS. JOSH "THE TITAN" RELLEY',
        method: 'KO/TKO (Head Kick) · R2 3:45',
        roundTime: 'R2 3:45',
        result: 'WIN'
      },
      {
        id: 'h2',
        event: 'UGC 295 · NOV 11, 2023',
        date: 'NOV 11, 2023',
        opponent: 'VS. DEMETRIOUS SILVA',
        method: 'Submission (Guillotine) · R1 4:12',
        roundTime: 'R1 4:12',
        result: 'WIN'
      },
      {
        id: 'h3',
        event: 'UGC 289 · JUN 10, 2023',
        date: 'JUN 10, 2023',
        opponent: 'VS. KAMARU USMAN',
        method: 'Decision (Unanimous) · R5 5:00',
        roundTime: 'R5 5:00',
        result: 'LOSS'
      },
      {
        id: 'h4',
        event: 'UGC 282 · DEC 10, 2022',
        date: 'DEC 10, 2022',
        opponent: 'VS. GILBERT BURNS',
        method: 'KO/TKO (Right Hook) · R1 2:18',
        roundTime: 'R1 2:18',
        result: 'WIN'
      }
    ],
    contract: {
      fightsRemaining: 1,
      showPurse: 450000,
      winBonus: 450000,
      ppvCutPercent: 2.5,
      status: 'EXPIRING'
    },
    hypeRating: 94,
    bio: 'Renowned high school rooftop delinquent champion. Fights with an open black gakuran jacket, explosive roundhouse kicks, and ironclad sprawl brawling.',
    age: 31,
    country: 'Japan / United States',
    countryCode: 'USA'
  },
  {
    id: 'josh-relley',
    firstName: 'JOSH',
    nickname: 'THE TITAN',
    lastName: 'RELLEY',
    rankingBadge: '#3 RANKED',
    status: 'ACTIVE ROSTER',
    record: '19-4-0',
    wins: 19,
    losses: 4,
    draws: 0,
    height: "6'1\"",
    reach: '74"',
    weight: '170 LBS',
    weightClass: 'WELTERWEIGHT (170 LBS)',
    stance: 'SOUTHPAW',
    fightingStyle: 'FREESTYLE WRESTLING / JUDO',
    strikingAccuracy: 58,
    grapplingDefense: 88,
    takedownAverage: 4.8,
    takedownAccuracy: 72,
    koPower: 84,
    cardio: 94,
    imageUrl: fighterTwoImg,
    recentHistory: [
      {
        id: 'hr1',
        event: 'UGC 300 · APR 13, 2024',
        date: 'APR 13, 2024',
        opponent: 'VS. MARCUS "THE ANVIL" VANE',
        method: 'KO/TKO (Head Kick) · R2 3:45',
        roundTime: 'R2 3:45',
        result: 'LOSS'
      },
      {
        id: 'hr2',
        event: 'UGC 292 · AUG 19, 2023',
        date: 'AUG 19, 2023',
        opponent: 'VS. COLBY COVINGTON',
        method: 'Decision (Split) · R3 5:00',
        roundTime: 'R3 5:00',
        result: 'WIN'
      },
      {
        id: 'hr3',
        event: 'UGC 286 · MAR 18, 2023',
        date: 'MAR 18, 2023',
        opponent: 'VS. VICENTE LUQUE',
        method: 'Submission (Rear-Naked Choke) · R2 1:52',
        roundTime: 'R2 1:52',
        result: 'WIN'
      }
    ],
    contract: {
      fightsRemaining: 3,
      showPurse: 280000,
      winBonus: 280000,
      ppvCutPercent: 1.0,
      status: 'SIGNED'
    },
    hypeRating: 86,
    bio: 'Heavyweight gakuran enforcer in a custom gold-trimmed white uniform. Master of devastating blast double-legs and rooftop body slams.',
    age: 29,
    country: 'United States',
    countryCode: 'USA'
  },
  {
    id: 'demetrious-silva',
    firstName: 'DEMETRIOUS',
    nickname: 'THE PHANTOM',
    lastName: 'SILVA',
    rankingBadge: '#2 RANKED',
    status: 'ACTIVE ROSTER',
    record: '22-2-0',
    wins: 22,
    losses: 2,
    draws: 0,
    height: "5'11\"",
    reach: '73"',
    weight: '170 LBS',
    weightClass: 'WELTERWEIGHT (170 LBS)',
    stance: 'SWITCH',
    fightingStyle: 'LUTALIVRE / SAMBO',
    strikingAccuracy: 74,
    grapplingDefense: 91,
    takedownAverage: 3.1,
    takedownAccuracy: 68,
    koPower: 86,
    cardio: 92,
    imageUrl: fighterThreeImg,
    recentHistory: [
      {
        id: 'hs1',
        event: 'UGC 302 · JUN 01, 2024',
        date: 'JUN 01, 2024',
        opponent: 'VS. BELAL MUHAMMAD',
        method: 'KO/TKO (Flying Knee) · R1 1:12',
        roundTime: 'R1 1:12',
        result: 'WIN'
      },
      {
        id: 'hs2',
        event: 'UGC 295 · NOV 11, 2023',
        date: 'NOV 11, 2023',
        opponent: 'VS. MARCUS "THE ANVIL" VANE',
        method: 'Submission (Guillotine) · R1 4:12',
        roundTime: 'R1 4:12',
        result: 'LOSS'
      },
      {
        id: 'hs3',
        event: 'UGC 287 · APR 08, 2023',
        date: 'APR 08, 2023',
        opponent: 'VS. SHAVKAT RAKHMONOV',
        method: 'Decision (Unanimous) · R3 5:00',
        roundTime: 'R3 5:00',
        result: 'WIN'
      }
    ],
    contract: {
      fightsRemaining: 2,
      showPurse: 320000,
      winBonus: 320000,
      ppvCutPercent: 1.5,
      status: 'SIGNED'
    },
    hypeRating: 91,
    bio: 'Elusive midnight brawler sporting a deep navy gakuran. Feared across districts for instantaneous counter-punches and flying submissions.',
    age: 30,
    country: 'Brazil',
    countryCode: 'BRA'
  },
  {
    id: 'kamaru-usman',
    firstName: 'KAMARU',
    nickname: 'THE NIGHTMARE BANCHO',
    lastName: 'USMAN',
    rankingBadge: 'UNDISPUTED CHAMPION',
    status: 'ACTIVE ROSTER',
    record: '21-3-0',
    wins: 21,
    losses: 3,
    draws: 0,
    height: "6'0\"",
    reach: '76"',
    weight: '170 LBS',
    weightClass: 'WELTERWEIGHT (170 LBS)',
    stance: 'ORTHODOX',
    fightingStyle: 'WRESTLING / DIRTY BOXING',
    strikingAccuracy: 71,
    grapplingDefense: 97,
    takedownAverage: 4.2,
    takedownAccuracy: 62,
    koPower: 89,
    cardio: 96,
    imageUrl: fighterFourImg,
    recentHistory: [
      {
        id: 'hu1',
        event: 'UGC 289 · JUN 10, 2023',
        date: 'JUN 10, 2023',
        opponent: 'VS. MARCUS "THE ANVIL" VANE',
        method: 'Decision (Unanimous) · R5 5:00',
        roundTime: 'R5 5:00',
        result: 'WIN'
      },
      {
        id: 'hu2',
        event: 'UGC 286 · MAR 18, 2023',
        date: 'MAR 18, 2023',
        opponent: 'VS. LEON EDWARDS',
        method: 'Decision (Majority) · R5 5:00',
        roundTime: 'R5 5:00',
        result: 'WIN'
      },
      {
        id: 'hu3',
        event: 'UGC 278 · AUG 20, 2022',
        date: 'AUG 20, 2022',
        opponent: 'VS. JORGE MASVIDAL',
        method: 'KO (Straight Right) · R2 1:02',
        roundTime: 'R2 1:02',
        result: 'WIN'
      }
    ],
    contract: {
      fightsRemaining: 2,
      showPurse: 950000,
      winBonus: 950000,
      ppvCutPercent: 4.5,
      status: 'SIGNED'
    },
    hypeRating: 98,
    bio: 'Reigning Undisputed Welterweight Gakuran Champion. Imposes suffocating cage fence pressure and unstoppable clinch domination.',
    age: 36,
    country: 'Nigeria',
    countryCode: 'NGA'
  },
  {
    id: 'alex-pereira',
    firstName: 'ALEX',
    nickname: 'POATAN',
    lastName: 'PEREIRA',
    rankingBadge: 'LIGHT HEAVYWEIGHT CHAMPION',
    status: 'ACTIVE ROSTER',
    record: '12-2-0',
    wins: 12,
    losses: 2,
    draws: 0,
    height: "6'4\"",
    reach: '79"',
    weight: '205 LBS',
    weightClass: 'LIGHT HEAVYWEIGHT (205 LBS)',
    stance: 'ORTHODOX',
    fightingStyle: 'GLORY KICKBOXING',
    strikingAccuracy: 78,
    grapplingDefense: 79,
    takedownAverage: 0.8,
    takedownAccuracy: 40,
    koPower: 99,
    cardio: 86,
    imageUrl: fighterFiveImg,
    recentHistory: [
      {
        id: 'hp1',
        event: 'UGC 303 · JUN 29, 2024',
        date: 'JUN 29, 2024',
        opponent: 'VS. JIRI PROCHAZKA',
        method: 'KO/TKO (Head Kick) · R2 0:13',
        roundTime: 'R2 0:13',
        result: 'WIN'
      },
      {
        id: 'hp2',
        event: 'UGC 300 · APR 13, 2024',
        date: 'APR 13, 2024',
        opponent: 'VS. JAMAHAL HILL',
        method: 'KO (Left Hook) · R1 3:14',
        roundTime: 'R1 3:14',
        result: 'WIN'
      }
    ],
    contract: {
      fightsRemaining: 4,
      showPurse: 1200000,
      winBonus: 1200000,
      ppvCutPercent: 5.0,
      status: 'SIGNED'
    },
    hypeRating: 99,
    bio: 'Stoic heavy-hitting striker with an intimidating stone glare. Possesses the most lethal one-punch knockout power in the entire promotion.',
    age: 37,
    country: 'Brazil',
    countryCode: 'BRA'
  },
  {
    id: 'islam-makhachev',
    firstName: 'ISLAM',
    nickname: 'THE EAGLE HEIR',
    lastName: 'MAKHACHEV',
    rankingBadge: 'LIGHTWEIGHT CHAMPION / #1 P4P',
    status: 'ACTIVE ROSTER',
    record: '26-1-0',
    wins: 26,
    losses: 1,
    draws: 0,
    height: "5'10\"",
    reach: '70"',
    weight: '155 LBS',
    weightClass: 'LIGHTWEIGHT (155 LBS)',
    stance: 'SOUTHPAW',
    fightingStyle: 'COMBAT SAMBO / GAKURAN JUDO',
    strikingAccuracy: 75,
    grapplingDefense: 94,
    takedownAverage: 4.6,
    takedownAccuracy: 78,
    koPower: 83,
    cardio: 97,
    imageUrl: fighterOneImg,
    recentHistory: [
      {
        id: 'him1',
        event: 'UGC 302 · JUN 01, 2024',
        date: 'JUN 01, 2024',
        opponent: 'VS. DUSTIN POIRIER',
        method: 'Submission (DArce Choke) · R5 2:42',
        roundTime: 'R5 2:42',
        result: 'WIN'
      },
      {
        id: 'him2',
        event: 'UGC 294 · OCT 21, 2023',
        date: 'OCT 21, 2023',
        opponent: 'VS. ALEXANDER VOLKANOVSKI',
        method: 'KO/TKO (Head Kick & Punches) · R1 3:06',
        roundTime: 'R1 3:06',
        result: 'WIN'
      }
    ],
    contract: {
      fightsRemaining: 3,
      showPurse: 1100000,
      winBonus: 1100000,
      ppvCutPercent: 4.0,
      status: 'SIGNED'
    },
    hypeRating: 99,
    bio: 'Reigning #1 Pound-for-Pound fighter in the championship. Unmatched ground control, trips, and technical choke precision.',
    age: 32,
    country: 'Russia',
    countryCode: 'RUS'
  }
];

export const divisionRankings = [
  {
    division: 'WELTERWEIGHT (170 LBS)',
    champion: 'Kamaru Usman',
    fighters: [
      { rank: 'C', name: 'Kamaru Usman', id: 'kamaru-usman', record: '21-3-0', streak: 'W3', movement: '0' },
      { rank: '#1', name: 'Marcus "The Anvil" Vane', id: 'marcus-vane', record: '24-3-0', streak: 'W2', movement: '+1' },
      { rank: '#2', name: 'Demetrious Silva', id: 'demetrious-silva', record: '22-2-0', streak: 'W1', movement: '-1' },
      { rank: '#3', name: 'Josh "The Titan" Relley', id: 'josh-relley', record: '19-4-0', streak: 'L1', movement: '-1' },
      { rank: '#4', name: 'Shavkat Rakhmonov', id: 'shavkat', record: '18-0-0', streak: 'W18', movement: '+2' },
      { rank: '#5', name: 'Belal Muhammad', id: 'belal', record: '23-3-0', streak: 'W10', movement: '0' },
      { rank: '#6', name: 'Jack Della Maddalena', id: 'jack-dm', record: '17-2-0', streak: 'W7', movement: '+1' },
      { rank: '#7', name: 'Leon Edwards', id: 'leon-edwards', record: '22-4-0', streak: 'L1', movement: '-3' }
    ]
  },
  {
    division: 'LIGHTWEIGHT (155 LBS)',
    champion: 'Islam Makhachev',
    fighters: [
      { rank: 'C', name: 'Islam Makhachev', id: 'islam-makhachev', record: '26-1-0', streak: 'W14', movement: '0' },
      { rank: '#1', name: 'Arman Tsarukyan', id: 'arman-t', record: '22-3-0', streak: 'W4', movement: '+1' },
      { rank: '#2', name: 'Charles Oliveira', id: 'charles-o', record: '34-10-0', streak: 'L1', movement: '-1' },
      { rank: '#3', name: 'Justin Gaethje', id: 'justin-g', record: '25-5-0', streak: 'L1', movement: '0' },
      { rank: '#4', name: 'Dustin Poirier', id: 'dustin-p', record: '30-9-0', streak: 'L1', movement: '0' },
      { rank: '#5', name: 'Max Holloway', id: 'max-h', record: '26-7-0', streak: 'W3', movement: '+4' }
    ]
  },
  {
    division: 'LIGHT HEAVYWEIGHT (205 LBS)',
    champion: 'Alex Pereira',
    fighters: [
      { rank: 'C', name: 'Alex Pereira', id: 'alex-pereira', record: '12-2-0', streak: 'W5', movement: '0' },
      { rank: '#1', name: 'Magomed Ankalaev', id: 'ankalaev', record: '19-1-1', streak: 'W11', movement: '+1' },
      { rank: '#2', name: 'Jiri Prochazka', id: 'jiri-p', record: '30-5-1', streak: 'L1', movement: '-1' },
      { rank: '#3', name: 'Jan Blachowicz', id: 'jan-b', record: '29-10-1', streak: 'L1', movement: '0' }
    ]
  }
];
