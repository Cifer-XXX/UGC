import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UgcDivision, RankedFighterItem, Fighter, ClubItem, FIGHTING_STYLES, FightingStyle, DIVISION_HEIGHTS, SeasonSnapshot } from '../types';
import { GAKURAN_CLUBS } from '../data/clubs';
import { 
  Trophy, 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  Trash2, 
  Edit3, 
  Award, 
  UserPlus, 
  Swords, 
  Check, 
  X, 
  Ruler, 
  Shield, 
  Layers, 
  Filter,
  Flame,
  Zap,
  TrendingUp,
  Percent,
  Sparkles,
  BarChart3,
  Crown,
  Minus,
  RotateCcw,
  Save,
  BookmarkCheck,
  History as HistoryIcon,
  CheckCircle2
} from 'lucide-react';

export type RankingTab = UgcDivision | 'P4P';

interface DivisionMeta {
  id: UgcDivision;
  label: string;
  heightRange: string;
  defaultHeight: string;
  color: string;
}

const DIVISIONS: DivisionMeta[] = [
  {
    id: 'PESO PLUMA (1.50 M O MENOS - 1.69 M)',
    label: 'PESO PLUMA',
    heightRange: '1.50 m o menos - 1.69 m',
    defaultHeight: '1.64 m',
    color: '#ffb4ac'
  },
  {
    id: 'PESO WELTER (1.70 M - 1.89 M)',
    label: 'PESO WELTER',
    heightRange: '1.70 m - 1.89 m',
    defaultHeight: '1.78 m',
    color: '#e61c24'
  },
  {
    id: 'PESO PESADO (1.90 M - 2.10 M)',
    label: 'PESO PESADO',
    heightRange: '1.90 m - 2.10 m',
    defaultHeight: '1.96 m',
    color: '#ff5449'
  }
];

const LOCAL_STORAGE_KEY = 'ugc_division_rankings_v3_clubs';
const P4P_CUSTOM_ORDER_KEY = 'ugc_p4p_custom_order_v1';
export const SEASON_HISTORY_STORAGE_KEY = 'ugc_season_history_v1';

// Helper to auto-sort fighters descending by points (and secondarily by wins)
export const sortByPointsDesc = (list: RankedFighterItem[]): RankedFighterItem[] => {
  return [...list].sort((a, b) => {
    const ptsA = a.points ?? 0;
    const ptsB = b.points ?? 0;
    if (ptsB !== ptsA) return ptsB - ptsA;
    // Tie breaker 1: Total wins
    const winsA = parseInt((a.record || '0-0-0').split('-')[0], 10) || 0;
    const winsB = parseInt((b.record || '0-0-0').split('-')[0], 10) || 0;
    if (winsB !== winsA) return winsB - winsA;
    // Tie breaker 2: Losses (fewer is better)
    const lossA = parseInt((a.record || '0-0-0').split('-')[1], 10) || 0;
    const lossB = parseInt((b.record || '0-0-0').split('-')[1], 10) || 0;
    if (lossA !== lossB) return lossA - lossB;
    return 0;
  }).map((fighter, idx) => ({
    ...fighter,
    isChampion: idx === 0
  }));
};

interface RankingsViewProps {
  fighters: Fighter[];
  onSelectFighter: (fighterId: string) => void;
  onBookFighter: (fighterId: string) => void;
  onNavigateToHistory?: () => void;
}

interface EnrichedP4PFighter extends RankedFighterItem {
  divisionId: UgcDivision;
  divisionLabel: string;
  divisionRange: string;
  divisionColor: string;
  divisionRank: number;
  wins: number;
  losses: number;
  draws: number;
  totalFights: number;
  winRate: number;
  streakNumber: number;
}

