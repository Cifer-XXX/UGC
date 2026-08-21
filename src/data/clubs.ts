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
    name: 'SERA WATCHERS',
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
  }
];
