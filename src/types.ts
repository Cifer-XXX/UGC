export type WeightClass = 
  | 'FLYWEIGHT (125 LBS)'
  | 'BANTAMWEIGHT (135 LBS)'
  | 'FEATHERWEIGHT (145 LBS)'
  | 'LIGHTWEIGHT (155 LBS)'
  | 'WELTERWEIGHT (170 LBS)'
  | 'MIDDLEWEIGHT (185 LBS)'
  | 'LIGHT HEAVYWEIGHT (205 LBS)'
  | 'HEAVYWEIGHT (265 LBS)';

export type UgcDivision = 
  | 'PESO PLUMA (1.50 M O MENOS - 1.69 M)'
  | 'PESO WELTER (1.70 M - 1.89 M)'
  | 'PESO PESADO (1.90 M - 2.10 M)';

export const FIGHTING_STYLES = [
  'KURE',
  'ALÍ',
  'WINGCHUN',
  'BOXING',
  'MUAYTHAI',
  'BÁSICO',
  'SLUGGER',
  'CAPOEIRA',
  'WRESTLING',
  'HAKARI',
  'STRIKER'
] as const;

export type FightingStyle = typeof FIGHTING_STYLES[number];

export const DIVISION_HEIGHTS: Record<UgcDivision, string[]> = {
  'PESO PLUMA (1.50 M O MENOS - 1.69 M)': [
    '1.50 m o menos',
    '1.50 m',
    '1.51 m',
    '1.52 m',
    '1.53 m',
    '1.54 m',
    '1.55 m',
    '1.56 m',
    '1.57 m',
    '1.58 m',
    '1.59 m',
    '1.60 m',
    '1.61 m',
    '1.62 m',
    '1.63 m',
    '1.64 m',
    '1.65 m',
    '1.66 m',
    '1.67 m',
    '1.68 m',
    '1.69 m'
  ],
  'PESO WELTER (1.70 M - 1.89 M)': [
    '1.70 m',
    '1.71 m',
    '1.72 m',
    '1.73 m',
    '1.74 m',
    '1.75 m',
    '1.76 m',
    '1.77 m',
    '1.78 m',
    '1.79 m',
    '1.80 m',
    '1.81 m',
    '1.82 m',
    '1.83 m',
    '1.84 m',
    '1.85 m',
    '1.86 m',
    '1.87 m',
    '1.88 m',
    '1.89 m'
  ],
  'PESO PESADO (1.90 M - 2.10 M)': [
    '1.90 m',
    '1.91 m',
    '1.92 m',
    '1.93 m',
    '1.94 m',
    '1.95 m',
    '1.96 m',
    '1.97 m',
    '1.98 m',
    '1.99 m',
    '2.00 m',
    '2.01 m',
    '2.02 m',
    '2.03 m',
    '2.04 m',
    '2.05 m',
    '2.06 m',
    '2.07 m',
    '2.08 m',
    '2.09 m',
    '2.10 m'
  ]
};

export interface RankedFighterItem {
  id: string;
  name: string;
  nickname?: string;
  height: string;
  record: string;
  streak: string;
  fightingStyle?: string;
  imageUrl?: string;
  movement?: string;
  isChampion?: boolean;
  points?: number;
  koCount?: number;
  kdCount?: number;
  dominanceCount?: number;
  notes?: string;
  clubId?: string;
  clubName?: string;
  clubCategory?: string;
  clubLogoUrl?: string;
  clubColor?: string;
}

export interface ClubItem {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  logoUrl: string;
  themeColor: string;
  accentColor: string;
  description: string;
  motto: string;
}

export interface FightHistoryItem {
  id: string;
  event: string;
  date: string;
  opponent: string;
  method: string;
  roundTime: string;
  result: 'WIN' | 'LOSS' | 'DRAW' | 'NC';
}

export interface Fighter {
  id: string;
  firstName: string;
  nickname: string;
  lastName: string;
  rankingBadge: string; // e.g. "#1 CONTENDER", "CHAMPION", "#3 RANKED"
  status: 'ACTIVE ROSTER' | 'FREE AGENT' | 'INJURED' | 'SUSPENDED';
  record: string; // e.g. "24-3-0"
  wins: number;
  losses: number;
  draws: number;
  height: string; // e.g. "6'2\""
  reach: string; // e.g. "76\""
  weight: string; // e.g. "170 LBS"
  weightClass: WeightClass;
  stance: 'ORTHODOX' | 'SOUTHPAW' | 'SWITCH';
  fightingStyle: string; // e.g. "MUAY THAI / BJJ"
  strikingAccuracy: number; // percentage e.g. 68
  grapplingDefense: number; // percentage e.g. 82
  takedownAverage: number; // per 15 min e.g. 3.4
  takedownAccuracy: number; // percentage e.g. 54
  koPower: number; // percentage e.g. 92
  cardio: number; // percentage e.g. 88
  imageUrl: string;
  recentHistory: FightHistoryItem[];
  contract: {
    fightsRemaining: number;
    showPurse: number;
    winBonus: number;
    ppvCutPercent: number;
    status: 'SIGNED' | 'EXPIRING' | 'NEGOTIATING' | 'FREE_AGENT';
  };
  hypeRating: number; // 1-100
  bio?: string;
  age: number;
  country: string;
  countryCode: string;
}

export interface ContractOffer {
  fights: number;
  showPurse: number;
  winBonus: number;
  ppvCutPercent: number;
  signingBonus: number;
  performanceBonusClause: boolean;
  championshipClause: boolean;
}

export interface ScheduledBout {
  id: string;
  redCornerId: string;
  blueCornerId: string;
  weightClass: WeightClass;
  rounds: 3 | 5;
  isTitleFight: boolean;
  status: 'SCHEDULED' | 'COMPLETED';
  winnerId?: string;
  method?: string;
  roundEnded?: number;
  timeEnded?: string;
}

export interface PromotionEvent {
  id: string;
  name: string; // e.g. "UFC 305: CLASH OF TITANS"
  date: string;
  venue: string;
  location: string;
  bouts: ScheduledBout[];
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED';
  projectedPPV: number;
  ticketSalesPercentage: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'CONTRACT' | 'FIGHT' | 'RANKING' | 'INJURY';
  read: boolean;
}

export type AppTab = 'RANKINGS' | 'FIGHTERS' | 'MATCHMAKING' | 'HISTORIA';

export interface SeasonDivisionSnapshot {
  divisionId: UgcDivision;
  divisionLabel: string;
  divisionHeightRange: string;
  divisionColor: string;
  champion?: RankedFighterItem;
  fighters: RankedFighterItem[];
  totalFighters: number;
  totalPoints: number;
}

export interface SeasonSnapshot {
  id: string;
  name: string;
  savedAt: string;
  notes?: string;
  divisions: SeasonDivisionSnapshot[];
  totalFighters: number;
  totalPoints: number;
}
