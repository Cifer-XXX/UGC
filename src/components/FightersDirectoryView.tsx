import React, { useState, useMemo, useEffect } from 'react';
import { UgcDivision, RankedFighterItem, Fighter, ClubItem, FIGHTING_STYLES, FightingStyle, DIVISION_HEIGHTS } from '../types';
import { GAKURAN_CLUBS } from '../data/clubs';
import { 
  Users, 
  Trophy, 
  Flame, 
  Crown, 
  Swords, 
  Shield, 
  TrendingUp, 
  Search, 
  Filter, 
  Plus, 
  Sparkles, 
  Award, 
  BarChart3, 
  Zap, 
  PieChart as PieChartIcon, 
  Activity, 
  Target, 
  ChevronRight, 
  Building2,
  CheckCircle2
} from 'lucide-react';

interface FightersDirectoryViewProps {
  initialFighters: Fighter[];
  onBookInMatchmaking: (fighter: Fighter) => void;
  onOfferContract?: (fighter: Fighter) => void;
  onNavigateToRankings?: () => void;
}

const LOCAL_STORAGE_KEY = 'ugc_division_rankings_v3_clubs';

const DIVISIONS_META: { id: UgcDivision; label: string; heightRange: string; color: string; badgeColor: string }[] = [
  {
    id: 'PESO PLUMA (1.50 M O MENOS - 1.69 M)',
    label: 'PESO PLUMA',
    heightRange: '1.50 m o menos - 1.69 m',
    color: '#ffb4ac',
    badgeColor: 'border-[#ffb4ac] text-[#ffb4ac] bg-[#ffb4ac]/10'
  },
  {
    id: 'PESO WELTER (1.70 M - 1.89 M)',
    label: 'PESO WELTER',
    heightRange: '1.70 m - 1.89 m',
    color: '#e61c24',
    badgeColor: 'border-[#e61c24] text-[#e61c24] bg-[#e61c24]/10'
  },
  {
    id: 'PESO PESADO (1.90 M - 2.10 M)',
    label: 'PESO PESADO',
    heightRange: '1.90 m - 2.10 m',
    color: '#ff5449',
    badgeColor: 'border-[#ff5449] text-[#ff5449] bg-[#ff5449]/10'
  }
];

export interface EnrichedDirectoryFighter extends RankedFighterItem {
  division: UgcDivision;
  divisionLabel: string;
  divisionColor: string;
  divisionRank: number;
  wins: number;
  losses: number;
  draws: number;
  totalFights: number;
  winRate: number;
  koScore: number;
  kdScore: number;
  domScore: number;
  totalPoints: number;
  club: ClubItem;
  overallRating: number;
}

