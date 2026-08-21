import { PromotionEvent, NotificationItem } from '../types';

export const initialEvents: PromotionEvent[] = [
  {
    id: 'ufc-305',
    name: 'UFC 305: CLASH OF TITANS',
    date: 'SEP 28, 2026',
    venue: 'T-Mobile Arena',
    location: 'Las Vegas, NV',
    status: 'UPCOMING',
    projectedPPV: 850000,
    ticketSalesPercentage: 94,
    bouts: [
      {
        id: 'b-main',
        redCornerId: 'kamaru-usman',
        blueCornerId: 'marcus-vane',
        weightClass: 'WELTERWEIGHT (170 LBS)',
        rounds: 5,
        isTitleFight: true,
        status: 'SCHEDULED'
      },
      {
        id: 'b-comain',
        redCornerId: 'demetrious-silva',
        blueCornerId: 'josh-relley',
        weightClass: 'WELTERWEIGHT (170 LBS)',
        rounds: 3,
        isTitleFight: false,
        status: 'SCHEDULED'
      }
    ]
  },
  {
    id: 'ufc-306',
    name: 'UFC 306: NOCHE DE GUERRA',
    date: 'NOV 14, 2026',
    venue: 'The Sphere',
    location: 'Las Vegas, NV',
    status: 'UPCOMING',
    projectedPPV: 1200000,
    ticketSalesPercentage: 100,
    bouts: [
      {
        id: 'b-306-1',
        redCornerId: 'alex-pereira',
        blueCornerId: 'islam-makhachev',
        weightClass: 'LIGHT HEAVYWEIGHT (205 LBS)',
        rounds: 5,
        isTitleFight: true,
        status: 'SCHEDULED'
      }
    ]
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'CONTRACT EXPIRING SOON',
    description: 'Marcus "The Anvil" Vane has only 1 bout remaining on current deal. Rival promotions are circling.',
    time: '12m ago',
    type: 'CONTRACT',
    read: false
  },
  {
    id: 'n2',
    title: 'TITLE BOUT CONFIRMED',
    description: 'Commission has officially sanctioned Usman vs. Vane II for the Undisputed Championship.',
    time: '2h ago',
    type: 'FIGHT',
    read: false
  },
  {
    id: 'n3',
    title: 'RANKINGS UPDATE',
    description: 'Marcus Vane jumped to #1 Contender following his thunderous KO at UFC 300.',
    time: '1d ago',
    type: 'RANKING',
    read: true
  }
];