export const RankingsView: React.FC<RankingsViewProps> = ({
  fighters,
  onSelectFighter,
  onBookFighter,
  onNavigateToHistory
}) => {
  const [activeTab, setActiveTab] = useState<RankingTab>('PESO PLUMA (1.50 M O MENOS - 1.69 M)');
  const [selectedClubFilter, setSelectedClubFilter] = useState<string>('ALL');
  const [p4pSortBy, setP4pSortBy] = useState<'WINS' | 'STREAK' | 'WINRATE' | 'CUSTOM'>('WINS');
  const [p4pCustomOrderIds, setP4pCustomOrderIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(P4P_CUSTOM_ORDER_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save Season Modal State
  const [isSaveSeasonModalOpen, setIsSaveSeasonModalOpen] = useState(false);
  const [seasonNameInput, setSeasonNameInput] = useState('');
  const [seasonNotesInput, setSeasonNotesInput] = useState('');
  const [savedSeasonSuccess, setSavedSeasonSuccess] = useState<string | null>(null);

  // All rankings per division with club data
  const [rankingsByDivision, setRankingsByDivision] = useState<Record<UgcDivision, RankedFighterItem[]>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
      // Migrate from old storage key if exists
      const oldSaved = localStorage.getItem('ugc_division_rankings_v2');
      if (oldSaved) {
        return JSON.parse(oldSaved);
      }
    } catch (e) {
      console.error('Error loading rankings from storage', e);
    }
    return {
      'PESO PLUMA (1.50 M O MENOS - 1.69 M)': [],
      'PESO WELTER (1.70 M - 1.89 M)': [],
      'PESO PESADO (1.90 M - 2.10 M)': []
    };
  });

  // Save to localStorage when rankings change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rankingsByDivision));
    } catch (e) {
      console.error('Error saving rankings', e);
    }
  }, [rankingsByDivision]);

  // Save P4P Custom Order
  useEffect(() => {
    try {
      localStorage.setItem(P4P_CUSTOM_ORDER_KEY, JSON.stringify(p4pCustomOrderIds));
    } catch (e) {
      console.error('Error saving P4P custom order', e);
    }
  }, [p4pCustomOrderIds]);

  // Form State for Adding Fighter
  const [isFormOpen, setIsFormOpen] = useState<boolean>(true);
  const [formName, setFormName] = useState('');
  const [formNickname, setFormNickname] = useState('');
  const [formHeight, setFormHeight] = useState('1.64 m');
  const [formWins, setFormWins] = useState(10);
  const [formLosses, setFormLosses] = useState(1);
  const [formDraws, setFormDraws] = useState(0);
  const [formStreak, setFormStreak] = useState('W4');
  const [formStyle, setFormStyle] = useState<FightingStyle>('KURE');
  
  // Target division for the form when in P4P tab
  const [formTargetDivision, setFormTargetDivision] = useState<UgcDivision>('PESO PLUMA (1.50 M O MENOS - 1.69 M)');
  
  // Club selection
  const [selectedClubId, setSelectedClubId] = useState<string>(GAKURAN_CLUBS[0].id);

   // Edit State
  const [editingFighter, setEditingFighter] = useState<{ fighter: RankedFighterItem; divisionId: UgcDivision } | null>(null);

  // Cooldown para evitar sumar puntos por accidente con clics repetidos muy rápido
  const pointsCooldownRef = useRef<Set<string>>(new Set());

  // Active division metadata (for standard division tabs)
  const activeDivInfo = activeTab !== 'P4P' 
    ? (DIVISIONS.find(d => d.id === activeTab) || DIVISIONS[0])
    : (DIVISIONS.find(d => d.id === formTargetDivision) || DIVISIONS[0]);

  const currentFighterList = activeTab !== 'P4P' ? (rankingsByDivision[activeTab] || []) : [];
  const championFighter = currentFighterList.length > 0 ? currentFighterList[0] : null;

  // Selected Club Metadata
  const activeSelectedClub = GAKURAN_CLUBS.find(c => c.id === selectedClubId) || GAKURAN_CLUBS[0];

  // Total points across all divisions
  const totalPointsAllDivisions = useMemo(() => {
    let sum = 0;
    DIVISIONS.forEach(d => {
      const list = rankingsByDivision[d.id] || [];
      list.forEach(f => {
        sum += (f.points ?? 0);
      });
    });
    return sum;
  }, [rankingsByDivision]);

  // Helper to parse record and streak
  const parseFighterStats = (f: RankedFighterItem) => {
    const parts = (f.record || '0-0-0').split('-');
    const wins = parseInt(parts[0], 10) || 0;
    const losses = parseInt(parts[1], 10) || 0;
    const draws = parseInt(parts[2], 10) || 0;
    const totalFights = wins + losses + draws;
    const winRate = totalFights > 0 ? Math.round((wins / totalFights) * 100) : 0;
    
    // Parse streak (e.g. W8 => 8, L2 => -2)
    const streakStr = f.streak || 'W0';
    const isWinStreak = streakStr.toUpperCase().startsWith('W');
    const streakVal = parseInt(streakStr.replace(/[^0-9]/g, ''), 10) || 0;
    const streakNumber = isWinStreak ? streakVal : -streakVal;

    return { wins, losses, draws, totalFights, winRate, streakNumber };
  };

  // Compile ALL fighters from the 3 divisions for P4P Ranking
  const allP4PFighters: EnrichedP4PFighter[] = useMemo(() => {
    const combined: EnrichedP4PFighter[] = [];

    DIVISIONS.forEach((div) => {
      const list = rankingsByDivision[div.id] || [];
      list.forEach((f, idx) => {
        const stats = parseFighterStats(f);
        combined.push({
          ...f,
          divisionId: div.id,
          divisionLabel: div.label,
          divisionRange: div.heightRange,
          divisionColor: div.color,
          divisionRank: idx + 1,
          ...stats
        });
      });
    });

    // Apply Sorting logic
    if (p4pSortBy === 'WINS') {
      return combined.sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        return b.streakNumber - a.streakNumber;
      });
    } else if (p4pSortBy === 'STREAK') {
      return combined.sort((a, b) => {
        if (b.streakNumber !== a.streakNumber) return b.streakNumber - a.streakNumber;
        return b.wins - a.wins;
      });
    } else if (p4pSortBy === 'WINRATE') {
      return combined.sort((a, b) => {
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        return b.wins - a.wins;
      });
    } else {
      // CUSTOM / MANUAL ORDER
      return combined.sort((a, b) => {
        const indexA = p4pCustomOrderIds.indexOf(a.id);
        const indexB = p4pCustomOrderIds.indexOf(b.id);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return b.wins - a.wins; // fallback
      });
    }
  }, [rankingsByDivision, p4pSortBy, p4pCustomOrderIds]);

  // Top P4P Champion
  const topP4PChampion = allP4PFighters.length > 0 ? allP4PFighters[0] : null;

  // Filtered P4P Fighters (by club if selected)
  const filteredP4PFighters = useMemo(() => {
    if (selectedClubFilter === 'ALL') return allP4PFighters;
    return allP4PFighters.filter(f => f.clubId === selectedClubFilter);
  }, [allP4PFighters, selectedClubFilter]);

  // Aggregate Stats
  const totalFightersCount = allP4PFighters.length;
  const totalWinsCount = allP4PFighters.reduce((acc, f) => acc + f.wins, 0);

  // Tab change handler
  const handleTabChange = (tab: RankingTab) => {
    setActiveTab(tab);
    if (tab !== 'P4P') {
      const divMeta = DIVISIONS.find(d => d.id === tab);
      if (divMeta) {
        setFormHeight(divMeta.defaultHeight);
      }
    }
  };

  // Add Fighter (Auto-sorted by points)
  const handleAddFighter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const targetDiv = activeTab === 'P4P' ? formTargetDivision : activeTab;
    const divMeta = DIVISIONS.find(d => d.id === targetDiv) || DIVISIONS[0];
    const clubMeta = GAKURAN_CLUBS.find(c => c.id === selectedClubId) || GAKURAN_CLUBS[0];
    const currentList = rankingsByDivision[targetDiv] || [];

    const newFighter: RankedFighterItem = {
      id: `ranked-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: formName.trim().toUpperCase(),
      nickname: formNickname.trim() ? formNickname.trim().toUpperCase() : undefined,
      height: formHeight.trim() || divMeta.defaultHeight,
      record: `${formWins}-${formLosses}-${formDraws}`,
      streak: formStreak.trim().toUpperCase() || 'W1',
      fightingStyle: formStyle.trim().toUpperCase() || 'BANCHO COMBAT',
      imageUrl: clubMeta.logoUrl,
      clubId: clubMeta.id,
      clubName: clubMeta.name,
      clubCategory: clubMeta.subtitle,
      clubLogoUrl: clubMeta.logoUrl,
      clubColor: clubMeta.themeColor,
      movement: 'NEW',
      isChampion: currentList.length === 0,
      points: 0,
      koCount: 0,
      kdCount: 0,
      dominanceCount: 0
    };

    setRankingsByDivision(prev => {
      const list = prev[targetDiv] || [];
      const updated = [...list, newFighter];
      const autoSorted = sortByPointsDesc(updated);
      return {
        ...prev,
        [targetDiv]: autoSorted
      };
    });

    // Reset Form
    setFormName('');
    setFormNickname('');
    setFormWins(10);
    setFormLosses(1);
    setFormDraws(0);
    setFormStreak('W3');
  };

  // Add / Adjust Points for Fighter in Division (AUTO-SORTS IMMEDIATELY SO FIGHTERS WITH MORE POINTS CLIMB AUTOMATICALLY!)
    const handleAddPoints = (fighterId: string, delta: number, divisionId?: UgcDivision) => {
    // Si este peleador está en cooldown, ignora el clic (evita sumas accidentales por clics rápidos)
    if (pointsCooldownRef.current.has(fighterId)) return;
    pointsCooldownRef.current.add(fighterId);
    setTimeout(() => {
      pointsCooldownRef.current.delete(fighterId);
    }, 400);

    const targetDiv = divisionId || (activeTab !== 'P4P' ? (activeTab as UgcDivision) : null);
    if (!targetDiv) return;

    setRankingsByDivision(prev => {
      const list = prev[targetDiv] || [];
      const updated = list.map(f => {
        if (f.id === fighterId) {
          const currentPoints = f.points ?? 0;
          const newPoints = Math.max(0, currentPoints + delta);
          
          let currentKo = f.koCount ?? 0;
          let currentDom = f.dominanceCount ?? 0;
          let currentKd = f.kdCount ?? 0;

          if (delta === 3) currentKo += 1;
          else if (delta === 2) currentDom += 1;
          else if (delta === 1) currentKd += 1;
          else if (delta === -1) {
            if (currentKd > 0) currentKd -= 1;
            else if (currentDom > 0) currentDom -= 1;
            else if (currentKo > 0) currentKo -= 1;
          }

          return { 
            ...f, 
            points: newPoints,
            koCount: currentKo,
            dominanceCount: currentDom,
            kdCount: currentKd
          };
        }
        return f;
      });
      // Auto-reorder so fighters with more points move up automatically!
      const autoSorted = sortByPointsDesc(updated);
      return {
        ...prev,
        [targetDiv]: autoSorted
      };
    });
  };

  // Open Save Season Modal
  const handleOpenSaveSeasonModal = () => {
    setSeasonNameInput('');
    setSeasonNotesInput('');
    setSavedSeasonSuccess(null);
    setIsSaveSeasonModalOpen(true);
  };

  // Save Season Snapshot to Local Storage under 'ugc_season_history_v1'
  const handleSaveSeason = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seasonNameInput.trim()) return;

    const newSnapshot: SeasonSnapshot = {
      id: `season-${Date.now()}`,
      name: seasonNameInput.trim().toUpperCase(),
      savedAt: new Date().toISOString(),
      notes: seasonNotesInput.trim() || undefined,
      divisions: DIVISIONS.map(div => {
        const divFighters = rankingsByDivision[div.id] || [];
        const sorted = sortByPointsDesc(divFighters);
        const divTotalPoints = sorted.reduce((sum, f) => sum + (f.points ?? 0), 0);
        return {
          divisionId: div.id,
          divisionLabel: div.label,
          divisionHeightRange: div.heightRange,
          divisionColor: div.color,
          champion: sorted[0] || undefined,
          fighters: [...sorted],
          totalFighters: sorted.length,
          totalPoints: divTotalPoints
        };
      }),
      totalFighters: totalFightersCount,
      totalPoints: totalPointsAllDivisions
    };

    try {
      const existingStr = localStorage.getItem(SEASON_HISTORY_STORAGE_KEY);
      const existing: SeasonSnapshot[] = existingStr ? JSON.parse(existingStr) : [];
      const updated = [newSnapshot, ...existing];
      localStorage.setItem(SEASON_HISTORY_STORAGE_KEY, JSON.stringify(updated));
      setSavedSeasonSuccess(`¡La "${newSnapshot.name}" se guardó exitosamente en la pestaña HISTORIA!`);
    } catch (err) {
      console.error('Error saving season snapshot', err);
    }
  };

  // Move Fighter UP in standard division
  const handleMoveUp = (index: number) => {
    if (activeTab === 'P4P' || index <= 0) return;
    const list = [...currentFighterList];
    const item = list[index];
    const previousItem = list[index - 1];

    list[index - 1] = { ...item, movement: '+1' };
    list[index] = { ...previousItem, movement: '-1' };

    setRankingsByDivision(prev => ({
      ...prev,
      [activeTab]: list
    }));
  };

  // Move Fighter DOWN in standard division
  const handleMoveDown = (index: number) => {
    if (activeTab === 'P4P' || index >= currentFighterList.length - 1) return;
    const list = [...currentFighterList];
    const item = list[index];
    const nextItem = list[index + 1];

    list[index] = { ...nextItem, movement: '+1' };
    list[index + 1] = { ...item, movement: '-1' };

    setRankingsByDivision(prev => ({
      ...prev,
      [activeTab]: list
    }));
  };

  // Move P4P Fighter UP in custom order
  const handleP4PMoveUp = (index: number) => {
    if (index <= 0) return;
    setP4pSortBy('CUSTOM');
    const currentOrder = allP4PFighters.map(f => f.id);
    const temp = currentOrder[index];
    currentOrder[index] = currentOrder[index - 1];
    currentOrder[index - 1] = temp;
    setP4pCustomOrderIds(currentOrder);
  };

  // Move P4P Fighter DOWN in custom order
  const handleP4PMoveDown = (index: number) => {
    if (index >= allP4PFighters.length - 1) return;
    setP4pSortBy('CUSTOM');
    const currentOrder = allP4PFighters.map(f => f.id);
    const temp = currentOrder[index];
    currentOrder[index] = currentOrder[index + 1];
    currentOrder[index + 1] = temp;
    setP4pCustomOrderIds(currentOrder);
  };

  // Delete fighter
  const handleDeleteFighter = (id: string, divisionId?: UgcDivision) => {
    const targetDiv = divisionId || (activeTab !== 'P4P' ? activeTab : null);
    if (!targetDiv) {
      // Find in any division
      setRankingsByDivision(prev => {
        const next = { ...prev };
        DIVISIONS.forEach(d => {
          next[d.id] = (next[d.id] || []).filter(f => f.id !== id);
        });
        return next;
      });
      return;
    }

    setRankingsByDivision(prev => ({
      ...prev,
      [targetDiv]: (prev[targetDiv] || []).filter(f => f.id !== id)
    }));
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFighter) return;

    const { fighter, divisionId } = editingFighter;

    setRankingsByDivision(prev => {
      const list = prev[divisionId] || [];
      const updated = list.map(f => 
        f.id === fighter.id ? fighter : f
      );
      const autoSorted = sortByPointsDesc(updated);
      return {
        ...prev,
        [divisionId]: autoSorted
      };
    });

    setEditingFighter(null);
  };

  // Clear all in division
  const handleClearDivision = () => {
    if (activeTab === 'P4P') {
      if (window.confirm('¿Estás seguro de vaciar todos los peleadores de TODAS las divisiones?')) {
        setRankingsByDivision({
          'PESO PLUMA (1.50 M O MENOS - 1.69 M)': [],
          'PESO WELTER (1.70 M - 1.89 M)': [],
          'PESO PESADO (1.90 M - 2.10 M)': []
        });
        setP4pCustomOrderIds([]);
      }
    } else {
      if (window.confirm(`¿Estás seguro de vaciar todos los peleadores de ${activeDivInfo.label}?`)) {
        setRankingsByDivision(prev => ({
          ...prev,
          [activeTab]: []
        }));
      }
    }
  };

  // Load sample data with assigned clubs across all 3 divisions
  const handleLoadSampleData = () => {
    const getClub = (id: string) => GAKURAN_CLUBS.find(c => c.id === id) || GAKURAN_CLUBS[0];

    const samplePluma: RankedFighterItem[] = [
      { 
        id: 'p1', 
        name: 'KENJIRO "DRAGON" SATO', 
        nickname: 'THE ROOFTOP PHANTOM', 
        height: '1.65 m', 
        record: '18-1-0', 
        streak: 'W8', 
        fightingStyle: 'KURE', 
        imageUrl: getClub('black-dragons').logoUrl, 
        clubId: 'black-dragons',
        clubName: getClub('black-dragons').name,
        clubCategory: getClub('black-dragons').subtitle,
        clubLogoUrl: getClub('black-dragons').logoUrl,
        clubColor: getClub('black-dragons').themeColor,
        movement: '0', 
        isChampion: true,
        points: 54,
        koCount: 12,
        dominanceCount: 6,
        kdCount: 6
      },
      { 
        id: 'p2', 
        name: 'RYOTA "VIPER" SHINDO', 
        nickname: 'SILENT SHADOW', 
        height: '1.60 m', 
        record: '14-2-0', 
        streak: 'W4', 
        fightingStyle: 'MUAYTHAI', 
        imageUrl: getClub('snakes-band').logoUrl, 
        clubId: 'snakes-band',
        clubName: getClub('snakes-band').name,
        clubCategory: getClub('snakes-band').subtitle,
        clubLogoUrl: getClub('snakes-band').logoUrl,
        clubColor: getClub('snakes-band').themeColor,
        movement: '+1', 
        points: 42,
        koCount: 8,
        dominanceCount: 6,
        kdCount: 6
      },
      { 
        id: 'p3', 
        name: 'KAZUMA TAKEDA', 
        nickname: 'FEATHER SPIKE', 
        height: '1.68 m', 
        record: '12-3-0', 
        streak: 'W2', 
        fightingStyle: 'CAPOEIRA', 
        imageUrl: getClub('karasuno-voleibol').logoUrl, 
        clubId: 'karasuno-voleibol',
        clubName: getClub('karasuno-voleibol').name,
        clubCategory: getClub('karasuno-voleibol').subtitle,
        clubLogoUrl: getClub('karasuno-voleibol').logoUrl,
        clubColor: getClub('karasuno-voleibol').themeColor,
        movement: '-1', 
        points: 36,
        koCount: 6,
        dominanceCount: 5,
        kdCount: 8
      }
    ];

    const sampleWelter: RankedFighterItem[] = [
      { 
        id: 'w1', 
        name: 'MARCUS "THE ANVIL" VANE', 
        nickname: 'UNTOUCHABLE BANCHO', 
        height: '1.82 m', 
        record: '24-3-0', 
        streak: 'W5', 
        fightingStyle: 'SLUGGER', 
        imageUrl: getClub('los-toman').logoUrl, 
        clubId: 'los-toman',
        clubName: getClub('los-toman').name,
        clubCategory: getClub('los-toman').subtitle,
        clubLogoUrl: getClub('los-toman').logoUrl,
        clubColor: getClub('los-toman').themeColor,
        movement: '0', 
        isChampion: true,
        points: 72,
        koCount: 16,
        dominanceCount: 8,
        kdCount: 8
      },
      { 
        id: 'w2', 
        name: 'DAIKI "GAMBLER" KUROSAWA', 
        nickname: 'HIGH ROLLER', 
        height: '1.76 m', 
        record: '19-2-0', 
        streak: 'W7', 
        fightingStyle: 'ALÍ', 
        imageUrl: getClub('aoiba-apuestas').logoUrl, 
        clubId: 'aoiba-apuestas',
        clubName: getClub('aoiba-apuestas').name,
        clubCategory: getClub('aoiba-apuestas').subtitle,
        clubLogoUrl: getClub('aoiba-apuestas').logoUrl,
        clubColor: getClub('aoiba-apuestas').themeColor,
        movement: '+2', 
        points: 57,
        koCount: 11,
        dominanceCount: 8,
        kdCount: 8
      },
      { 
        id: 'w3', 
        name: 'SHINJIRO MORI', 
        nickname: 'MARTIAL MONK', 
        height: '1.85 m', 
        record: '16-4-0', 
        streak: 'W1', 
        fightingStyle: 'WINGCHUN', 
        imageUrl: getClub('hyaku-artes-marciales').logoUrl, 
        clubId: 'hyaku-artes-marciales',
        clubName: getClub('hyaku-artes-marciales').name,
        clubCategory: getClub('hyaku-artes-marciales').subtitle,
        clubLogoUrl: getClub('hyaku-artes-marciales').logoUrl,
        clubColor: getClub('hyaku-artes-marciales').themeColor,
        movement: '-1', 
        points: 48,
        koCount: 8,
        dominanceCount: 8,
        kdCount: 8
      }
    ];

    const samplePesado: RankedFighterItem[] = [
      { 
        id: 'h1', 
        name: 'TAKESHI "COLOSSUS" OGAWA', 
        nickname: 'SHADOW OVERLORD', 
        height: '1.98 m', 
        record: '22-0-0', 
        streak: 'W22', 
        fightingStyle: 'WRESTLING', 
        imageUrl: getClub('ocult-club').logoUrl, 
        clubId: 'ocult-club',
        clubName: getClub('ocult-club').name,
        clubCategory: getClub('ocult-club').subtitle,
        clubLogoUrl: getClub('ocult-club').logoUrl,
        clubColor: getClub('ocult-club').themeColor,
        movement: '0', 
        isChampion: true,
        points: 66,
        koCount: 14,
        dominanceCount: 9,
        kdCount: 6
      },
      { 
        id: 'h2', 
        name: 'LORD VALENTINE', 
        nickname: 'ELITE EMPEROR', 
        height: '1.92 m', 
        record: '17-1-0', 
        streak: 'W6', 
        fightingStyle: 'HAKARI', 
        imageUrl: getClub('reika-elite').logoUrl, 
        clubId: 'reika-elite',
        clubName: getClub('reika-elite').name,
        clubCategory: getClub('reika-elite').subtitle,
        clubLogoUrl: getClub('reika-elite').logoUrl,
        clubColor: getClub('reika-elite').themeColor,
        movement: '+1', 
        points: 51,
        koCount: 10,
        dominanceCount: 7,
        kdCount: 7
      },
      { 
        id: 'h3', 
        name: 'VICTOR "THE SNOOP" CROSS', 
        nickname: 'HEADLINE CRUSHER', 
        height: '1.94 m', 
        record: '15-4-0', 
        streak: 'W3', 
        fightingStyle: 'STRIKER', 
        imageUrl: getClub('sera-watchers').logoUrl, 
        clubId: 'sera-watchers',
        clubName: getClub('sera-watchers').name,
        clubCategory: getClub('sera-watchers').subtitle,
        clubLogoUrl: getClub('sera-watchers').logoUrl,
        clubColor: getClub('sera-watchers').themeColor,
        movement: '-1', 
        points: 45,
        koCount: 8,
        dominanceCount: 6,
        kdCount: 9
      }
    ];

    setRankingsByDivision({
      'PESO PLUMA (1.50 M O MENOS - 1.69 M)': sortByPointsDesc(samplePluma),
      'PESO WELTER (1.70 M - 1.89 M)': sortByPointsDesc(sampleWelter),
      'PESO PESADO (1.90 M - 2.10 M)': sortByPointsDesc(samplePesado)
    });
  };

  // Filtered fighter list for standard division
  const filteredStandardFighters = activeTab !== 'P4P'
    ? (selectedClubFilter === 'ALL'
        ? currentFighterList
        : currentFighterList.filter(f => f.clubId === selectedClubFilter))
    : [];

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* Header & Division / P4P Selector Tabs */}
      <div className="flex flex-col gap-4 bg-[#1c1b1b] brutal-border p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[#333333] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-7 h-7 text-[#e61c24]" />
              <h1 className="font-headline-lg text-3xl md:text-4xl text-[#e5e2e1] uppercase m-0 leading-none">
                TABLA OFICIAL DE RANKINGS GAKURAN
              </h1>
            </div>
            <p className="font-label-caps text-xs text-[#a09e9e] mt-1.5 flex items-center gap-2 flex-wrap">
              <span>CLASIFICACIÓN POR DIVISIONES DE ESTATURA & TOP LIBRA POR LIBRA (P4P)</span>
              <span className="text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 border border-amber-600/40 rounded-xs">
                ⚡ AUTO-RANKING POR PUNTOS ACTIVO
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Guardar rankings de temporada button */}
            <button
              onClick={handleOpenSaveSeasonModal}
              className="bg-[#2a1718] hover:bg-[#3d1e20] text-amber-300 border border-amber-500/60 hover:border-amber-400 font-headline-sm text-base px-3.5 py-2 brutal-cut uppercase flex items-center gap-1.5 cursor-pointer transition-colors shadow-lg"
              title="Guardar y congelar las listas de rankings con sus respectivos puntos de esta temporada en la pestaña Historia"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>💾 GUARDAR TEMPORADA</span>
            </button>

            {onNavigateToHistory && (
              <button
                onClick={onNavigateToHistory}
                className="bg-[#1f1a1a] hover:bg-[#2c2222] text-[#c8c6c5] hover:text-white border border-[#444] font-headline-sm text-sm px-3 py-2 brutal-cut uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Ver archivo histórico de temporadas anteriores"
              >
                <HistoryIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>VER HISTORIA</span>
              </button>
            )}

            {activeTab !== 'P4P' && (
              <button
                onClick={() => setIsFormOpen(!isFormOpen)}
                className="bg-[#e61c24] hover:bg-[#c00015] text-white font-headline-sm text-lg px-4 py-2 brutal-cut uppercase flex items-center gap-2 cursor-pointer transition-colors shadow-lg"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isFormOpen ? 'OCULTAR FORMULARIO' : '+ INSCRIBIR PELEADOR'}</span>
              </button>
            )}

            {totalFightersCount === 0 && (
              <button
                onClick={handleLoadSampleData}
                className="bg-[#2a2a2a] hover:bg-[#353534] text-[#a09e9e] hover:text-white font-label-caps text-xs px-3 py-2 brutal-border uppercase transition-colors cursor-pointer"
                title="Cargar peleadores de ejemplo con clubes en las 3 divisiones"
              >
                CARGAR EJEMPLOS
              </button>
            )}
          </div>
        </div>

        {/* 4 Tabs: 3 Strict Divisions + P4P Top Global */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          
          {/* Division 1: Peso Pluma */}
          {DIVISIONS.map((div) => {
            const isSelected = activeTab === div.id;
            const count = (rankingsByDivision[div.id] || []).length;
            const champ = (rankingsByDivision[div.id] || [])[0];

            return (
              <button
                key={div.id}
                onClick={() => handleTabChange(div.id)}
                className={`p-3.5 text-left brutal-border transition-all flex flex-col justify-between relative overflow-hidden group cursor-pointer ${
                  isSelected
                    ? 'bg-[#262525] border-l-4 border-l-[#e61c24]'
                    : 'bg-[#141414] hover:bg-[#1f1e1e] border-l-4 border-l-transparent'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-label-caps text-[10px] text-[#a09e9e] font-bold block">
                      DIVISIÓN OFICIAL
                    </span>
                    <h3 className={`font-headline-sm text-xl sm:text-2xl uppercase m-0 leading-none mt-0.5 ${
                      isSelected ? 'text-white' : 'text-[#c8c6c5] group-hover:text-white'
                    }`}>
                      {div.label}
                    </h3>
                  </div>
                  <span className={`font-label-caps text-[11px] px-2 py-0.5 brutal-cut-sm font-bold ${
                    isSelected ? 'bg-[#e61c24] text-white' : 'bg-[#2a2a2a] text-[#a09e9e]'
                  }`}>
                    {count} PELEADORES
                  </span>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#333333] flex items-center justify-between text-xs font-label-caps">
                  <span className="text-[#ffb4ac] flex items-center gap-1 font-bold">
                    <Ruler className="w-3.5 h-3.5" />
                    {div.heightRange}
                  </span>
                  <span className="text-[#767575] text-[10px] truncate max-w-[110px] flex items-center gap-1">
                    {champ ? (
                      <span className="text-[#ffb4ac] truncate">👑 {champ.name.split(' ')[0]}</span>
                    ) : (
                      'VACANTE'
                    )}
                  </span>
                </div>
              </button>
            );
          })}

          {/* TAB 4: TOP P4P (LIBRA POR LIBRA) */}
          <button
            onClick={() => handleTabChange('P4P')}
            className={`p-3.5 text-left brutal-border transition-all flex flex-col justify-between relative overflow-hidden group cursor-pointer ${
              activeTab === 'P4P'
                ? 'bg-[#2a1a1c] border-l-4 border-l-amber-500 shadow-lg'
                : 'bg-[#181314] hover:bg-[#221a1c] border-l-4 border-l-transparent'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="font-label-caps text-[10px] text-amber-400 font-bold block flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  CLASIFICACIÓN GLOBAL
                </span>
                <h3 className={`font-headline-sm text-xl sm:text-2xl uppercase m-0 leading-none mt-0.5 ${
                  activeTab === 'P4P' ? 'text-amber-300' : 'text-white group-hover:text-amber-200'
                }`}>
                  TOP P4P (LIBRA X LIBRA)
                </h3>
              </div>
              <span className={`font-label-caps text-[11px] px-2 py-0.5 brutal-cut-sm font-bold ${
                activeTab === 'P4P' ? 'bg-amber-500 text-black' : 'bg-[#2a2a2a] text-amber-400'
              }`}>
                {totalFightersCount} TOTAL
              </span>
            </div>

            <div className="mt-2.5 pt-2 border-t border-[#333333] flex items-center justify-between text-xs font-label-caps">
              <span className="text-amber-400 flex items-center gap-1 font-bold">
                <Trophy className="w-3.5 h-3.5" />
                {totalWinsCount} VICTORIAS
              </span>
              <span className="text-[#a09e9e] text-[10px] truncate max-w-[120px] flex items-center gap-1">
                {topP4PChampion ? (
                  <span className="text-amber-300 font-bold truncate">👑 #1 {topP4PChampion.name.split(' ')[0]}</span>
                ) : (
                  'SIN RANKING'
                )}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* P4P HERO BANNER & STATS (Visible only when in P4P tab)                    */}
      {/* ========================================================================= */}
      {activeTab === 'P4P' && (
        <div className="flex flex-col gap-4">
          
          {/* P4P #1 Spotlight */}
          <div className="bg-gradient-to-r from-[#2a1718] via-[#1c1b1b] to-[#171717] brutal-border border-l-4 border-l-amber-500 p-4 sm:p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-4 sm:gap-6 z-10">
              <div className="w-20 h-20 bg-[#0a0a0a] border-2 border-amber-400 flex items-center justify-center brutal-cut shrink-0 shadow-2xl relative overflow-hidden group">
                {topP4PChampion?.clubLogoUrl || topP4PChampion?.imageUrl ? (
                  <img
                    src={topP4PChampion.clubLogoUrl || topP4PChampion.imageUrl}
                    alt="P4P #1 Club Logo"
                    className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Flame className="w-10 h-10 text-amber-400" />
                )}
                <div className="absolute top-0 left-0 bg-amber-500 text-black font-headline-sm text-xs px-1.5 py-0.5 font-bold">
                  #1 P4P
                </div>
              </div>

              <div>
                <div className="font-label-caps text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-2 flex-wrap">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>REY LIBRA POR LIBRA DEL INSTITUTO GAKURAN · TODAS LAS DIVISIONES</span>
                  {topP4PChampion && (
                    <span 
                      className="px-2 py-0.5 text-[10px] font-bold text-black uppercase"
                      style={{ backgroundColor: topP4PChampion.clubColor || '#eab308' }}
                    >
                      CLUB: {topP4PChampion.clubName}
                    </span>
                  )}
                </div>

                <h2 className="font-headline-lg text-3xl sm:text-5xl text-white uppercase m-0 leading-none mt-1">
                  {topP4PChampion ? topP4PChampion.name : 'RANKING P4P SIN PELEADORES'}
                </h2>

                <div className="font-label-caps text-xs text-[#a09e9e] mt-1.5 flex items-center gap-3 flex-wrap">
                  {topP4PChampion ? (
                    <>
                      <span className="text-amber-300 font-bold flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        {topP4PChampion.wins} VICTORIAS TOTALES
                      </span>
                      <span>·</span>
                      <span className="text-white font-bold">RÉCORD: {topP4PChampion.record}</span>
                      <span>·</span>
                      <span className="text-emerald-400 font-bold">RACHA: {topP4PChampion.streak}</span>
                      <span>·</span>
                      <span className="text-[#ffb4ac] font-bold">DIVISIÓN: {topP4PChampion.divisionLabel} ({topP4PChampion.height})</span>
                    </>
                  ) : (
                    <span>Inscribe peleadores en las 3 categorías para computar el Top Libra por Libra mundial</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick P4P Stats Cards */}
            {topP4PChampion && (
              <div className="flex gap-2 sm:gap-3 z-10 w-full lg:w-auto justify-start lg:justify-end flex-wrap">
                <div className="bg-[#141414] brutal-border p-3 flex flex-col items-center min-w-[100px]">
                  <span className="font-label-caps text-[10px] text-[#a09e9e] uppercase">VICTORIAS #1</span>
                  <span className="font-headline-lg text-2xl text-amber-400 leading-none mt-1">
                    {topP4PChampion.wins}
                  </span>
                </div>
                <div className="bg-[#141414] brutal-border p-3 flex flex-col items-center min-w-[100px]">
                  <span className="font-label-caps text-[10px] text-[#a09e9e] uppercase">EFECTIVIDAD</span>
                  <span className="font-headline-lg text-2xl text-emerald-400 leading-none mt-1">
                    {topP4PChampion.winRate}%
                  </span>
                </div>
                <button
                  onClick={() => onBookFighter(topP4PChampion.id)}
                  className="bg-[#e61c24] hover:bg-[#c00015] text-white font-headline-sm text-lg px-4 py-2 brutal-cut uppercase flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Swords className="w-4 h-4" />
                  <span>DESAFIAR AL #1 P4P</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STANDARD DIVISION CHAMPION BANNER (Visible only in Pluma/Welter/Pesado)   */}
      {/* ========================================================================= */}
      {activeTab !== 'P4P' && (
        <div className="bg-[#1c1b1b] brutal-border border-l-4 border-l-[#ffb4ac] p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden">
          <div className="flex items-center gap-4 z-10">
            <div className="w-16 h-16 bg-[#131313] border-2 border-[#ffb4ac] flex items-center justify-center brutal-cut shrink-0 shadow-lg relative overflow-hidden group">
              {championFighter?.clubLogoUrl || championFighter?.imageUrl ? (
                <img
                  src={championFighter.clubLogoUrl || championFighter.imageUrl}
                  alt="Champion Club Logo"
                  className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Award className="w-9 h-9 text-[#ffb4ac]" />
              )}
            </div>
            <div>
              <div className="font-label-caps text-xs text-[#ffb4ac] font-bold uppercase tracking-wider flex items-center gap-2 flex-wrap">
                <CrownIcon />
                <span>CAMPEÓN INDISCUTIBLE · {activeDivInfo.label} ({activeDivInfo.heightRange})</span>
                {championFighter?.clubName && (
                  <span 
                    className="px-2 py-0.5 text-[10px] font-bold text-black uppercase"
                    style={{ backgroundColor: championFighter.clubColor || '#e61c24' }}
                  >
                    CLUB: {championFighter.clubName}
                  </span>
                )}
              </div>
              <h2 className="font-headline-lg text-3xl sm:text-4xl text-white uppercase m-0 leading-none mt-1">
                {championFighter ? championFighter.name : 'TÍTULO VACANTE - SIN CAMPEÓN'}
              </h2>
              <div className="font-label-caps text-xs text-[#a09e9e] mt-1 flex items-center gap-3 flex-wrap">
                {championFighter ? (
                  <>
                    <span className="text-white font-bold">RÉCORD: {championFighter.record}</span>
                    <span>·</span>
                    <span className="text-emerald-400 font-bold">RACHA: {championFighter.streak}</span>
                    <span>·</span>
                    <span>ESTATURA: {championFighter.height}</span>
                    {championFighter.clubCategory && (
                      <>
                        <span>·</span>
                        <span className="text-[#c8c6c5]">{championFighter.clubCategory}</span>
                      </>
                    )}
                  </>
                ) : (
                  <span>Inscribe peleadores abajo asignando su club para coronar al número 1 de la división</span>
                )}
              </div>
            </div>
          </div>

          {championFighter && (
            <div className="flex gap-2 z-10">
              <button
                onClick={() => onBookFighter(championFighter.id)}
                className="bg-[#e61c24] hover:bg-[#c00015] text-white font-headline-sm text-lg px-4 py-2 brutal-cut uppercase flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Swords className="w-4 h-4" />
                <span>DEFENDER TÍTULO</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* FORM TO ADD FIGHTER (Only displayed in the 3 standard weight divisions)   */}
      {/* ========================================================================= */}
      {isFormOpen && activeTab !== 'P4P' && (
        <div className="bg-[#1c1b1b] brutal-border p-5 border-t-2 border-t-[#e61c24] animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 border-b border-[#333333] pb-2">
            <h2 className="font-headline-sm text-2xl text-white uppercase flex items-center gap-2 m-0">
              <UserPlus className="w-5 h-5 text-[#e61c24]" />
              INSCRIBIR NUEVO PELEADOR EN {activeDivInfo.label}
            </h2>
            <span className="font-label-caps text-xs text-[#ffb4ac] font-bold">
              Rango requerido: {activeDivInfo.heightRange}
            </span>
          </div>

          <form onSubmit={handleAddFighter} className="flex flex-col gap-4">

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-label-caps text-[11px] text-[#a09e9e] uppercase block mb-1">
                  Nombre del Peleador *
                </label>
                <input
                  type="text"
                  required
                  placeholder="EJ: KENJIRO TAKEDA"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#131313] brutal-border p-2.5 font-label-caps text-xs text-white uppercase focus:border-[#e61c24] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-label-caps text-[11px] text-[#a09e9e] uppercase block mb-1">
                  Apodo / Sobrenombre
                </label>
                <input
                  type="text"
                  placeholder='EJ: "EL DRAGÓN NEGRO"'
                  value={formNickname}
                  onChange={(e) => setFormNickname(e.target.value)}
                  className="w-full bg-[#131313] brutal-border p-2.5 font-label-caps text-xs text-[#ffb4ac] uppercase focus:border-[#e61c24] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-label-caps text-[11px] text-[#a09e9e] uppercase block mb-1">
                  Estatura (Rango: {activeDivInfo.heightRange}) *
                </label>
                <select
                  required
                  value={formHeight}
                  onChange={(e) => setFormHeight(e.target.value)}
                  className="w-full bg-[#131313] brutal-border p-2.5 font-label-caps text-xs text-white uppercase focus:border-[#e61c24] focus:outline-none cursor-pointer"
                >
                  {(DIVISION_HEIGHTS[activeDivInfo.id] || []).map((heightOption) => (
                    <option key={heightOption} value={heightOption} className="bg-[#131313] text-white">
                      {heightOption}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="font-label-caps text-[11px] text-[#a09e9e] uppercase block mb-1">
                  Récord de Combate Oficial (Victorias - Derrotas - Empates)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <div>
                    <span className="text-[9px] font-label-caps text-emerald-400 block mb-0.5 font-bold">VICTORIAS</span>
                    <input
                      type="number"
                      min="0"
                      value={formWins}
                      onChange={(e) => setFormWins(Number(e.target.value))}
                      className="w-full bg-[#131313] brutal-border p-2 font-label-caps text-xs text-emerald-400 font-bold text-center focus:border-emerald-500 focus:outline-none"
                      title="Victorias"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] font-label-caps text-red-400 block mb-0.5 font-bold">DERROTAS</span>
                    <input
                      type="number"
                      min="0"
                      value={formLosses}
                      onChange={(e) => setFormLosses(Number(e.target.value))}
                      className="w-full bg-[#131313] brutal-border p-2 font-label-caps text-xs text-red-400 font-bold text-center focus:border-red-500 focus:outline-none"
                      title="Derrotas"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] font-label-caps text-amber-400 block mb-0.5 font-bold">EMPATES</span>
                    <input
                      type="number"
                      min="0"
                      value={formDraws}
                      onChange={(e) => setFormDraws(Number(e.target.value))}
                      className="w-full bg-[#131313] brutal-border p-2 font-label-caps text-xs text-amber-400 font-bold text-center focus:border-amber-500 focus:outline-none"
                      title="Empates"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-label-caps text-[11px] text-[#a09e9e] uppercase block mb-1">
                  Racha Actual
                </label>
                <input
                  type="text"
                  placeholder="EJ: W5 o L1"
                  value={formStreak}
                  onChange={(e) => setFormStreak(e.target.value)}
                  className="w-full bg-[#131313] brutal-border p-2 font-label-caps text-xs text-white uppercase focus:border-[#e61c24] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-label-caps text-[11px] text-[#a09e9e] uppercase block mb-1">
                  Estilo / Disciplina
                </label>
                <select
                  value={formStyle}
                  onChange={(e) => setFormStyle(e.target.value as FightingStyle)}
                  className="w-full bg-[#131313] brutal-border p-2 font-label-caps text-xs text-white uppercase focus:border-[#e61c24] focus:outline-none cursor-pointer"
                >
                  {FIGHTING_STYLES.map((style) => (
                    <option key={style} value={style} className="bg-[#131313] text-white">
                      {style}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* SELECCIÓN DE CLUBES OFICIALES DEL INSTITUTO */}
            <div className="border-t border-[#333333] pt-3">
              <div className="flex justify-between items-center mb-2">
                <label className="font-label-caps text-xs text-[#ffb4ac] font-bold uppercase flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#e61c24]" />
                  <span>SELECCIONAR CLUB OFICIAL DEL PELEADOR (EMBLEMA & AFILIACIÓN)</span>
                </label>
                <span className="font-label-caps text-[11px] text-[#a09e9e]">
                  Club seleccionado: <strong className="text-white">{activeSelectedClub.name}</strong> ({activeSelectedClub.category})
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2.5">
                {GAKURAN_CLUBS.map((club) => {
                  const isSelected = selectedClubId === club.id;
                  return (
                    <button
                      key={club.id}
                      type="button"
                      onClick={() => setSelectedClubId(club.id)}
                      className={`p-2 brutal-border flex flex-col items-center gap-1.5 transition-all text-left relative overflow-hidden group cursor-pointer ${
                        isSelected 
                          ? 'bg-[#222121] border-2 border-white shadow-xl scale-[1.03]' 
                          : 'bg-[#131313] hover:bg-[#1e1d1d] opacity-80 hover:opacity-100'
                      }`}
                      style={{
                        borderColor: isSelected ? club.themeColor : undefined
                      }}
                    >
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#0a0a0a] rounded-sm p-1 flex items-center justify-center relative overflow-hidden border border-[#2a2a2a] group-hover:border-white transition-colors">
                        <img
                          src={club.logoUrl}
                          alt={club.name}
                          className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="w-full text-center">
                        <span 
                          className="font-headline-sm text-xs block leading-tight truncate uppercase"
                          style={{ color: isSelected ? club.themeColor : '#e5e2e1' }}
                        >
                          {club.name}
                        </span>
                        <span className="font-label-caps text-[8px] text-[#767575] block truncate mt-0.5">
                          {club.subtitle}
                        </span>
                      </div>

                      {isSelected && (
                        <div 
                          className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-black font-bold text-[9px]"
                          style={{ backgroundColor: club.themeColor }}
                        >
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#e61c24] hover:bg-[#c00015] text-white font-headline-md text-2xl py-3 brutal-cut uppercase glitch-hover transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl mt-2"
            >
              <Plus className="w-5 h-5" />
              <span>INSERTAR PELEADOR EN {activeDivInfo.label}</span>
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN RANKINGS TABLE (P4P View or Standard Division View)                  */}
      {/* ========================================================================= */}
      <div className="bg-[#1c1b1b] brutal-border overflow-hidden shadow-2xl">
        
        {/* Table Header Bar */}
        <div className="p-3.5 bg-[#131313] border-b border-[#333333] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-headline-sm text-2xl text-white uppercase leading-none flex items-center gap-2">
              {activeTab === 'P4P' ? (
                <>
                  <Flame className="w-6 h-6 text-amber-400" />
                  <span>TOP LIBRA POR LIBRA (P4P) · TODAS LAS CATEGORÍAS</span>
                </>
              ) : (
                <span>CLASIFICACIÓN OFICIAL: {activeDivInfo.label}</span>
              )}
            </span>
            <span className={`font-label-caps text-[10px] px-2 py-0.5 uppercase font-bold ${
              activeTab === 'P4P' ? 'bg-amber-500 text-black' : 'bg-[#e61c24] text-white'
            }`}>
              {activeTab === 'P4P' ? `${filteredP4PFighters.length} EN EL TOP GLOBAL` : `${currentFighterList.length} REGISTRADOS`}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end flex-wrap">
            
            {/* P4P Specific Sorting Toggles */}
            {activeTab === 'P4P' && (
              <div className="flex items-center gap-1 bg-[#1a1a1a] p-1 brutal-border">
                <span className="font-label-caps text-[10px] text-[#a09e9e] px-1 hidden sm:inline">
                  ORDENAR:
                </span>
                <button
                  onClick={() => setP4pSortBy('WINS')}
                  className={`px-2 py-1 text-[10px] font-label-caps font-bold transition-colors ${
                    p4pSortBy === 'WINS' ? 'bg-emerald-600 text-white' : 'text-[#a09e9e] hover:text-white'
                  }`}
                  title="Ordenar por mayor cantidad de victorias"
                >
                  🏆 MÁS VICTORIAS
                </button>
                <button
                  onClick={() => setP4pSortBy('STREAK')}
                  className={`px-2 py-1 text-[10px] font-label-caps font-bold transition-colors ${
                    p4pSortBy === 'STREAK' ? 'bg-amber-600 text-white' : 'text-[#a09e9e] hover:text-white'
                  }`}
                  title="Ordenar por mayor racha de victorias"
                >
                  🔥 RACHA
                </button>
                <button
                  onClick={() => setP4pSortBy('WINRATE')}
                  className={`px-2 py-1 text-[10px] font-label-caps font-bold transition-colors ${
                    p4pSortBy === 'WINRATE' ? 'bg-blue-600 text-white' : 'text-[#a09e9e] hover:text-white'
                  }`}
                  title="Ordenar por porcentaje de efectividad"
                >
                  % EFECTIVIDAD
                </button>
                <button
                  onClick={() => setP4pSortBy('CUSTOM')}
                  className={`px-2 py-1 text-[10px] font-label-caps font-bold transition-colors ${
                    p4pSortBy === 'CUSTOM' ? 'bg-[#e61c24] text-white' : 'text-[#a09e9e] hover:text-white'
                  }`}
                  title="Orden manual usando botones ▲/▼"
                >
                  MANUAL
                </button>
              </div>
            )}

            {/* Club Filter Selector */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#a09e9e]" />
              <select
                value={selectedClubFilter}
                onChange={(e) => setSelectedClubFilter(e.target.value)}
                className="bg-[#1e1e1e] brutal-border text-xs font-label-caps text-white px-2.5 py-1 uppercase focus:outline-none"
              >
                <option value="ALL">TODOS LOS CLUBES ({activeTab === 'P4P' ? allP4PFighters.length : currentFighterList.length})</option>
                {GAKURAN_CLUBS.map((c) => {
                  const count = activeTab === 'P4P'
                    ? allP4PFighters.filter(f => f.clubId === c.id).length
                    : currentFighterList.filter(f => f.clubId === c.id).length;
                  return (
                    <option key={c.id} value={c.id}>
                      {c.name} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {(activeTab === 'P4P' ? totalFightersCount > 0 : currentFighterList.length > 0) && (
              <button
                onClick={handleClearDivision}
                className="text-[#767575] hover:text-[#e61c24] font-label-caps text-xs flex items-center gap-1 transition-colors p-1 cursor-pointer"
                title={activeTab === 'P4P' ? 'Vaciar todas las divisiones' : 'Vaciar tabla'}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">VACIAR</span>
              </button>
            )}
          </div>
        </div>

        {/* Columns Legend */}
        {activeTab === 'P4P' ? (
          <div className="p-3 bg-[#181717] border-b border-[#2a2a2a] grid grid-cols-12 font-label-caps text-[11px] text-[#767575] uppercase font-bold">
            <div className="col-span-3 sm:col-span-2 text-center">RANGO P4P</div>
            <div className="col-span-4 sm:col-span-4">PELEADOR / CLUB ASIGNADO</div>
            <div className="hidden sm:block sm:col-span-2 text-center">CATEGORÍA DE PESO</div>
            <div className="col-span-3 sm:col-span-2 text-center text-emerald-400">🏆 VICTORIAS & RÉCORD</div>
            <div className="col-span-2 sm:col-span-2 text-right pr-2">AJUSTAR P4P</div>
          </div>
        ) : (
          <div className="p-3 bg-[#181717] border-b border-[#2a2a2a] grid grid-cols-12 font-label-caps text-[11px] text-[#767575] uppercase font-bold items-center">
            <div className="col-span-2 sm:col-span-1 text-center">POS</div>
            <div className="col-span-4 sm:col-span-3">PELEADOR / CLUB</div>
            <div className="hidden lg:block lg:col-span-2 text-center">ESTATURA & ESTILO</div>
            <div className="hidden sm:block sm:col-span-2 text-center">
              <span className="block">RÉCORD & RACHA</span>
              <span className="text-[8px] text-[#888] font-normal tracking-wide lowercase">
                (<span className="text-emerald-400 font-bold">victorias</span> · <span className="text-red-400 font-bold">derrotas</span> · <span className="text-amber-400 font-bold">empates</span>)
              </span>
            </div>
            <div className="col-span-4 sm:col-span-3 text-center text-amber-400 font-bold flex items-center justify-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>GESTIÓN DE PUNTOS</span>
            </div>
            <div className="col-span-2 sm:col-span-1 text-right pr-2">RANGO</div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* P4P TAB LIST RENDERING                                                    */}
        {/* ========================================================================= */}
        {activeTab === 'P4P' ? (
          filteredP4PFighters.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 bg-[#2a2a2a] flex items-center justify-center brutal-cut text-[#767575]">
                <Flame className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="font-headline-sm text-2xl text-[#e5e2e1] uppercase m-0">
                NO HAY PELEADORES EN EL TOP P4P
              </h3>
              <p className="font-body-md text-sm text-[#a09e9e] max-w-md m-0">
                Inscribe peleadores en cualquiera de las 3 divisiones o carga los peleadores de ejemplo para ver el Top Libra por Libra clasificado por victorias.
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="bg-[#e61c24] hover:bg-[#c00015] text-white font-headline-sm text-lg px-4 py-2 brutal-cut uppercase flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>INSCRIBIR PELEADOR</span>
                </button>
                <button
                  onClick={handleLoadSampleData}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-headline-sm text-lg px-4 py-2 brutal-cut uppercase flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Trophy className="w-4 h-4" />
                  <span>CARGAR EJEMPLOS CON CLUBES</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#2a2a2a]">
              {filteredP4PFighters.map((item, p4pIndex) => {
                const isP4PKing = p4pIndex === 0;
                const clubInfo = GAKURAN_CLUBS.find(c => c.id === item.clubId) || {
                  name: item.clubName || 'SIN CLUB',
                  subtitle: item.clubCategory || 'INDEPENDIENTE',
                  logoUrl: item.clubLogoUrl || item.imageUrl || GAKURAN_CLUBS[0].logoUrl,
                  themeColor: item.clubColor || '#e61c24'
                };

                return (
                  <div
                    key={item.id}
                    className={`p-3 sm:p-4 grid grid-cols-12 items-center hover:bg-[#222121] transition-all ${
                      isP4PKing ? 'bg-[#241c1d] border-l-4 border-l-amber-500' : ''
                    }`}
                  >
                    {/* P4P Position Badge */}
                    <div className="col-span-3 sm:col-span-2 flex items-center justify-center gap-1.5">
                      <div className={`font-headline-sm text-xl sm:text-2xl flex items-center gap-1 ${
                        isP4PKing ? 'text-amber-400 font-bold' : p4pIndex === 1 ? 'text-[#ffb4ac] font-bold' : p4pIndex === 2 ? 'text-[#e61c24]' : 'text-white'
                      }`}>
                        {isP4PKing && <CrownIcon />}
                        <span>#{p4pIndex + 1} P4P</span>
                      </div>

                      {isP4PKing && (
                        <span className="font-label-caps text-[9px] bg-amber-500 text-black px-1.5 py-0.2 font-bold brutal-cut-sm hidden sm:inline">
                          REY P4P
                        </span>
                      )}
                    </div>

                    {/* Fighter Info & Club Badge */}
                    <div className="col-span-4 sm:col-span-4 flex items-center gap-3">
                      {/* Club Logo */}
                      <div 
                        className="w-11 h-11 bg-[#0a0a0a] rounded-sm p-1 border flex items-center justify-center shrink-0 shadow-md group relative cursor-pointer"
                        style={{ borderColor: clubInfo.themeColor }}
                        title={`Club: ${clubInfo.name} (${clubInfo.subtitle})`}
                      >
                        <img
                          src={clubInfo.logoUrl}
                          alt={clubInfo.name}
                          className="w-full h-full object-contain filter drop-shadow hover:scale-110 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="truncate">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-headline-sm text-base sm:text-xl text-[#e5e2e1] uppercase leading-tight truncate">
                            {item.name}
                          </span>
                        </div>
                        
                        {item.nickname && (
                          <span className="font-label-caps text-[10px] text-amber-300 font-bold block truncate">
                            "{item.nickname}"
                          </span>
                        )}

                        {/* Club badge */}
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span 
                            className="font-label-caps text-[9px] font-bold px-1.5 py-0.2 border uppercase rounded-xs"
                            style={{ 
                              color: clubInfo.themeColor,
                              borderColor: `${clubInfo.themeColor}55`,
                              backgroundColor: `${clubInfo.themeColor}15`
                            }}
                          >
                            {clubInfo.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Division of Origin */}
                    <div className="hidden sm:flex sm:col-span-2 flex-col items-center justify-center font-label-caps text-xs">
                      <span className="font-bold text-white uppercase text-center px-1.5 py-0.5 bg-[#141414] brutal-border">
                        {item.divisionLabel}
                      </span>
                      <span className="text-[10px] text-[#ffb4ac] mt-0.5">
                        {item.height} (Div #{item.divisionRank})
                      </span>
                    </div>

                    {/* WINS (Highlighted Prominently for P4P) & Record */}
                    <div className="col-span-3 sm:col-span-2 flex flex-col items-center justify-center font-label-caps text-xs">
                      <div className="flex items-center gap-1">
                        <span className="font-headline-sm text-xl sm:text-2xl text-emerald-400 font-bold leading-none">
                          {item.wins}
                        </span>
                        <span className="text-[10px] text-emerald-300 font-bold uppercase">
                          VICTORIAS
                        </span>
                      </div>
                      <span className="text-[10px] text-[#a09e9e] font-mono mt-0.5">
                        RÉCORD: {item.record} ({item.winRate}%)
                      </span>
                      <span className={`px-1.5 py-0.2 text-[9px] font-bold mt-0.5 brutal-border ${
                        item.streak.startsWith('W') ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' : 'bg-red-950/80 text-red-300 border-red-800'
                      }`}>
                        RACHA: {item.streak}
                      </span>
                    </div>

                    {/* P4P Action Buttons */}
                    <div className="col-span-2 sm:col-span-2 flex items-center justify-end gap-1 sm:gap-1.5 pr-1">
                      
                      {/* Move UP in P4P */}
                      <button
                        onClick={() => handleP4PMoveUp(p4pIndex)}
                        disabled={p4pIndex === 0}
                        className={`p-1.5 sm:p-2 brutal-cut-sm transition-all ${
                          p4pIndex === 0
                            ? 'bg-[#1e1e1e] text-[#444444] cursor-not-allowed opacity-40'
                            : 'bg-[#2a2a2a] hover:bg-emerald-600 text-white cursor-pointer hover:scale-105'
                        }`}
                        title="Subir posición P4P (▲)"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>

                      {/* Move DOWN in P4P */}
                      <button
                        onClick={() => handleP4PMoveDown(p4pIndex)}
                        disabled={p4pIndex === filteredP4PFighters.length - 1}
                        className={`p-1.5 sm:p-2 brutal-cut-sm transition-all ${
                          p4pIndex === filteredP4PFighters.length - 1
                            ? 'bg-[#1e1e1e] text-[#444444] cursor-not-allowed opacity-40'
                            : 'bg-[#2a2a2a] hover:bg-[#e61c24] text-white cursor-pointer hover:scale-105'
                        }`}
                        title="Bajar posición P4P (▼)"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>

                      {/* Quick Edit button */}
                      <button
                        onClick={() => setEditingFighter({ fighter: item, divisionId: item.divisionId })}
                        className="bg-[#2a2a2a] hover:bg-[#353534] text-[#a09e9e] hover:text-white p-1.5 sm:p-2 brutal-cut-sm transition-colors cursor-pointer hidden md:block"
                        title="Editar datos del peleador"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteFighter(item.id, item.divisionId)}
                        className="bg-[#2a2a2a] hover:bg-red-700 text-[#a09e9e] hover:text-white p-1.5 sm:p-2 brutal-cut-sm transition-colors cursor-pointer"
                        title="Eliminar peleador"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* ========================================================================= */
          /* STANDARD DIVISION VIEW RENDERING (Peso Pluma, Welter, Pesado)             */
          /* ========================================================================= */
          filteredStandardFighters.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 bg-[#2a2a2a] flex items-center justify-center brutal-cut text-[#767575]">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="font-headline-sm text-2xl text-[#e5e2e1] uppercase m-0">
                {selectedClubFilter === 'ALL' 
                  ? `DIVISIÓN VACÍA: ${activeDivInfo.label}`
                  : 'NO HAY PELEADORES EN ESTE CLUB'}
              </h3>
              <p className="font-body-md text-sm text-[#a09e9e] max-w-md m-0">
                {selectedClubFilter === 'ALL'
                  ? 'No hay peleadores registrados aún en esta división. Inscribe un peleador con su estatura y club para asignarle su rango.'
                  : 'Cambia el filtro de club o inscribe un nuevo peleador asignándolo a este club.'}
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => {
                    setSelectedClubFilter('ALL');
                    setIsFormOpen(true);
                  }}
                  className="bg-[#e61c24] hover:bg-[#c00015] text-white font-headline-sm text-lg px-4 py-2 brutal-cut uppercase flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>INSCRIBIR PELEADOR</span>
                </button>
                {currentFighterList.length === 0 && (
                  <button
                    onClick={handleLoadSampleData}
                    className="bg-[#2a2a2a] hover:bg-[#353534] text-white font-headline-sm text-lg px-4 py-2 brutal-cut uppercase flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>CARGAR EJEMPLOS</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#2a2a2a]">
              {filteredStandardFighters.map((item) => {
                const realIndex = currentFighterList.findIndex(f => f.id === item.id);
                const isChamp = realIndex === 0;
                const rankDisplay = isChamp ? 'C' : `#${realIndex + 1}`;

                const clubInfo = GAKURAN_CLUBS.find(c => c.id === item.clubId) || {
                  name: item.clubName || 'SIN CLUB',
                  subtitle: item.clubCategory || 'INDEPENDIENTE',
                  logoUrl: item.clubLogoUrl || item.imageUrl || GAKURAN_CLUBS[0].logoUrl,
                  themeColor: item.clubColor || '#e61c24'
                };

                return (
                  <div
                    key={item.id}
                    className={`p-3 sm:p-4 grid grid-cols-12 items-center hover:bg-[#222121] transition-all gap-1 sm:gap-2 ${
                      isChamp ? 'bg-[#201f1f] border-l-4 border-l-[#ffb4ac]' : ''
                    }`}
                  >
                    {/* Position Badge */}
                    <div className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1">
                      <div className={`font-headline-sm text-xl sm:text-2xl flex items-center gap-0.5 ${
                        isChamp ? 'text-[#ffb4ac] font-bold' : realIndex === 1 ? 'text-[#e61c24] font-bold' : 'text-white'
                      }`}>
                        {isChamp && <Award className="w-3.5 h-3.5 text-[#ffb4ac] hidden sm:inline" />}
                        <span>{rankDisplay}</span>
                      </div>

                      {isChamp && (
                        <span className="font-label-caps text-[8px] bg-[#ffb4ac] text-black px-1 py-0.2 font-bold brutal-cut-sm hidden md:inline">
                          C
                        </span>
                      )}
                    </div>

                    {/* Fighter Info & Club Badge */}
                    <div className="col-span-4 sm:col-span-3 flex items-center gap-2.5">
                      <div 
                        className="w-10 h-10 sm:w-11 sm:h-11 bg-[#0a0a0a] rounded-sm p-1 border flex items-center justify-center shrink-0 shadow-md group relative cursor-pointer"
                        style={{ borderColor: clubInfo.themeColor }}
                        title={`Club: ${clubInfo.name} (${clubInfo.subtitle})`}
                      >
                        <img
                          src={clubInfo.logoUrl}
                          alt={clubInfo.name}
                          className="w-full h-full object-contain filter drop-shadow hover:scale-110 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="truncate">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="font-headline-sm text-base sm:text-lg text-[#e5e2e1] uppercase leading-tight truncate">
                            {item.name}
                          </span>
                        </div>
                        
                        {item.nickname && (
                          <span className="font-label-caps text-[9px] text-[#ffb4ac] font-bold block truncate">
                            "{item.nickname}"
                          </span>
                        )}

                        <div className="flex items-center gap-1 mt-0.5">
                          <span 
                            className="font-label-caps text-[8px] font-bold px-1 py-0.2 border uppercase rounded-xs"
                            style={{ 
                              color: clubInfo.themeColor,
                              borderColor: `${clubInfo.themeColor}55`,
                              backgroundColor: `${clubInfo.themeColor}15`
                            }}
                          >
                            {clubInfo.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Height & Style */}
                    <div className="hidden lg:flex lg:col-span-2 flex-col items-center justify-center font-label-caps text-xs">
                      <span className="text-white font-bold">{item.height}</span>
                      <span className="text-[10px] text-[#a09e9e] truncate max-w-[120px]">
                        {item.fightingStyle || 'GAKURAN COMBAT'}
                      </span>
                    </div>

                    {/* Record & Streak */}
                    <div className="hidden sm:flex sm:col-span-2 flex-col items-center justify-center font-label-caps text-xs">
                      {(() => {
                        const parts = (item.record || '0-0-0').split('-');
                        const wins = parts[0] || '0';
                        const losses = parts[1] || '0';
                        const draws = parts[2] || '0';
                        return (
                          <div className="flex flex-col items-center gap-0.5">
                            <div className="flex items-center gap-1 font-headline-sm text-sm text-white font-bold bg-[#111] px-2 py-0.5 border border-[#2a2a2a] rounded-xs shadow-inner">
                              <span className="text-emerald-400 font-bold" title="Victorias">{wins} <span className="text-[8px] font-label-caps text-emerald-500 font-normal">V</span></span>
                              <span className="text-[#555]">-</span>
                              <span className="text-red-400 font-bold" title="Derrotas">{losses} <span className="text-[8px] font-label-caps text-red-500 font-normal">D</span></span>
                              <span className="text-[#555]">-</span>
                              <span className="text-amber-400 font-bold" title="Empates">{draws} <span className="text-[8px] font-label-caps text-amber-500 font-normal">E</span></span>
                            </div>
                            <div className="flex items-center gap-1 text-[8px] font-label-caps tracking-wider mt-0.5">
                              <span className="text-emerald-400 font-bold">VICTORIAS</span>
                              <span className="text-[#555]">•</span>
                              <span className="text-red-400 font-bold">DERROTAS</span>
                              <span className="text-[#555]">•</span>
                              <span className="text-amber-400 font-bold">EMPATES</span>
                            </div>
                          </div>
                        );
                      })()}
                      <span className={`px-1.5 py-0.2 text-[9px] font-bold mt-1 brutal-border ${
                        item.streak.startsWith('W') ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' : 'bg-red-950/80 text-red-300 border-red-800'
                      }`}>
                        RACHA: {item.streak}
                      </span>
                    </div>

                    {/* GESTIÓN DE PUNTOS */}
                    <div className="col-span-4 sm:col-span-3 flex flex-col items-center justify-center gap-1 bg-[#121212]/90 p-1.5 brutal-border border-[#2d2d2d] rounded-xs shadow-inner">
                      {/* Total Points Display */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-label-caps text-[#888888] font-bold uppercase tracking-wider">
                          PUNTOS:
                        </span>
                        <div className="bg-[#050505] px-2 py-0.5 border border-amber-500/50 rounded-xs flex items-center gap-1 shadow-inner">
                          <span className="font-headline-sm text-base sm:text-lg text-amber-400 font-bold leading-none">
                            {item.points ?? 0}
                          </span>
                          <span className="text-[8px] text-amber-500 font-label-caps font-bold">
                            PTS
                          </span>
                        </div>
                      </div>

                      {/* Points Action Buttons with Tooltip Legends */}
                      <div className="flex items-center gap-1 flex-wrap justify-center">
                        {/* Botón KO (+3 puntos) */}
                        <div className="relative group/btn">
                          <button
                            type="button"
                            onClick={() => handleAddPoints(item.id, 3)}
                            className="bg-[#42090e] hover:bg-[#b0101a] active:scale-95 text-red-200 hover:text-white border border-red-700/80 hover:border-red-400 font-headline-sm text-xs px-2 py-1 brutal-cut-sm flex items-center gap-1 transition-all cursor-pointer shadow-md"
                            title="Puntos por Knock Out"
                          >
                            <Flame className="w-3 h-3 text-red-400 group-hover/btn:text-white" />
                            <span>KO +3</span>
                          </button>
                          
                          {/* Leyenda flotante en hover */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover/btn:flex flex-col items-center pointer-events-none z-50">
                            <div className="bg-[#0c0c0c] border border-red-500 text-white font-label-caps text-[10px] px-2.5 py-1 shadow-2xl whitespace-nowrap brutal-cut-sm">
                              <span className="text-red-400 font-bold mr-1">💥 +3:</span>
                              Puntos por Knock Out
                            </div>
                            <div className="w-1.5 h-1.5 bg-[#0c0c0c] border-r border-b border-red-500 transform rotate-45 -mt-1"></div>
                          </div>
                        </div>

                        {/* Botón Corona Amarilla Dominancia (+2 puntos) */}
                        <div className="relative group/btn">
                          <button
                            type="button"
                            onClick={() => handleAddPoints(item.id, 2)}
                            className="bg-[#382602] hover:bg-amber-500 active:scale-95 text-amber-300 hover:text-black border border-amber-600/80 hover:border-amber-300 font-headline-sm text-xs px-2 py-1 brutal-cut-sm flex items-center gap-1 transition-all cursor-pointer shadow-md"
                            title="Puntos por dominancia absoluta de la pelea"
                          >
                            <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-400 group-hover/btn:fill-black group-hover/btn:text-black" />
                            <span>+2</span>
                          </button>

                          {/* Leyenda flotante en hover */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover/btn:flex flex-col items-center pointer-events-none z-50">
                            <div className="bg-[#0c0c0c] border border-amber-400 text-white font-label-caps text-[10px] px-2.5 py-1 shadow-2xl whitespace-nowrap brutal-cut-sm">
                              <span className="text-amber-400 font-bold mr-1">👑 +2:</span>
                              Puntos por dominancia absoluta de la pelea
                            </div>
                            <div className="w-1.5 h-1.5 bg-[#0c0c0c] border-r border-b border-amber-400 transform rotate-45 -mt-1"></div>
                          </div>
                        </div>

                        {/* Botón Verde KD (+1 punto) */}
                        <div className="relative group/btn">
                          <button
                            type="button"
                            onClick={() => handleAddPoints(item.id, 1)}
                            className="bg-[#032a13] hover:bg-emerald-600 active:scale-95 text-emerald-300 hover:text-black border border-emerald-600/80 hover:border-emerald-300 font-headline-sm text-xs px-2 py-1 brutal-cut-sm flex items-center gap-1 transition-all cursor-pointer shadow-md"
                            title="Puntos por Knockdown"
                          >
                            <span className="font-bold">KD</span>
                            <span className="text-[10px] opacity-80">+1</span>
                          </button>

                          {/* Leyenda flotante en hover */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover/btn:flex flex-col items-center pointer-events-none z-50">
                            <div className="bg-[#0c0c0c] border border-emerald-400 text-white font-label-caps text-[10px] px-2.5 py-1 shadow-2xl whitespace-nowrap brutal-cut-sm">
                              <span className="text-emerald-400 font-bold mr-1">🥊 +1:</span>
                              Puntos por Knockdown
                            </div>
                            <div className="w-1.5 h-1.5 bg-[#0c0c0c] border-r border-b border-emerald-400 transform rotate-45 -mt-1"></div>
                          </div>
                        </div>

                        {/* Botón Corrección / Restar (-1) */}
                        <div className="relative group/btn">
                          <button
                            type="button"
                            onClick={() => handleAddPoints(item.id, -1)}
                            disabled={(item.points ?? 0) <= 0}
                            className="bg-[#1e1e1e] hover:bg-[#2e2e2e] active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed text-[#888888] hover:text-white border border-[#444444] font-headline-sm text-xs px-1.5 py-1 brutal-cut-sm flex items-center transition-all cursor-pointer"
                            title="Restar 1 punto (-1)"
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover/btn:flex flex-col items-center pointer-events-none z-50">
                            <div className="bg-[#0c0c0c] border border-[#666] text-white font-label-caps text-[10px] px-2 py-1 shadow-2xl whitespace-nowrap brutal-cut-sm">
                              Restar 1 punto
                            </div>
                            <div className="w-1.5 h-1.5 bg-[#0c0c0c] border-r border-b border-[#666] transform rotate-45 -mt-1"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Move Up/Down Controls & Actions */}
                    <div className="col-span-2 sm:col-span-1 flex items-center justify-end gap-1 pr-1">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleMoveUp(realIndex)}
                          disabled={realIndex === 0}
                          className={`p-1 brutal-cut-sm transition-all ${
                            realIndex === 0
                              ? 'bg-[#1a1a1a] text-[#3a3a3a] cursor-not-allowed opacity-30'
                              : 'bg-[#2a2a2a] hover:bg-emerald-600 text-white cursor-pointer hover:scale-105'
                          }`}
                          title="Subir de rango (▲)"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleMoveDown(realIndex)}
                          disabled={realIndex === currentFighterList.length - 1}
                          className={`p-1 brutal-cut-sm transition-all ${
                            realIndex === currentFighterList.length - 1
                              ? 'bg-[#1a1a1a] text-[#3a3a3a] cursor-not-allowed opacity-30'
                              : 'bg-[#2a2a2a] hover:bg-[#e61c24] text-white cursor-pointer hover:scale-105'
                          }`}
                          title="Bajar de rango (▼)"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => setEditingFighter({ fighter: item, divisionId: activeTab as UgcDivision })}
                          className="bg-[#2a2a2a] hover:bg-[#353534] text-[#a09e9e] hover:text-white p-1 brutal-cut-sm transition-colors cursor-pointer"
                          title="Editar datos, puntos y club"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => handleDeleteFighter(item.id)}
                          className="bg-[#2a2a2a] hover:bg-red-700 text-[#a09e9e] hover:text-white p-1 brutal-cut-sm transition-colors cursor-pointer"
                          title="Eliminar de la tabla"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* Save Season Snapshot Modal */}
      {isSaveSeasonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#1c1b1b] brutal-border border-amber-500/60 max-w-lg w-full brutal-cut shadow-2xl p-6">
            <div className="flex justify-between items-center border-b border-[#333333] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400 brutal-cut-sm">
                  <Save className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-headline-sm text-2xl text-white uppercase m-0 leading-tight">
                    GUARDAR TABLAS DE TEMPORADA
                  </h2>
                  <span className="font-label-caps text-[10px] text-amber-400">
                    HISTORIAL Y REGISTRO OFICIAL
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsSaveSeasonModalOpen(false)}
                className="text-[#a09e9e] hover:text-white cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {savedSeasonSuccess ? (
              <div className="flex flex-col gap-4 py-4 text-center items-center">
                <div className="w-16 h-16 bg-emerald-950/80 border border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-headline-sm text-2xl text-white uppercase m-0">
                  ¡TEMPORADA ARCHIVADA!
                </h3>
                <p className="font-body-md text-sm text-[#c8c6c5] m-0 max-w-sm">
                  {savedSeasonSuccess}
                </p>
                <div className="flex gap-2 w-full mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSaveSeasonModalOpen(false);
                      setSavedSeasonSuccess(null);
                    }}
                    className="w-1/2 bg-[#2a2a2a] hover:bg-[#353534] text-white font-headline-sm text-base py-2.5 brutal-cut uppercase cursor-pointer"
                  >
                    CERRAR
                  </button>
                  {onNavigateToHistory && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsSaveSeasonModalOpen(false);
                        setSavedSeasonSuccess(null);
                        onNavigateToHistory();
                      }}
                      className="w-1/2 bg-[#e61c24] hover:bg-[#c00015] text-white font-headline-sm text-base py-2.5 brutal-cut uppercase cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <HistoryIcon className="w-4 h-4" />
                      <span>IR A HISTORIA</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveSeason} className="flex flex-col gap-4">
                <div className="bg-[#121212] p-3 border border-[#2e2e2e] flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-label-caps text-[#a09e9e]">
                    <span>Peleadores a archivar:</span>
                    <span className="text-white font-bold">{totalFightersCount} en 3 divisiones</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-label-caps text-[#a09e9e]">
                    <span>Puntos totales en juego:</span>
                    <span className="text-amber-400 font-bold">{totalPointsAllDivisions} PTS</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-label-caps text-[#a09e9e]">
                    <span>Destino:</span>
                    <span className="text-emerald-400 font-bold">Pestaña "HISTORIA" (Solo lectura)</span>
                  </div>
                </div>

                <div>
                  <label className="font-label-caps text-[11px] text-[#ffb4ac] font-bold block mb-1">
                    NOMBRE DE ESTE GUARDADO / TEMPORADA *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: SEMANA 1"
                    value={seasonNameInput}
                    onChange={(e) => setSeasonNameInput(e.target.value.toUpperCase())}
                    className="w-full bg-[#131313] brutal-border border-[#444] focus:border-amber-400 p-2.5 font-label-caps text-sm text-white uppercase focus:outline-none placeholder:text-[#555]"
                    autoFocus
                  />
                  <p className="text-[10px] text-[#888] font-body-md mt-1">
                    Este nombre identificará el snapshot histórico en la pestaña "Historia".
                  </p>
                </div>

                <div>
                  <label className="font-label-caps text-[11px] text-[#a09e9e] block mb-1">
                    NOTAS O DESCRIPCIÓN FINAL (OPCIONAL)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Detalles sobre las finales, combates destacados o cierre de temporada..."
                    value={seasonNotesInput}
                    onChange={(e) => setSeasonNotesInput(e.target.value)}
                    className="w-full bg-[#131313] brutal-border border-[#444] focus:border-amber-400 p-2.5 font-label-caps text-xs text-white focus:outline-none resize-none"
                  />
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsSaveSeasonModalOpen(false)}
                    className="w-1/2 bg-[#2a2a2a] hover:bg-[#353534] text-white font-headline-sm text-lg py-2.5 brutal-cut uppercase cursor-pointer"
                  >
                    CANCELAR
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-amber-500 hover:bg-amber-400 text-black font-headline-sm text-lg py-2.5 brutal-cut uppercase cursor-pointer flex items-center justify-center gap-1.5 font-bold shadow-lg"
                  >
                    <Save className="w-4 h-4 text-black" />
                    <span>GUARDAR AHORA</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Fighter Modal */}
      {editingFighter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1c1b1b] brutal-border max-w-xl w-full brutal-cut shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#333333] pb-3 mb-4">
              <h2 className="font-headline-sm text-2xl text-white uppercase m-0 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#e61c24]" />
                EDITAR PELEADOR Y CLUB
              </h2>
              <button
                onClick={() => setEditingFighter(null)}
                className="text-[#a09e9e] hover:text-white cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-3">
              <div>
                <label className="font-label-caps text-[11px] text-[#a09e9e] block mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={editingFighter.fighter.name}
                  onChange={(e) => setEditingFighter({
                    ...editingFighter,
                    fighter: { ...editingFighter.fighter, name: e.target.value.toUpperCase() }
                  })}
                  className="w-full bg-[#131313] brutal-border p-2 font-label-caps text-xs text-white uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-label-caps text-[11px] text-[#a09e9e] block mb-1">Apodo</label>
                  <input
                    type="text"
                    value={editingFighter.fighter.nickname || ''}
                    onChange={(e) => setEditingFighter({
                      ...editingFighter,
                      fighter: { ...editingFighter.fighter, nickname: e.target.value.toUpperCase() }
                    })}
                    className="w-full bg-[#131313] brutal-border p-2 font-label-caps text-xs text-white uppercase"
                  />
                </div>
                <div>
                  <label className="font-label-caps text-[11px] text-[#a09e9e] block mb-1">Estatura</label>
                  <select
                    value={editingFighter.fighter.height}
                    onChange={(e) => setEditingFighter({
                      ...editingFighter,
                      fighter: { ...editingFighter.fighter, height: e.target.value }
                    })}
                    className="w-full bg-[#131313] brutal-border p-2 font-label-caps text-xs text-white cursor-pointer focus:border-[#e61c24] focus:outline-none"
                  >
                    {!DIVISION_HEIGHTS[editingFighter.divisionId]?.includes(editingFighter.fighter.height) && (
                      <option value={editingFighter.fighter.height} className="bg-[#131313] text-white">
                        {editingFighter.fighter.height} (Actual)
                      </option>
                    )}
                    {(DIVISION_HEIGHTS[editingFighter.divisionId] || []).map((heightOption) => (
                      <option key={heightOption} value={heightOption} className="bg-[#131313] text-white">
                        {heightOption}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-label-caps text-[11px] text-amber-400 font-bold block mb-1">Puntos Totales</label>
                  <input
                    type="number"
                    min="0"
                    value={editingFighter.fighter.points ?? 0}
                    onChange={(e) => setEditingFighter({
                      ...editingFighter,
                      fighter: { ...editingFighter.fighter, points: Math.max(0, parseInt(e.target.value) || 0) }
                    })}
                    className="w-full bg-[#131313] brutal-border p-2 font-label-caps text-xs text-amber-400 font-bold"
                  />
                </div>
                <div>
                  <label className="font-label-caps text-[11px] text-[#a09e9e] block mb-1">
                    Récord (Victorias - Derrotas - Empates)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 8-1-0"
                    value={editingFighter.fighter.record}
                    onChange={(e) => setEditingFighter({
                      ...editingFighter,
                      fighter: { ...editingFighter.fighter, record: e.target.value }
                    })}
                    className="w-full bg-[#131313] brutal-border p-2 font-label-caps text-xs text-white"
                  />
                </div>
                <div>
                  <label className="font-label-caps text-[11px] text-[#a09e9e] block mb-1">Racha</label>
                  <input
                    type="text"
                    value={editingFighter.fighter.streak}
                    onChange={(e) => setEditingFighter({
                      ...editingFighter,
                      fighter: { ...editingFighter.fighter, streak: e.target.value.toUpperCase() }
                    })}
                    className="w-full bg-[#131313] brutal-border p-2 font-label-caps text-xs text-white uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="font-label-caps text-[11px] text-[#a09e9e] block mb-1">Estilo de Pelea / Disciplina</label>
                <select
                  value={editingFighter.fighter.fightingStyle || 'BOXING'}
                  onChange={(e) => setEditingFighter({
                    ...editingFighter,
                    fighter: { ...editingFighter.fighter, fightingStyle: e.target.value }
                  })}
                  className="w-full bg-[#131313] brutal-border p-2 font-label-caps text-xs text-white uppercase cursor-pointer focus:border-[#e61c24] focus:outline-none"
                >
                  {FIGHTING_STYLES.map((style) => (
                    <option key={style} value={style} className="bg-[#131313] text-white">
                      {style}
                    </option>
                  ))}
                </select>
              </div>

              {/* Edit Club Affiliation */}
              <div className="border-t border-[#333333] pt-3">
                <label className="font-label-caps text-[11px] text-[#ffb4ac] font-bold block mb-2">
                  Cambiar Club Oficial Asignado:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {GAKURAN_CLUBS.map((c) => {
                    const isSelected = editingFighter.fighter.clubId === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setEditingFighter({
                            ...editingFighter,
                            fighter: {
                              ...editingFighter.fighter,
                              clubId: c.id,
                              clubName: c.name,
                              clubCategory: c.subtitle,
                              clubLogoUrl: c.logoUrl,
                              clubColor: c.themeColor,
                              imageUrl: c.logoUrl
                            }
                          });
                        }}
                        className={`p-2 brutal-border flex flex-col items-center gap-1 transition-all ${
                          isSelected ? 'bg-[#262525] border-2 border-white' : 'bg-[#131313] hover:bg-[#202020]'
                        }`}
                        style={{ borderColor: isSelected ? c.themeColor : undefined }}
                      >
                        <img
                          src={c.logoUrl}
                          alt={c.name}
                          className="w-10 h-10 object-contain"
                          referrerPolicy="no-referrer"
                        />
                        <span className="font-headline-sm text-[10px] text-white truncate w-full text-center">
                          {c.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setEditingFighter(null)}
                  className="w-1/2 bg-[#2a2a2a] hover:bg-[#353534] text-white font-headline-sm text-xl py-2.5 brutal-cut uppercase cursor-pointer"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-[#e61c24] hover:bg-[#c00015] text-white font-headline-sm text-xl py-2.5 brutal-cut uppercase cursor-pointer"
                >
                  GUARDAR CAMBIOS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

const CrownIcon = () => (
  <svg className="w-4 h-4 text-amber-400 inline-block" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
  </svg>
);