export const FightersDirectoryView: React.FC<FightersDirectoryViewProps> = ({
  initialFighters,
  onBookInMatchmaking,
  onOfferContract,
  onNavigateToRankings
}) => {
  // Read synced registered fighters from localStorage
  const [rankingsByDivision, setRankingsByDivision] = useState<Record<UgcDivision, RankedFighterItem[]>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading rankings in fighters directory', e);
    }
    return {
      'PESO PLUMA (1.50 M O MENOS - 1.69 M)': [],
      'PESO WELTER (1.70 M - 1.89 M)': [],
      'PESO PESADO (1.90 M - 2.10 M)': []
    };
  });

  // Re-read storage on focus or storage events
  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          setRankingsByDivision(JSON.parse(saved));
        }
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivisionTab, setSelectedDivisionTab] = useState<'ALL' | UgcDivision>('ALL');
  const [selectedClubFilter, setSelectedClubFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE' | 'CLUBS'>('CARDS');
  const [selectedFighterModal, setSelectedFighterModal] = useState<EnrichedDirectoryFighter | null>(null);

  // Compile all enrolled fighters across divisions
  const allEnrolledFighters: EnrichedDirectoryFighter[] = useMemo(() => {
    const list: EnrichedDirectoryFighter[] = [];

    DIVISIONS_META.forEach(divMeta => {
      const divFighters = rankingsByDivision[divMeta.id] || [];
      divFighters.forEach((f, idx) => {
        const parts = (f.record || '0-0-0').split('-');
        const wins = parseInt(parts[0], 10) || 0;
        const losses = parseInt(parts[1], 10) || 0;
        const draws = parseInt(parts[2], 10) || 0;
        const totalFights = wins + losses + draws;
        const winRate = totalFights > 0 ? Math.round((wins / totalFights) * 100) : 0;

        const koScore = f.koCount ?? Math.floor(wins * 0.6);
        const kdScore = f.kdCount ?? Math.floor(wins * 0.8);
        const domScore = f.dominanceCount ?? Math.floor(wins * 0.4);
        const totalPoints = f.points ?? ((koScore * 3) + (domScore * 2) + (kdScore * 1));

        const matchedClub = GAKURAN_CLUBS.find(c => c.id === f.clubId) || {
          id: f.clubId || 'independent',
          name: f.clubName || 'INDEPENDIENTE',
          subtitle: f.clubCategory || 'SIN CLUB OFICIAL',
          category: f.clubCategory || 'General',
          logoUrl: f.clubLogoUrl || f.imageUrl || GAKURAN_CLUBS[0].logoUrl,
          themeColor: f.clubColor || '#e61c24',
          accentColor: '#991b1b',
          description: 'Peleador independiente de la academia.',
          motto: 'Honor y Fuerza'
        };

        // Calculate a 0-99 combat rating
        const calculatedRating = Math.min(99, Math.max(60, 70 + Math.floor(wins * 1.5) - (losses * 2) + Math.floor(totalPoints / 5)));

        list.push({
          ...f,
          division: divMeta.id,
          divisionLabel: divMeta.label,
          divisionColor: divMeta.color,
          divisionRank: idx + 1,
          wins,
          losses,
          draws,
          totalFights,
          winRate,
          koScore,
          kdScore,
          domScore,
          totalPoints,
          club: matchedClub,
          overallRating: calculatedRating
        });
      });
    });

    return list;
  }, [rankingsByDivision]);

  // Aggregate stats
  const totalFightersCount = allEnrolledFighters.length;
  const totalKOs = useMemo(() => allEnrolledFighters.reduce((acc, f) => acc + f.koScore, 0), [allEnrolledFighters]);
  const totalKDs = useMemo(() => allEnrolledFighters.reduce((acc, f) => acc + f.kdScore, 0), [allEnrolledFighters]);
  const totalDominances = useMemo(() => allEnrolledFighters.reduce((acc, f) => acc + f.domScore, 0), [allEnrolledFighters]);
  const totalPointsAll = useMemo(() => allEnrolledFighters.reduce((acc, f) => acc + f.totalPoints, 0), [allEnrolledFighters]);

  // Filtered fighters
  const filteredFighters = useMemo(() => {
    return allEnrolledFighters.filter(f => {
      // Division filter
      if (selectedDivisionTab !== 'ALL' && f.division !== selectedDivisionTab) {
        return false;
      }
      // Club filter
      if (selectedClubFilter !== 'ALL' && f.club.id !== selectedClubFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = f.name.toLowerCase().includes(q);
        const matchNick = (f.nickname || '').toLowerCase().includes(q);
        const matchStyle = (f.fightingStyle || '').toLowerCase().includes(q);
        const matchClub = (f.club.name || '').toLowerCase().includes(q);
        return matchName || matchNick || matchStyle || matchClub;
      }
      return true;
    });
  }, [allEnrolledFighters, selectedDivisionTab, selectedClubFilter, searchQuery]);

  // Group by clubs for CLUBS view mode
  const fightersByClub = useMemo(() => {
    const map = new Map<string, { club: ClubItem; fighters: EnrichedDirectoryFighter[] }>();
    
    GAKURAN_CLUBS.forEach(c => {
      map.set(c.id, { club: c, fighters: [] });
    });

    allEnrolledFighters.forEach(f => {
      if (map.has(f.club.id)) {
        map.get(f.club.id)!.fighters.push(f);
      } else {
        map.set(f.club.id, { club: f.club, fighters: [f] });
      }
    });

    return Array.from(map.values()).filter(group => {
      if (selectedClubFilter !== 'ALL' && group.club.id !== selectedClubFilter) return false;
      return true;
    });
  }, [allEnrolledFighters, selectedClubFilter]);

  // Convert Enriched to Fighter format for Matchmaking
  const handleSelectForMatchmaking = (f: EnrichedDirectoryFighter) => {
    const formattedFighter: Fighter = {
      id: f.id,
      firstName: f.name.split(' ')[0] || f.name,
      nickname: f.nickname || 'FIGHTER',
      lastName: f.name.split(' ').slice(1).join(' ') || 'GAKURAN',
      rankingBadge: f.isChampion ? 'CHAMPION' : `#${f.divisionRank} RANKED`,
      status: 'ACTIVE ROSTER',
      record: f.record,
      wins: f.wins,
      losses: f.losses,
      draws: f.draws,
      height: f.height,
      reach: '72"',
      weight: f.division.includes('PLUMA') ? '145 LBS' : f.division.includes('WELTER') ? '170 LBS' : '220 LBS',
      weightClass: f.division.includes('PLUMA') ? 'FEATHERWEIGHT (145 LBS)' : f.division.includes('WELTER') ? 'WELTERWEIGHT (170 LBS)' : 'HEAVYWEIGHT (265 LBS)',
      stance: 'ORTHODOX',
      fightingStyle: f.fightingStyle || 'BANCHO BRAWLING',
      strikingAccuracy: 75,
      grapplingDefense: 70,
      takedownAverage: 2.5,
      takedownAccuracy: 60,
      koPower: 85,
      cardio: 80,
      imageUrl: f.imageUrl || f.club.logoUrl,
      recentHistory: [
        {
          id: `h-${f.id}-1`,
          event: 'GAKURAN CHAMPIONSHIP',
          date: 'OCT 2024',
          opponent: 'OPPONENT',
          method: 'KO (Right Hook)',
          roundTime: 'R1 2:30',
          result: 'WIN'
        }
      ],
      contract: {
        fightsRemaining: 3,
        showPurse: 150000,
        winBonus: 150000,
        ppvCutPercent: 1.5,
        status: 'SIGNED'
      },
      hypeRating: f.overallRating,
      bio: `Miembro de ${f.club.name}. Compite en la división ${f.divisionLabel}.`,
      age: 18,
      country: 'Japan',
      countryCode: 'JPN'
    };

    onBookInMatchmaking(formattedFighter);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* Top Banner & Title */}
      <div className="bg-[#1c1b1b] brutal-border p-4 sm:p-6 shadow-xl flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[#333333] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-7 h-7 text-[#e61c24]" />
              <h1 className="font-headline-lg text-3xl sm:text-4xl text-[#e5e2e1] uppercase m-0 leading-none">
                ROSTER OFICIAL DE PELEADORES
              </h1>
            </div>
            <p className="font-label-caps text-xs text-[#a09e9e] mt-1.5 flex items-center gap-2 flex-wrap">
              <span>DIRECTORIO GENERAL DE INSCRITOS POR CATEGORÍAS, CLUBES Y ANÁLISIS DE COMBATE</span>
              <span className="text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 border border-amber-600/40 rounded-xs">
                {totalFightersCount} ATLETAS EN LISTA
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onNavigateToRankings && (
              <button
                onClick={onNavigateToRankings}
                className="bg-[#2a1718] hover:bg-[#3d1e20] text-amber-300 border border-amber-500/60 hover:border-amber-400 font-headline-sm text-sm px-3.5 py-2 brutal-cut uppercase flex items-center gap-1.5 cursor-pointer transition-colors shadow-lg"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>IR A TABLA DE RANKINGS</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Stats Overview Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          {/* Total Fighters */}
          <div className="bg-[#121212] p-3 brutal-border border-[#2a2a2a] flex flex-col justify-between">
            <span className="font-label-caps text-[10px] text-[#a09e9e] uppercase flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#e61c24]" />
              Peleadores
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-headline-sm text-2xl text-white font-bold">{totalFightersCount}</span>
              <span className="text-[10px] font-label-caps text-[#888]">INSCRITOS</span>
            </div>
          </div>

          {/* Total KOs */}
          <div className="bg-[#121212] p-3 brutal-border border-red-900/40 flex flex-col justify-between">
            <span className="font-label-caps text-[10px] text-red-300 uppercase flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-red-500" />
              Knockouts (KO)
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-headline-sm text-2xl text-red-400 font-bold">{totalKOs}</span>
              <span className="text-[10px] font-label-caps text-red-400/80">KOS TOTALES</span>
            </div>
          </div>

          {/* Dominances */}
          <div className="bg-[#121212] p-3 brutal-border border-amber-900/40 flex flex-col justify-between">
            <span className="font-label-caps text-[10px] text-amber-300 uppercase flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              Dominancias
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-headline-sm text-2xl text-amber-400 font-bold">{totalDominances}</span>
              <span className="text-[10px] font-label-caps text-amber-400/80">RONDAS</span>
            </div>
          </div>

          {/* Knockdowns */}
          <div className="bg-[#121212] p-3 brutal-border border-emerald-900/40 flex flex-col justify-between">
            <span className="font-label-caps text-[10px] text-emerald-300 uppercase flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              Knockdowns (KD)
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-headline-sm text-2xl text-emerald-400 font-bold">{totalKDs}</span>
              <span className="text-[10px] font-label-caps text-emerald-400/80">CAÍDAS</span>
            </div>
          </div>

          {/* Total Points */}
          <div className="bg-[#121212] p-3 brutal-border border-[#444] col-span-2 sm:col-span-1 flex flex-col justify-between">
            <span className="font-label-caps text-[10px] text-amber-200 uppercase flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Puntos en Juego
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-headline-sm text-2xl text-amber-400 font-bold">{totalPointsAll}</span>
              <span className="text-[10px] font-label-caps text-amber-500 font-bold">PTS</span>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between pt-2 border-t border-[#2a2a2a]">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#888]" />
            <input
              type="text"
              placeholder="BUSCAR POR NOMBRE, APODO, ESTILO O CLUB..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121212] brutal-border border-[#333] focus:border-[#e61c24] pl-9 pr-3 py-2 font-label-caps text-xs text-white uppercase focus:outline-none placeholder:text-[#666]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-[#888] hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Club Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            <select
              value={selectedClubFilter}
              onChange={(e) => setSelectedClubFilter(e.target.value)}
              className="bg-[#121212] brutal-border border-[#444] text-xs font-label-caps uppercase text-[#e5e2e1] px-3 py-2 focus:border-amber-400 focus:outline-none cursor-pointer"
            >
              <option value="ALL">🏢 TODOS LOS CLUBES ({GAKURAN_CLUBS.length})</option>
              {GAKURAN_CLUBS.map(c => {
                const countInClub = allEnrolledFighters.filter(f => f.club.id === c.id).length;
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.subtitle} ({countInClub})
                  </option>
                );
              })}
            </select>
          </div>

          {/* View Mode Selector */}
          <div className="flex items-center gap-1 bg-[#121212] p-1 border border-[#333] brutal-cut-sm self-start md:self-auto">
            <button
              onClick={() => setViewMode('CARDS')}
              className={`px-3 py-1.5 font-label-caps text-xs uppercase brutal-cut-sm transition-colors flex items-center gap-1.5 ${
                viewMode === 'CARDS'
                  ? 'bg-[#e61c24] text-white font-bold'
                  : 'text-[#888] hover:text-white'
              }`}
            >
              <span>TARJETAS</span>
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-3 py-1.5 font-label-caps text-xs uppercase brutal-cut-sm transition-colors flex items-center gap-1.5 ${
                viewMode === 'TABLE'
                  ? 'bg-[#e61c24] text-white font-bold'
                  : 'text-[#888] hover:text-white'
              }`}
            >
              <span>TABLA</span>
            </button>
            <button
              onClick={() => setViewMode('CLUBS')}
              className={`px-3 py-1.5 font-label-caps text-xs uppercase brutal-cut-sm transition-colors flex items-center gap-1.5 ${
                viewMode === 'CLUBS'
                  ? 'bg-[#e61c24] text-white font-bold'
                  : 'text-[#888] hover:text-white'
              }`}
            >
              <span>POR CLUBES</span>
            </button>
          </div>
        </div>

        {/* Division Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedDivisionTab('ALL')}
            className={`px-4 py-2 font-label-caps text-xs uppercase brutal-cut transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              selectedDivisionTab === 'ALL'
                ? 'bg-[#e61c24] text-white font-bold shadow-md'
                : 'bg-[#121212] text-[#888] hover:bg-[#222] hover:text-white border border-[#333]'
            }`}
          >
            <span>TODAS LAS CATEGORÍAS</span>
            <span className="bg-black/40 px-1.5 py-0.5 text-[10px] rounded-xs">
              {totalFightersCount}
            </span>
          </button>

          {DIVISIONS_META.map(d => {
            const countInDiv = allEnrolledFighters.filter(f => f.division === d.id).length;
            const isSelected = selectedDivisionTab === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDivisionTab(d.id)}
                className={`px-4 py-2 font-label-caps text-xs uppercase brutal-cut transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#261517] text-white border-b-2 border-b-[#e61c24] font-bold shadow-md'
                    : 'bg-[#121212] text-[#888] hover:bg-[#222] hover:text-white border border-[#333]'
                }`}
                style={{ borderColor: isSelected ? d.color : undefined }}
              >
                <span style={{ color: isSelected ? d.color : undefined }}>{d.label}</span>
                <span className="text-[10px] opacity-75">({d.heightRange})</span>
                <span className="bg-black/50 px-1.5 py-0.5 text-[10px] rounded-xs font-bold" style={{ color: d.color }}>
                  {countInDiv}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area: Rendering Based on Selected View Mode */}
      {totalFightersCount === 0 ? (
        <div className="bg-[#1c1b1b] brutal-border p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 bg-[#2a2a2a] flex items-center justify-center brutal-cut text-[#767575]">
            <Users className="w-8 h-8 text-[#e61c24]" />
          </div>
          <h3 className="font-headline-sm text-2xl text-[#e5e2e1] uppercase m-0">
            NO HAY PELEADORES INSCRITOS AÚN
          </h3>
          <p className="font-body-md text-sm text-[#a09e9e] max-w-md m-0">
            Ve a la pestaña RANKINGS para inscribir peleadores o cargar los ejemplos con sus clubes asignados.
          </p>
          {onNavigateToRankings && (
            <button
              onClick={onNavigateToRankings}
              className="bg-[#e61c24] hover:bg-[#c00015] text-white font-headline-sm text-base px-4 py-2.5 brutal-cut uppercase flex items-center gap-2 transition-colors cursor-pointer mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>IR A RANKINGS & INSCRIBIR</span>
            </button>
          )}
        </div>
      ) : filteredFighters.length === 0 ? (
        <div className="bg-[#1c1b1b] brutal-border p-12 text-center flex flex-col items-center justify-center gap-3">
          <Search className="w-8 h-8 text-[#767575]" />
          <h3 className="font-headline-sm text-2xl text-[#e5e2e1] uppercase m-0">
            NO SE ENCONTRARON PELEADORES CON ESTOS FILTROS
          </h3>
          <p className="font-body-md text-sm text-[#a09e9e] max-w-md m-0">
            Intenta cambiar el texto de búsqueda o restablecer los filtros de categoría y club.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDivisionTab('ALL');
              setSelectedClubFilter('ALL');
            }}
            className="bg-[#2a2a2a] hover:bg-[#353534] text-white font-headline-sm text-sm px-4 py-2 brutal-cut uppercase cursor-pointer"
          >
            RESTABLECER TODOS LOS FILTROS
          </button>
        </div>
      ) : viewMode === 'CARDS' ? (
        /* ========================================================================= */
        /* CARDS GRID VIEW                                                           */
        /* ========================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredFighters.map((f) => (
            <div
              key={`${f.division}-${f.id}`}
              className="bg-[#1c1b1b] brutal-border flex flex-col justify-between hover:border-[#555] transition-all group overflow-hidden shadow-xl"
            >
              {/* Card Header & Division Strip */}
              <div className="p-4 bg-[#141414] border-b border-[#2a2a2a] flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span 
                    className="font-label-caps text-[10px] font-bold px-2 py-0.5 border uppercase rounded-xs"
                    style={{ 
                      color: f.divisionColor, 
                      borderColor: `${f.divisionColor}55`,
                      backgroundColor: `${f.divisionColor}15`
                    }}
                  >
                    {f.divisionLabel} · {f.height}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {f.isChampion ? (
                    <span className="font-headline-sm text-xs bg-[#ffb4ac] text-black px-2 py-0.5 font-bold brutal-cut-sm flex items-center gap-1">
                      <Crown className="w-3 h-3 fill-black" />
                      CAMPEÓN
                    </span>
                  ) : (
                    <span className="font-headline-sm text-xs bg-[#222] text-[#c8c6c5] border border-[#444] px-2 py-0.5">
                      RANGO #{f.divisionRank}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body: Fighter Profile & Club */}
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  {/* Club Emblem / Fighter Image */}
                  <div 
                    className="w-16 h-16 bg-[#0a0a0a] rounded-sm p-1.5 border flex items-center justify-center shrink-0 shadow-lg relative group-hover:scale-105 transition-transform"
                    style={{ borderColor: f.club.themeColor }}
                  >
                    <img
                      src={f.club.logoUrl}
                      alt={f.club.name}
                      className="w-full h-full object-contain filter drop-shadow"
                      referrerPolicy="no-referrer"
                    />
                    <div 
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border border-black flex items-center justify-center text-[9px] font-bold text-white shadow-md"
                      style={{ backgroundColor: f.club.themeColor }}
                      title={f.club.name}
                    >
                      ★
                    </div>
                  </div>

                  {/* Names & Titles */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline-sm text-xl text-white uppercase leading-tight truncate m-0">
                      {f.name}
                    </h3>
                    {f.nickname && (
                      <span className="font-label-caps text-xs text-[#ffb4ac] font-bold block truncate mt-0.5">
                        "{f.nickname}"
                      </span>
                    )}

                    {/* Club Tag */}
                    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                      <span 
                        className="font-label-caps text-[10px] font-bold px-1.5 py-0.5 border uppercase rounded-xs"
                        style={{ 
                          color: f.club.themeColor, 
                          borderColor: `${f.club.themeColor}60`,
                          backgroundColor: `${f.club.themeColor}15`
                        }}
                      >
                        {f.club.name}
                      </span>
                      <span className="text-[9px] text-[#777] font-label-caps uppercase">
                        {f.club.subtitle}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Core Record & Style Pills */}
                <div className="grid grid-cols-3 gap-2 bg-[#121212] p-2.5 brutal-border border-[#262626] rounded-xs text-center">
                  <div>
                    <span className="text-[9px] font-label-caps text-[#777] block">RÉCORD</span>
                    <span className="font-headline-sm text-sm text-white font-bold">{f.record}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-label-caps text-[#777] block">RACHA</span>
                    <span className={`font-headline-sm text-xs font-bold px-1.5 py-0.2 rounded-xs inline-block ${
                      f.streak.startsWith('W') ? 'text-emerald-400 bg-emerald-950/60' : 'text-red-400 bg-red-950/60'
                    }`}>
                      {f.streak}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-label-caps text-[#777] block">ESTILO</span>
                    <span className="font-headline-sm text-xs text-amber-300 truncate block">
                      {f.fightingStyle || 'COMBATE'}
                    </span>
                  </div>
                </div>

                {/* COMBAT ANALYSIS & METRICS (KOs, KDs, Dominancias y Puntos) */}
                <div className="flex flex-col gap-1.5 bg-[#0f0f0f] p-3 brutal-border border-[#262626] rounded-xs">
                  <div className="flex justify-between items-center text-[10px] font-label-caps text-[#999] border-b border-[#222] pb-1">
                    <span className="font-bold text-[#c8c6c5] flex items-center gap-1">
                      <Activity className="w-3 h-3 text-[#e61c24]" />
                      ANÁLISIS DE COMBATE
                    </span>
                    <span className="text-amber-400 font-bold bg-amber-950/80 px-1.5 py-0.5 border border-amber-600/40 rounded-xs">
                      {f.totalPoints} PUNTOS TOTALES
                    </span>
                  </div>

                  {/* 3 Metric Pills: KO, KD, Dominancia */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {/* KO Stat */}
                    <div className="bg-[#1e0a0c] border border-red-900/60 p-1.5 rounded-xs text-center flex flex-col items-center">
                      <div className="flex items-center gap-1 text-[10px] text-red-400 font-bold font-label-caps">
                        <Flame className="w-3 h-3 text-red-500" />
                        <span>KO (+3)</span>
                      </div>
                      <span className="font-headline-sm text-base text-red-200 font-bold mt-0.5">
                        {f.koScore}
                      </span>
                    </div>

                    {/* Dominancia Stat */}
                    <div className="bg-[#241802] border border-amber-900/60 p-1.5 rounded-xs text-center flex flex-col items-center">
                      <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold font-label-caps">
                        <Crown className="w-3 h-3 text-amber-400" />
                        <span>DOM (+2)</span>
                      </div>
                      <span className="font-headline-sm text-base text-amber-200 font-bold mt-0.5">
                        {f.domScore}
                      </span>
                    </div>

                    {/* KD Stat */}
                    <div className="bg-[#031d0e] border border-emerald-900/60 p-1.5 rounded-xs text-center flex flex-col items-center">
                      <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold font-label-caps">
                        <Target className="w-3 h-3 text-emerald-400" />
                        <span>KD (+1)</span>
                      </div>
                      <span className="font-headline-sm text-base text-emerald-200 font-bold mt-0.5">
                        {f.kdScore}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 bg-[#141414] border-t border-[#2a2a2a] flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedFighterModal(f)}
                  className="flex-1 bg-[#222] hover:bg-[#2d2d2d] text-[#e5e2e1] font-headline-sm text-xs py-2 brutal-cut uppercase transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-[#ffb4ac]" />
                  <span>VER ANÁLISIS</span>
                </button>

                <button
                  onClick={() => handleSelectForMatchmaking(f)}
                  className="flex-1 bg-[#e61c24] hover:bg-[#c00015] text-white font-headline-sm text-xs py-2 brutal-cut uppercase transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-md"
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>EMPAREJAR</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === 'TABLE' ? (
        /* ========================================================================= */
        /* DETAILED TABLE VIEW                                                       */
        /* ========================================================================= */
        <div className="bg-[#1c1b1b] brutal-border overflow-x-auto shadow-2xl">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-[#121212] border-b border-[#333] font-label-caps text-[11px] text-[#a09e9e] uppercase tracking-wider">
                <th className="py-3 px-4 text-center">CATEGORÍA</th>
                <th className="py-3 px-4">PELEADOR & CLUB</th>
                <th className="py-3 px-3 text-center">RÉCORD</th>
                <th className="py-3 px-3 text-center">RACHA</th>
                <th className="py-3 px-3 text-center text-red-400">KO (+3)</th>
                <th className="py-3 px-3 text-center text-amber-400">DOM (+2)</th>
                <th className="py-3 px-3 text-center text-emerald-400">KD (+1)</th>
                <th className="py-3 px-4 text-center text-amber-400 font-bold">TOTAL PTS</th>
                <th className="py-3 px-4 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              {filteredFighters.map((f) => (
                <tr key={`${f.division}-${f.id}`} className="hover:bg-[#222121] transition-colors">
                  {/* Division Badge */}
                  <td className="py-3 px-4 text-center">
                    <span 
                      className="font-label-caps text-[9px] font-bold px-2 py-0.5 border uppercase rounded-xs"
                      style={{ 
                        color: f.divisionColor, 
                        borderColor: `${f.divisionColor}55`,
                        backgroundColor: `${f.divisionColor}15`
                      }}
                    >
                      {f.divisionLabel}
                    </span>
                  </td>

                  {/* Fighter Name, Nickname & Club */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-9 h-9 bg-[#0a0a0a] rounded-sm p-1 border flex items-center justify-center shrink-0 shadow"
                        style={{ borderColor: f.club.themeColor }}
                      >
                        <img
                          src={f.club.logoUrl}
                          alt={f.club.name}
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-headline-sm text-base text-white uppercase leading-tight">
                            {f.name}
                          </span>
                          {f.isChampion && (
                            <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {f.nickname && (
                            <span className="font-label-caps text-[10px] text-[#ffb4ac] font-bold">
                              "{f.nickname}" ·
                            </span>
                          )}
                          <span 
                            className="font-label-caps text-[9px] font-bold uppercase"
                            style={{ color: f.club.themeColor }}
                          >
                            {f.club.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Record */}
                  <td className="py-3 px-3 text-center font-label-caps text-xs text-white font-bold">
                    {f.record}
                  </td>

                  {/* Streak */}
                  <td className="py-3 px-3 text-center">
                    <span className={`font-label-caps text-[10px] font-bold px-1.5 py-0.2 rounded-xs inline-block ${
                      f.streak.startsWith('W') ? 'text-emerald-400 bg-emerald-950/60' : 'text-red-400 bg-red-950/60'
                    }`}>
                      {f.streak}
                    </span>
                  </td>

                  {/* KO */}
                  <td className="py-3 px-3 text-center font-headline-sm text-sm text-red-300 font-bold">
                    {f.koScore}
                  </td>

                  {/* Dominancia */}
                  <td className="py-3 px-3 text-center font-headline-sm text-sm text-amber-300 font-bold">
                    {f.domScore}
                  </td>

                  {/* KD */}
                  <td className="py-3 px-3 text-center font-headline-sm text-sm text-emerald-300 font-bold">
                    {f.kdScore}
                  </td>

                  {/* Total Points */}
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex items-center gap-1 bg-[#0a0a0a] px-2.5 py-1 border border-amber-500/50 rounded-xs shadow-inner">
                      <span className="font-headline-sm text-base text-amber-400 font-bold">
                        {f.totalPoints}
                      </span>
                      <span className="text-[8px] text-amber-500 font-bold font-label-caps">PTS</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedFighterModal(f)}
                        className="bg-[#2a2a2a] hover:bg-[#353534] text-white px-2.5 py-1 text-xs font-label-caps uppercase brutal-cut-sm cursor-pointer"
                        title="Ver dossier y estadísticas detalladas"
                      >
                        ANÁLISIS
                      </button>
                      <button
                        onClick={() => handleSelectForMatchmaking(f)}
                        className="bg-[#e61c24] hover:bg-[#c00015] text-white px-2.5 py-1 text-xs font-label-caps uppercase brutal-cut-sm cursor-pointer"
                        title="Emparejar en Matchmaking"
                      >
                        COMBATIR
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* ========================================================================= */
        /* GROUPED BY CLUBS VIEW                                                     */
        /* ========================================================================= */
        <div className="flex flex-col gap-6">
          {fightersByClub.map(({ club, fighters }) => {
            const clubTotalPoints = fighters.reduce((sum, f) => sum + f.totalPoints, 0);
            const clubTotalKOs = fighters.reduce((sum, f) => sum + f.koScore, 0);

            return (
              <div key={club.id} className="bg-[#1c1b1b] brutal-border shadow-xl overflow-hidden">
                {/* Club Header Strip */}
                <div 
                  className="p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b"
                  style={{ 
                    backgroundColor: `${club.themeColor}12`,
                    borderColor: `${club.themeColor}40`
                  }}
                >
                  <div className="flex items-center gap-3.5">
                    <div 
                      className="w-14 h-14 bg-[#0a0a0a] rounded-sm p-1.5 border flex items-center justify-center shrink-0 shadow-xl"
                      style={{ borderColor: club.themeColor }}
                    >
                      <img
                        src={club.logoUrl}
                        alt={club.name}
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-headline-sm text-2xl text-white uppercase m-0 leading-none">
                          {club.name}
                        </h2>
                        <span 
                          className="font-label-caps text-[10px] font-bold px-2 py-0.5 border uppercase rounded-xs"
                          style={{ 
                            color: club.themeColor, 
                            borderColor: `${club.themeColor}60`,
                            backgroundColor: `${club.themeColor}20`
                          }}
                        >
                          {club.category}
                        </span>
                      </div>
                      <p className="font-body-md text-xs text-[#a09e9e] m-0 mt-1">
                        {club.subtitle} · <span className="italic">"{club.motto}"</span>
                      </p>
                    </div>
                  </div>

                  {/* Club Aggregate Stats */}
                  <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-[#333]">
                    <div className="text-center px-3 py-1 bg-[#121212] border border-[#2a2a2a] rounded-xs">
                      <span className="text-[9px] font-label-caps text-[#888] block">ATLETAS</span>
                      <span className="font-headline-sm text-lg text-white font-bold">{fighters.length}</span>
                    </div>
                    <div className="text-center px-3 py-1 bg-[#121212] border border-red-900/40 rounded-xs">
                      <span className="text-[9px] font-label-caps text-red-400 block">KOS</span>
                      <span className="font-headline-sm text-lg text-red-300 font-bold">{clubTotalKOs}</span>
                    </div>
                    <div className="text-center px-3 py-1 bg-[#121212] border border-amber-500/40 rounded-xs">
                      <span className="text-[9px] font-label-caps text-amber-400 block">PUNTOS</span>
                      <span className="font-headline-sm text-lg text-amber-400 font-bold">{clubTotalPoints} PTS</span>
                    </div>
                  </div>
                </div>

                {/* Fighters List Inside Club */}
                {fighters.length === 0 ? (
                  <div className="p-6 text-center text-xs font-label-caps text-[#777]">
                    NO HAY PELEADORES INSCRITOS EN ESTE CLUB TODAVÍA
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-[#141414]">
                    {fighters.map(f => (
                      <div 
                        key={f.id}
                        className="bg-[#1c1b1b] p-3 brutal-border border-[#2e2e2e] flex flex-col justify-between gap-2 hover:border-[#555] transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="font-headline-sm text-base text-white uppercase leading-tight">
                                {f.name}
                              </span>
                              {f.isChampion && (
                                <Crown className="w-3 h-3 fill-amber-400 text-amber-400" />
                              )}
                            </div>
                            {f.nickname && (
                              <span className="font-label-caps text-[10px] text-[#ffb4ac] font-bold block">
                                "{f.nickname}"
                              </span>
                            )}
                          </div>
                          <span 
                            className="font-label-caps text-[9px] font-bold px-1.5 py-0.2 border uppercase rounded-xs"
                            style={{ 
                              color: f.divisionColor, 
                              borderColor: `${f.divisionColor}55`,
                              backgroundColor: `${f.divisionColor}15`
                            }}
                          >
                            {f.divisionLabel.replace('PESO ', '')}
                          </span>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-4 gap-1 bg-[#121212] p-1.5 text-center text-[10px] font-label-caps border border-[#262626]">
                          <div>
                            <span className="text-[#666] block text-[8px]">REC</span>
                            <span className="text-white font-bold">{f.record}</span>
                          </div>
                          <div>
                            <span className="text-red-400 block text-[8px]">KO</span>
                            <span className="text-red-300 font-bold">{f.koScore}</span>
                          </div>
                          <div>
                            <span className="text-amber-400 block text-[8px]">DOM</span>
                            <span className="text-amber-300 font-bold">{f.domScore}</span>
                          </div>
                          <div>
                            <span className="text-emerald-400 block text-[8px]">KD</span>
                            <span className="text-emerald-300 font-bold">{f.kdScore}</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-1.5 pt-1">
                          <button
                            onClick={() => setSelectedFighterModal(f)}
                            className="flex-1 bg-[#242424] hover:bg-[#333] text-white py-1 text-[10px] font-label-caps uppercase brutal-cut-sm cursor-pointer"
                          >
                            ANÁLISIS
                          </button>
                          <button
                            onClick={() => handleSelectForMatchmaking(f)}
                            className="flex-1 bg-[#e61c24] hover:bg-[#c00015] text-white py-1 text-[10px] font-label-caps uppercase brutal-cut-sm cursor-pointer"
                          >
                            COMBATIR
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Fighter Analysis Dossier Modal */}
      {selectedFighterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#1c1b1b] brutal-border max-w-2xl w-full max-h-[90vh] overflow-y-auto brutal-cut shadow-2xl p-6 flex flex-col gap-5">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-[#333] pb-4">
              <div className="flex items-center gap-3.5">
                <div 
                  className="w-16 h-16 bg-[#0a0a0a] rounded-sm p-1.5 border flex items-center justify-center shrink-0 shadow-lg"
                  style={{ borderColor: selectedFighterModal.club.themeColor }}
                >
                  <img
                    src={selectedFighterModal.club.logoUrl}
                    alt={selectedFighterModal.club.name}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-headline-sm text-3xl text-white uppercase m-0 leading-tight">
                      {selectedFighterModal.name}
                    </h2>
                    {selectedFighterModal.isChampion && (
                      <span className="font-headline-sm text-xs bg-[#ffb4ac] text-black px-2 py-0.5 font-bold brutal-cut-sm">
                        CAMPEÓN
                      </span>
                    )}
                  </div>
                  {selectedFighterModal.nickname && (
                    <span className="font-label-caps text-sm text-[#ffb4ac] font-bold block">
                      "{selectedFighterModal.nickname}"
                    </span>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span 
                      className="font-label-caps text-[10px] font-bold px-2 py-0.5 border uppercase rounded-xs"
                      style={{ 
                        color: selectedFighterModal.club.themeColor, 
                        borderColor: `${selectedFighterModal.club.themeColor}60`,
                        backgroundColor: `${selectedFighterModal.club.themeColor}20`
                      }}
                    >
                      {selectedFighterModal.club.name}
                    </span>
                    <span 
                      className="font-label-caps text-[10px] font-bold px-2 py-0.5 border uppercase rounded-xs"
                      style={{ 
                        color: selectedFighterModal.divisionColor, 
                        borderColor: `${selectedFighterModal.divisionColor}60`,
                        backgroundColor: `${selectedFighterModal.divisionColor}20`
                      }}
                    >
                      {selectedFighterModal.divisionLabel} · {selectedFighterModal.height}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedFighterModal(null)}
                className="text-[#888] hover:text-white text-xl p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#121212] p-3 brutal-border border-[#2a2a2a]">
              <div className="text-center">
                <span className="text-[10px] font-label-caps text-[#888] block">RÉCORD GENERAL</span>
                <span className="font-headline-sm text-xl text-white font-bold">{selectedFighterModal.record}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] font-label-caps text-[#888] block">EFECTIVIDAD</span>
                <span className="font-headline-sm text-xl text-emerald-400 font-bold">{selectedFighterModal.winRate}%</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] font-label-caps text-[#888] block">RACHA ACTUAL</span>
                <span className="font-headline-sm text-xl text-amber-300 font-bold">{selectedFighterModal.streak}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] font-label-caps text-amber-400 block">TOTAL PUNTOS</span>
                <span className="font-headline-sm text-xl text-amber-400 font-bold">{selectedFighterModal.totalPoints} PTS</span>
              </div>
            </div>

            {/* Combat Analysis Breakdown (KO, Dominancia, KD) */}
            <div className="flex flex-col gap-3 bg-[#141414] p-4 brutal-border border-[#2e2e2e]">
              <h3 className="font-headline-sm text-lg text-white uppercase m-0 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#e61c24]" />
                DESGLOSE DE PUNTUACIÓN & MÉRITOS OFICIALES
              </h3>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#240a0d] border border-red-800/80 p-3 rounded-xs flex flex-col items-center text-center">
                  <Flame className="w-5 h-5 text-red-500 mb-1" />
                  <span className="font-label-caps text-xs text-red-300 font-bold">KNOCKOUTS</span>
                  <span className="font-headline-sm text-2xl text-red-200 font-bold mt-1">
                    {selectedFighterModal.koScore}
                  </span>
                  <span className="text-[9px] font-label-caps text-red-400/80 mt-1">
                    +{(selectedFighterModal.koScore * 3)} PTS ACUMULADOS
                  </span>
                </div>

                <div className="bg-[#2d1e02] border border-amber-700/80 p-3 rounded-xs flex flex-col items-center text-center">
                  <Crown className="w-5 h-5 text-amber-400 mb-1" />
                  <span className="font-label-caps text-xs text-amber-300 font-bold">DOMINANCIA</span>
                  <span className="font-headline-sm text-2xl text-amber-200 font-bold mt-1">
                    {selectedFighterModal.domScore}
                  </span>
                  <span className="text-[9px] font-label-caps text-amber-400/80 mt-1">
                    +{(selectedFighterModal.domScore * 2)} PTS ACUMULADOS
                  </span>
                </div>

                <div className="bg-[#032612] border border-emerald-700/80 p-3 rounded-xs flex flex-col items-center text-center">
                  <Target className="w-5 h-5 text-emerald-400 mb-1" />
                  <span className="font-label-caps text-xs text-emerald-300 font-bold">KNOCKDOWNS</span>
                  <span className="font-headline-sm text-2xl text-emerald-200 font-bold mt-1">
                    {selectedFighterModal.kdScore}
                  </span>
                  <span className="text-[9px] font-label-caps text-emerald-400/80 mt-1">
                    +{(selectedFighterModal.kdScore * 1)} PTS ACUMULADOS
                  </span>
                </div>
              </div>
            </div>

            {/* Club Information Dossier */}
            <div className="bg-[#121212] p-4 brutal-border border-[#2a2a2a] flex flex-col gap-2">
              <span className="text-[10px] font-label-caps text-amber-400 font-bold uppercase flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                AFILIACIÓN OFICIAL: {selectedFighterModal.club.name}
              </span>
              <p className="font-body-md text-xs text-[#c8c6c5] m-0 leading-relaxed">
                {selectedFighterModal.club.description}
              </p>
              <div className="text-[10px] font-label-caps text-[#888] italic mt-1">
                Lema: "{selectedFighterModal.club.motto}"
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2 pt-2 border-t border-[#333]">
              <button
                onClick={() => setSelectedFighterModal(null)}
                className="w-1/2 bg-[#2a2a2a] hover:bg-[#353534] text-white font-headline-sm text-base py-2.5 brutal-cut uppercase cursor-pointer"
              >
                CERRAR
              </button>
              <button
                onClick={() => {
                  const target = selectedFighterModal;
                  setSelectedFighterModal(null);
                  handleSelectForMatchmaking(target);
                }}
                className="w-1/2 bg-[#e61c24] hover:bg-[#c00015] text-white font-headline-sm text-base py-2.5 brutal-cut uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
              >
                <Swords className="w-4 h-4" />
                <span>AGENDAR EN MATCHMAKING</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
