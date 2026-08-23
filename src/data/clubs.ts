import { ClubItem } from '../types';
import logoSnakes from '../assets/images/club_snakes_band_1787278084246.jpg';
import logoHyaku from '../assets/images/club_hyaku_martial_1787278097571.jpg';
import logoAoiba from '../assets/images/club_aoiba_betting_1787278109081.jpg';
import logoKarasuno from '../assets/images/club_karasuno_volleyball_1787278118980.jpg';
import logoBlackDragons from '../assets/images/club_black_dragons_1787278128562.jpg';
import logoReika from '../assets/images/club_reika_elite_1787278139039.jpg';
import logoToman from '../assets/images/club_toman_gang_1787278154945.jpg';
import logoWatchers from '../assets/images/club_watchers_journal_1787278165823.jpg';
import logoOcult from '../assets/images/club_ocult_shadow_1787278176520.jpg';
import logoCupid from '../assets/images/Club_cupid_amor.jpg';

const naIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%231a1a1a' stroke='%23444444' stroke-width='6'/%3E%3Ctext x='100' y='118' font-family='monospace' font-size='42' font-weight='bold' fill='%23767575' text-anchor='middle'%3EN%2FA%3C/text%3E%3C/svg%3E";

export const GAKURAN_CLUBS: ClubItem[] = [
  {
    id: 'snakes-band',
    name: 'SNAKES BAND',
    subtitle: 'Banda Oficial del Instituto',
    category: 'Banda Musical / Rock',
    logoUrl: logoSnakes,
    themeColor: '#22c55e',
    accentColor: '#15803d',
    description: 'Banda oficial del instituto con sonido de rock pesado y espíritu rebelde.',
    motto: 'Venenoso · Feroz · Sonoro'
  },
  {
    id: 'hyaku-artes-marciales',
    name: 'HYAKU',
    subtitle: 'Grupo Oficial de Artes Marciales',
    category: 'Artes Marciales / Disciplina',
    logoUrl: logoHyaku,
    themeColor: '#dc2626',
    accentColor: '#991b1b',
    description: 'Grupo tradicional de combate y artes marciales enfocado en honor y técnica letal.',
    motto: 'Disciplina · Fuerza · 백'
  },
  {
    id: 'aoiba-apuestas',
    name: 'AOIBA',
    subtitle: 'Club de Apuestas · Gakuran Central',
    category: 'Club de Apuestas & Estrategia',
    logoUrl: logoAoiba,
    themeColor: '#2563eb',
    accentColor: '#1d4ed8',
    description: 'Sindicato de alto riesgo, cartas y apuestas clandestinas del instituto.',
    motto: 'Estrategia · Suerte · Poder · Riesgo'
  },
  {
    id: 'karasuno-voleibol',
    name: 'KARASUNO',
    subtitle: 'Equipo Oficial de Voleibol · Gakuran Sur',
    category: 'Equipo Atlético / Voleibol',
    logoUrl: logoKarasuno,
    themeColor: '#f97316',
    accentColor: '#c2410c',
    description: 'Los cuervos implacables de la cancha, con saltos explosivos y disciplina de hierro.',
    motto: 'Unión · Disciplina · Victoria (飛べ)'
  },
  {
    id: 'black-dragons',
    name: 'BLACK DRAGONS',
    subtitle: 'Club Antisocial · Club Oficial',
    category: 'Club Antisocial / Biker Gang',
    logoUrl: logoBlackDragons,
    themeColor: '#e5e7eb',
    accentColor: '#4b5563',
    description: 'Facción anárquica de asfalto y dragones negros con lealtad callejera inquebrantable.',
    motto: 'Caos · Lealtad · Libertad'
  },
  {
    id: 'reika-elite',
    name: 'REIKA',
    subtitle: 'Club de Élite Social · Revista Oficial',
    category: 'Club de Élite Social / Moda',
    logoUrl: logoReika,
    themeColor: '#ec4899',
    accentColor: '#be185d',
    description: 'Círculo exclusivo de alta sociedad estudiantil, influencia, elegancia y prestigio.',
    motto: 'Belleza · Moda · Influencia · Prestigio'
  },
  {
    id: 'los-toman',
    name: 'LOS TOMAN',
    subtitle: 'Club de Defensa Personal · 初代',
    category: 'Defensa Personal / Pandilla Fundadora',
    logoUrl: logoToman,
    themeColor: '#eab308',
    accentColor: '#a16207',
    description: 'Legendaria pandilla fundadora de artes marciales y defensa personal del instituto.',
    motto: 'Honor · Disciplina · Respeto · Protección'
  },
  {
    id: 'sera-watchers',
    name: 'WATCHERS',
    subtitle: 'Club de Periodismo & Investigación',
    category: 'Club de Periodismo',
    logoUrl: logoWatchers,
    themeColor: '#a855f7',
    accentColor: '#7e22ce',
    description: 'Ojos vigilantes que registran cada victoria, secreto y movimiento en el instituto.',
    motto: 'Escuchamos · Investigamos · Informamos'
  },
  {
    id: 'ocult-club',
    name: 'OCULT',
    subtitle: 'Club de Ocultismo · Gakuran Central',
    category: 'Club de Ocultismo & Sombras',
    logoUrl: logoOcult,
    themeColor: '#b45309',
    accentColor: '#78350f',
    description: 'Misterioso culto de sombras, rituales oscuros y conocimiento prohibido.',
    motto: 'Conocimiento · Sombras · Poder'
  },
  {
    id: 'cupid-romance',
    name: 'CUPID',
    subtitle: 'Club de Romance',
    category: 'Club Sentimental / Cupidos del Instituto',
    logoUrl: logoCupid,
    themeColor: '#dc2626',
    accentColor: '#7f1d1d',
    description: 'Casamenteros oficiales del instituto, expertos en flechas certeras y corazones conquistados.',
    motto: 'Amor · Precisión · Destino'
  },
  {
    id: 'sin-club',
    name: 'SIN CLUB',
    subtitle: 'Peleador Independiente',
    category: 'Sin Afiliación',
    logoUrl: naIcon,
    themeColor: '#767575',
    accentColor: '#4b5563',
    description: 'Peleador que no está afiliado a ningún club oficial del instituto.',
    motto: 'N/A'
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
