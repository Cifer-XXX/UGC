import React, { useState } from 'react';
import { UgcDivision, RankedFighterItem, Fighter } from '../types';
import { Swords, Trophy, Lock, Unlock, Plus, Trash2, X, Search, RefreshCw, Flame, Crown, Minus, Save, CheckCircle2, History as HistoryIcon } from 'lucide-react';

interface MatchmakingViewProps {
  fighters: Fighter[];
  initialRedCornerId?: string;
  initialBlueCornerId?: string;
  onViewFighterProfile: (fighterId: string) => void;
  onRecordFightResult: (winnerId: string, loserId: string, method: string, roundTime: string) => void;
  onNavigateToHistory?: () => void;
}

type CardSection = 'MAIN_EVENT' | 'MAIN_CARD' | 'PRELIMS';

interface BuilderMatch {
  id: string;
  redId: string | null;
  blueId: string | null;
  section: CardSection;
  isTitleFight: boolean;
  status: 'SCHEDULED' | 'FINISHED';
  redKo: number;
  redDom: number;
  redKd: number;
  blueKo: number;
  blueDom: number;
  blueKd: number;
  finalRedPoints?: number;
  finalBluePoints?: number;
  winnerId?: string | null; // null = draw
}

interface RegisteredFighter {
  id: string;
  name: string;
  nickname?: string;
  imageUrl: string;
  record: string;
  streak: string;
  divisionId: UgcDivision;
  divisionLabel: string;
  clubName?: string;
}

const RANKINGS_STORAGE_KEY = 'ugc_division_rankings_v3_clubs';
const FIGHT_CARD_HISTORY_KEY = 'ugc_fight_card_history_v1';

const DIVISION_META: { id: UgcDivision; label: string; color: string }[] = [
  { id: 'PESO PLUMA (1.50 M O MENOS - 1.69 M)', label: 'PESO PLUMA', color: '#ffb4ac' },
  { id: 'PESO WELTER (1.70 M - 1.89 M)', label: 'PESO WELTER', color: '#e61c24' },
  { id: 'PESO PESADO (1.90 M - 2.10 M)', label: 'PESO PESADO', color: '#ff5449' }
];

const makeId = () => `bout-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const SECTIONS: { key: CardSection; label: string; color: string; textColor: string }[] = [
  { key: 'MAIN_EVENT', label: 'MAIN EVENT', color: '#e61c24', textColor: '#ffffff' },
  { key: 'MAIN_CARD', label: 'MAIN CARD', color: '#22c55e', textColor: '#052e16' },
  { key: 'PRELIMS', label: 'PRELIMINARES', color: '#eab308', textColor: '#422006' }
];

const loadRegisteredFighters = (): RegisteredFighter[] => {
  try {
    const raw = localStorage.getItem(RANKINGS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: Record<string, RankedFighterItem[]> = JSON.parse(raw);
    const out: RegisteredFighter[] = [];
    DIVISION_META.forEach(div => {
      const list = parsed[div.id] || [];
      list.forEach(f => {
        out.push({
          id: f.id,
          name: f.name,
          nickname: f.nickname,
          imageUrl: f.clubLogoUrl || f.imageUrl || '',
          record: f.record,
          streak: f.streak,
          divisionId: div.id,
          divisionLabel: div.label,
          clubName: f.clubName
        });
      });
    });
    return out;
  } catch (e) {
    console.error('Error loading rankings for matchmaking', e);
    return [];
  }
};

const sortByPointsDesc = (list: RankedFighterItem[]): RankedFighterItem[] => {
  return [...list].sort((a, b) => {
    const ptsA = a.ascensoPoints ?? 0;
    const ptsB = b.ascensoPoints ?? 0;
    if (ptsB !== ptsA) return ptsB - ptsA;
    const winsA = parseInt((a.record || '0-0-0').split('-')[0], 10) || 0;
    const winsB = parseInt((b.record || '0-0-0').split('-')[0], 10) || 0;
    if (winsB !== winsA) return winsB - winsA;
    const lossA = parseInt((a.record || '0-0-0').split('-')[1], 10) || 0;
    const lossB = parseInt((b.record || '0-0-0').split('-')[1], 10) || 0;
    if (lossA !== lossB) return lossA - lossB;
    return 0;
  }).map((fighter, idx) => ({ ...fighter, isChampion: idx === 0 }));
};

const nextStreak = (current: string, result: 'W' | 'L' | 'D'): string => {
  const upper = (current || '').toUpperCase();
  const num = parseInt(upper.replace(/[^0-9]/g, ''), 10) || 0;
  if (result === 'W') return upper.startsWith('W') ? `W${num + 1}` : 'W1';
  if (result === 'L') return upper.startsWith('L') ? `L${num + 1}` : 'L1';
  return upper.startsWith('D') ? `D${num + 1}` : 'D1';
};

const nextRecord = (record: string, result: 'W' | 'L' | 'D'): string => {
  const parts = (record || '0-0-0').split('-').map(n => parseInt(n, 10) || 0);
  let [w, l, d] = parts;
  if (result === 'W') w += 1;
  if (result === 'L') l += 1;
  if (result === 'D') d += 1;
  return `${w}-${l}-${d}`;
};

// Applies fight points/record/streak to the fighter stored in the Rankings localStorage
const applyResultToRankings = (
  redId: string, redKo: number, redDom: number, redKd: number, redResult: 'W' | 'L' | 'D',
  blueId: string, blueKo: number, blueDom: number, blueKd: number, blueResult: 'W' | 'L' | 'D'
) => {
  try {
    const raw = localStorage.getItem(RANKINGS_STORAGE_KEY);
    if (!raw) return;
    const parsed: Record<string, RankedFighterItem[]> = JSON.parse(raw);

    const applyTo = (list: RankedFighterItem[], id: string, ko: number, dom: number, kd: number, result: 'W' | 'L' | 'D') =>
      list.map(f => {
        if (f.id !== id) return f;
        const earned = ko * 3 + dom * 2 + kd * 1;
        return {
          ...f,
          points: (f.points ?? 0) + earned,
          koCount: (f.koCount ?? 0) + ko,
          dominanceCount: (f.dominanceCount ?? 0) + dom,
          kdCount: (f.kdCount ?? 0) + kd,
          record: nextRecord(f.record, result),
          streak: nextStreak(f.streak, result),
          movement: 'NEW'
        };
      });

    Object.keys(parsed).forEach(divKey => {
      let list = parsed[divKey] || [];
      list = applyTo(list, redId, redKo, redDom, redKd, redResult);
      list = applyTo(list, blueId, blueKo, blueDom, blueKd, blueResult);
      parsed[divKey] = sortByPointsDesc(list);
    });

    localStorage.setItem(RANKINGS_STORAGE_KEY, JSON.stringify(parsed));
  } catch (e) {
    console.error('Error applying fight result to rankings', e);
  }
};

export const MatchmakingView: React.FC<MatchmakingViewProps> = ({ onNavigateToHistory }) => {
  const [cardLocked, setCardLocked] = useState<boolean>(false);
  const [registered, setRegistered] = useState<RegisteredFighter[]>(() => loadRegisteredFighters());

  const [matches, setMatches] = useState<BuilderMatch[]>(() => [
    {
      id: makeId(), redId: null, blueId: null, section: 'MAIN_EVENT', isTitleFight: false,
      status: 'SCHEDULED', redKo: 0, redDom: 0, redKd: 0, blueKo: 0, blueDom: 0, blueKd: 0
    }
  ]);

  const availableDivisions = DIVISION_META.filter(d => registered.some(f => f.divisionId === d.id));

  const [filterLeft, setFilterLeft] = useState<UgcDivision | 'ALL'>('ALL');
  const [filterRight, setFilterRight] = useState<UgcDivision | 'ALL'>('ALL');
  const [searchLeft, setSearchLeft] = useState('');
  const [searchRight, setSearchRight] = useState('');
  const [selectedFighterId, setSelectedFighterId] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [cardNameInput, setCardNameInput] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const refreshRoster = () => setRegistered(loadRegisteredFighters());

  const getFighter = (id: string | null | undefined) => registered.find(f => f.id === id) || null;

  const assignedIds = new Set(
    matches.flatMap(m => [m.redId, m.blueId]).filter((id): id is string => !!id)
  );

  const buildPool = (filter: UgcDivision | 'ALL', search: string) =>
    registered.filter(f => {
      if (assignedIds.has(f.id)) return false;
      if (filter !== 'ALL' && f.divisionId !== filter) return false;
      if (search.trim() && !`${f.name} ${f.nickname || ''} ${f.clubName || ''}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

  const poolLeft = buildPool(filterLeft, searchLeft);
  const poolRight = buildPool(filterRight, searchRight);

  const addMatch = () => {
    if (cardLocked) return;
    setMatches(prev => [...prev, {
      id: makeId(), redId: null, blueId: null, section: 'MAIN_CARD', isTitleFight: false,
      status: 'SCHEDULED', redKo: 0, redDom: 0, redKd: 0, blueKo: 0, blueDom: 0, blueKd: 0
    }]);
  };

  const removeMatch = (id: string) => {
    if (cardLocked) return;
    setMatches(prev => prev.filter(m => m.id !== id));
  };

  const assignFighter = (matchId: string, corner: 'red' | 'blue', fighterId: string) => {
    if (cardLocked) return;
    setMatches(prev => prev.map(m => {
      if (m.id !== matchId) return m;
      if (corner === 'red') return { ...m, redId: fighterId };
      return { ...m, blueId: fighterId };
    }));
    setSelectedFighterId(null);
  };

  const clearSlot = (matchId: string, corner: 'red' | 'blue') => {
    if (cardLocked) return;
    setMatches(prev => prev.map(m => {
      if (m.id !== matchId) return m;
      if (corner === 'red') return { ...m, redId: null };
      return { ...m, blueId: null };
    }));
  };

  const setMatchSection = (matchId: string, section: CardSection) => {
    if (cardLocked) return;
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, section, isTitleFight: section === 'MAIN_EVENT' ? m.isTitleFight : false } : m));
  };

  const toggleTitleFight = (matchId: string) => {
    if (cardLocked) return;
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, isTitleFight: !m.isTitleFight } : m));
  };

  const handleDrop = (matchId: string, corner: 'red' | 'blue', e: React.DragEvent) => {
    e.preventDefault();
    setDragOverSlot(null);
    if (cardLocked) return;
    const fighterId = e.dataTransfer.getData('fighterId');
    if (fighterId) assignFighter(matchId, corner, fighterId);
  };

  const handleSlotClick = (matchId: string, corner: 'red' | 'blue') => {
    if (cardLocked || !selectedFighterId) return;
    assignFighter(matchId, corner, selectedFighterId);
  };

  // ---- Live scoring ----
  const adjustPoints = (matchId: string, corner: 'red' | 'blue', field: 'ko' | 'dom' | 'kd', delta: number) => {
    setMatches(prev => prev.map(m => {
      if (m.id !== matchId || m.status === 'FINISHED') return m;
      const key = `${corner}${field[0].toUpperCase()}${field.slice(1)}` as 'redKo' | 'redDom' | 'redKd' | 'blueKo' | 'blueDom' | 'blueKd';
      const next = Math.max(0, (m[key] as number) + delta);
      return { ...m, [key]: next };
    }));
  };

  const undoLastPoint = (matchId: string, corner: 'red' | 'blue') => {
    setMatches(prev => prev.map(m => {
      if (m.id !== matchId || m.status === 'FINISHED') return m;
      const kdKey = corner === 'red' ? 'redKd' : 'blueKd';
      const domKey = corner === 'red' ? 'redDom' : 'blueDom';
      const koKey = corner === 'red' ? 'redKo' : 'blueKo';
      if ((m[kdKey] as number) > 0) return { ...m, [kdKey]: (m[kdKey] as number) - 1 };
      if ((m[domKey] as number) > 0) return { ...m, [domKey]: (m[domKey] as number) - 1 };
      if ((m[koKey] as number) > 0) return { ...m, [koKey]: (m[koKey] as number) - 1 };
      return m;
    }));
  };

  const pointsOf = (m: BuilderMatch, corner: 'red' | 'blue') => corner === 'red'
    ? m.redKo * 3 + m.redDom * 2 + m.redKd * 1
    : m.blueKo * 3 + m.blueDom * 2 + m.blueKd * 1;

  const finalizeMatch = (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (!match || !match.redId || !match.blueId || match.status === 'FINISHED') return;
    const redPts = pointsOf(match, 'red');
    const bluePts = pointsOf(match, 'blue');

    let winnerId: string | null = null;
    let redResult: 'W' | 'L' | 'D' = 'D';
    let blueResult: 'W' | 'L' | 'D' = 'D';
    if (redPts > bluePts) { winnerId = match.redId; redResult = 'W'; blueResult = 'L'; }
    else if (bluePts > redPts) { winnerId = match.blueId; redResult = 'L'; blueResult = 'W'; }

    applyResultToRankings(
      match.redId, match.redKo, match.redDom, match.redKd, redResult,
      match.blueId, match.blueKo, match.blueDom, match.blueKd, blueResult
    );

    setMatches(prev => prev.map(m => m.id === matchId ? {
      ...m, status: 'FINISHED', winnerId, finalRedPoints: redPts, finalBluePoints: bluePts
    } : m));

    refreshRoster();
  };

  // ---- Save whole card to Historia ----
  const finishedCount = matches.filter(m => m.status === 'FINISHED').length;

  const openSaveModal = () => {
    setCardNameInput('');
    setSaveSuccessMsg(null);
    setIsSaveModalOpen(true);
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNameInput.trim()) return;

    const bouts = matches.map((m, idx) => {
      const red = getFighter(m.redId);
      const blue = getFighter(m.blueId);
      const section = SECTIONS.find(s => s.key === m.section)!;
      return {
        id: m.id,
        order: idx + 1,
        section: m.section,
        sectionLabel: section.label,
        isTitleFight: m.isTitleFight,
        redName: red ? `${red.name}${red.nickname ? ` "${red.nickname}"` : ''}` : 'SIN ASIGNAR',
        redImageUrl: red?.imageUrl || '',
        redPoints: m.status === 'FINISHED' ? (m.finalRedPoints ?? 0) : pointsOf(m, 'red'),
        blueName: blue ? `${blue.name}${blue.nickname ? ` "${blue.nickname}"` : ''}` : 'SIN ASIGNAR',
        blueImageUrl: blue?.imageUrl || '',
        bluePoints: m.status === 'FINISHED' ? (m.finalBluePoints ?? 0) : pointsOf(m, 'blue'),
        status: m.status,
        winnerName: m.status === 'FINISHED'
          ? (m.winnerId === null ? null : (m.winnerId === m.redId ? red?.name || null : blue?.name || null))
          : null,
        isDraw: m.status === 'FINISHED' && m.winnerId === null
      };
    });

    const newCard = {
      id: `card-${Date.now()}`,
      name: cardNameInput.trim().toUpperCase(),
      savedAt: new Date().toISOString(),
      bouts
    };

    try {
      const existingRaw = localStorage.getItem(FIGHT_CARD_HISTORY_KEY);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const updated = [newCard, ...existing];
      localStorage.setItem(FIGHT_CARD_HISTORY_KEY, JSON.stringify(updated));
      setSaveSuccessMsg(`¡La cartelera "${newCard.name}" se guardó en Historia!`);
    } catch (err) {
      console.error('Error saving fight card', err);
    }
  };

  const renderFighterListItem = (f: RegisteredFighter) => (
    <div
      key={f.id}
      draggable={!cardLocked}
      onDragStart={(e) => e.dataTransfer.setData('fighterId', f.id)}
      onClick={() => !cardLocked && setSelectedFighterId(prev => prev === f.id ? null : f.id)}
      className={`flex items-center gap-2 p-2 bg-[#131313] brutal-border cursor-pointer transition-all min-w-0 ${
        selectedFighterId === f.id ? 'ring-2 ring-[#e61c24]' : ''
      } ${cardLocked ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#e61c24]'}`}
    >
      <img src={f.imageUrl} alt={f.name} className="w-10 h-10 object-contain bg-[#0a0a0a] brutal-border flex-shrink-0 p-0.5" referrerPolicy="no-referrer" />
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="font-label-caps text-[11px] text-white truncate">{f.name}{f.nickname ? ` "${f.nickname}"` : ''}</div>
        <div className="font-label-caps text-[10px] text-[#767575] truncate">{f.record} · {f.divisionLabel}{f.clubName ? ` · ${f.clubName}` : ''}</div>
      </div>
    </div>
  );

  const renderSlot = (match: BuilderMatch, corner: 'red' | 'blue') => {
    const fighterId = corner === 'red' ? match.redId : match.blueId;
    const fighter = getFighter(fighterId);
    const slotKey = `${match.id}-${corner}`;
    const accent = corner === 'red' ? '#e61c24' : '#3b82f6';

    if (fighter) {
      return (
        <div className="relative bg-[#131313] brutal-border p-2 flex items-center gap-2 min-w-0 overflow-hidden">
          <img src={fighter.imageUrl} alt={fighter.name} className="w-12 h-12 object-contain bg-[#0a0a0a] brutal-border flex-shrink-0 p-0.5" referrerPolicy="no-referrer" />
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="font-label-caps text-[11px] text-white truncate">{fighter.name}{fighter.nickname ? ` "${fighter.nickname}"` : ''}</div>
            <div className="font-label-caps text-[10px] truncate" style={{ color: accent }}>{fighter.record} · {fighter.divisionLabel}</div>
          </div>
          {!cardLocked && (
            <button onClick={() => clearSlot(match.id, corner)} className="p-1 bg-[#2a2a2a] hover:bg-[#e61c24] text-white flex-shrink-0" title="Quitar">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      );
    }

    return (
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOverSlot(slotKey); }}
        onDragLeave={() => setDragOverSlot(null)}
        onDrop={(e) => handleDrop(match.id, corner, e)}
        onClick={() => handleSlotClick(match.id, corner)}
        className={`p-4 border-2 border-dashed flex items-center justify-center text-center font-label-caps text-[10px] uppercase cursor-pointer transition-colors min-w-0 ${
          dragOverSlot === slotKey ? 'border-[#e61c24] bg-[#2a1414] text-white' : 'border-[#353534] text-[#767575]'
        }`}
        style={{ minHeight: '68px' }}
      >
        Arrastra o selecciona<br />un luchador
      </div>
    );
  };

  const renderPointsPanel = (match: BuilderMatch, corner: 'red' | 'blue') => {
    const fighter = getFighter(corner === 'red' ? match.redId : match.blueId);
    if (!fighter) return null;
    const accent = corner === 'red' ? '#e61c24' : '#3b82f6';
    const pts = pointsOf(match, corner);

    return (
      <div className="bg-[#131313] brutal-border p-2.5 flex flex-col gap-2 min-w-0">
        <div className="flex justify-between items-center">
          <span className="font-label-caps text-[10px] font-bold truncate" style={{ color: accent }}>{fighter.name}</span>
          <span className="font-headline-sm text-lg text-amber-400 font-bold leading-none">{pts} PTS</span>
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          <button onClick={() => adjustPoints(match.id, corner, 'ko', 1)} className="bg-[#42090e] hover:bg-[#b0101a] text-red-200 hover:text-white border border-red-700/80 font-label-caps text-[10px] px-2 py-1 brutal-cut-sm flex items-center gap-1">
            <Flame className="w-3 h-3" /> KO +3
          </button>
          <button onClick={() => adjustPoints(match.id, corner, 'dom', 1)} className="bg-[#382602] hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-600/80 font-label-caps text-[10px] px-2 py-1 brutal-cut-sm flex items-center gap-1">
            <Crown className="w-3 h-3" /> +2
          </button>
          <button onClick={() => adjustPoints(match.id, corner, 'kd', 1)} className="bg-[#032a13] hover:bg-emerald-600 text-emerald-300 hover:text-black border border-emerald-600/80 font-label-caps text-[10px] px-2 py-1 brutal-cut-sm">
            KD +1
          </button>
          <button onClick={() => undoLastPoint(match.id, corner)} className="bg-[#1e1e1e] hover:bg-[#2e2e2e] text-[#888] hover:text-white border border-[#444] font-label-caps text-[10px] px-1.5 py-1 brutal-cut-sm">
            <Minus className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  const renderMatchCard = (match: BuilderMatch, displayNumber: number) => {
    const red = getFighter(match.redId);
    const blue = getFighter(match.blueId);
    const bothFilled = !!red && !!blue;
    const weightMismatch = bothFilled && red!.divisionId !== blue!.divisionId;
    const canScore = cardLocked && bothFilled && match.status === 'SCHEDULED';

    return (
      <div key={match.id} className="bg-[#1c1b1b] brutal-border p-4 flex flex-col gap-3 min-w-0">
        <div className="flex justify-between items-center gap-2 flex-wrap">
          <span className="font-label-caps text-xs text-[#a09e9e] font-bold uppercase">
            PELEA #{displayNumber} {match.status === 'FINISHED' && <span className="text-emerald-400">· FINALIZADA</span>}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {match.section === 'MAIN_EVENT' && (
              <button
                onClick={() => toggleTitleFight(match.id)}
                disabled={cardLocked}
                className={`px-2.5 py-1 font-label-caps text-[10px] uppercase brutal-border transition-colors flex items-center gap-1 disabled:opacity-40 ${
                  match.isTitleFight ? 'bg-[#ffb4ac] text-black font-bold' : 'bg-[#2a2a2a] text-[#c8c6c5]'
                }`}
              >
                <Trophy className="w-3 h-3" />
                {match.isTitleFight ? 'PELEA POR EL TÍTULO' : 'MARCAR COMO TÍTULO'}
              </button>
            )}
            <select
              value={match.section}
              onChange={(e) => setMatchSection(match.id, e.target.value as CardSection)}
              disabled={cardLocked}
              className="bg-[#131313] text-[#e5e2e1] brutal-border px-2 py-1 font-label-caps text-[10px] uppercase focus:outline-none disabled:opacity-40"
            >
              {SECTIONS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
            {!cardLocked && (
              <button onClick={() => removeMatch(match.id)} className="p-1 bg-[#2a2a2a] hover:bg-[#e61c24] text-white" title="Eliminar pelea">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center min-w-0">
          <div className="min-w-0">{renderSlot(match, 'red')}</div>
          <span className="font-display-lg text-2xl text-[#e61c24] leading-none">VS</span>
          <div className="min-w-0">{renderSlot(match, 'blue')}</div>
        </div>

        {weightMismatch && (
          <div className="font-label-caps text-[10px] text-[#eab308] text-center uppercase">⚠ Catchweight · divisiones distintas</div>
        )}

        {match.isTitleFight && match.section === 'MAIN_EVENT' && match.status === 'SCHEDULED' && (
          <div className="font-label-caps text-[10px] text-[#ffb4ac] text-center uppercase font-bold">🏆 PELEA POR EL CAMPEONATO</div>
        )}

        {canScore && (
          <div className="flex flex-col gap-2 border-t border-[#333333] pt-3">
            <span className="font-label-caps text-[10px] text-[#a09e9e] uppercase font-bold text-center">
              🔴 CARTELERA CERRADA · REGISTRA PUNTOS EN VIVO
            </span>
            <div className="grid grid-cols-2 gap-2">
              {renderPointsPanel(match, 'red')}
              {renderPointsPanel(match, 'blue')}
            </div>
            <button
              onClick={() => finalizeMatch(match.id)}
              className="w-full bg-[#e61c24] hover:bg-[#c00015] text-white font-headline-sm text-base py-2 brutal-cut uppercase flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> FINALIZAR PELEA
            </button>
          </div>
        )}

        {match.status === 'FINISHED' && (
          <div className="bg-[#131313] border-2 border-emerald-500 p-3 text-center flex flex-col gap-1">
            <span className="font-label-caps text-[10px] text-emerald-400 uppercase font-bold">
              {match.winnerId === null ? 'RESULTADO: EMPATE' : 'GANADOR POR PUNTOS'}
            </span>
            {match.winnerId !== null && (
              <span className="font-headline-sm text-lg text-white uppercase">
                {match.winnerId === match.redId ? red?.name : blue?.name}
              </span>
            )}
            <span className="font-label-caps text-[10px] text-[#a09e9e]">
              MARCADOR: {match.finalRedPoints ?? 0} — {match.finalBluePoints ?? 0}
            </span>
          </div>
        )}
      </div>
    );
  };

  let runningNumber = 0;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#1c1b1b] brutal-border p-4 gap-3">
        <div>
          <h1 className="font-headline-lg text-3xl md:text-4xl text-[#e5e2e1] uppercase m-0 leading-none flex items-center gap-2">
            <Swords className="w-7 h-7 text-[#e61c24]" />
            OCTAGON MATCHMAKER
          </h1>
          <p className="font-label-caps text-xs text-[#a09e9e] mt-1">
            ARMA LA CARTELERA, CIERRA, ANOTA PUNTOS EN VIVO Y GUARDA EL RESULTADO
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={refreshRoster}
            className="px-3 py-1.5 font-label-caps text-xs uppercase brutal-border transition-colors flex items-center gap-1 bg-[#2a2a2a] text-[#c8c6c5] hover:text-white"
            title="Recargar luchadores registrados en el Ranking"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            ACTUALIZAR ROSTER
          </button>
          <button
            onClick={() => setCardLocked(!cardLocked)}
            className={`px-3 py-1.5 font-label-caps text-xs uppercase brutal-border transition-colors flex items-center gap-1 ${cardLocked ? 'bg-[#22c55e] text-black font-bold' : 'bg-[#2a2a2a] text-[#c8c6c5]'}`}
          >
            {cardLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            {cardLocked ? 'CARTELERA CERRADA' : 'CERRAR CARTELERA'}
          </button>
          {cardLocked && finishedCount > 0 && (
            <button
              onClick={openSaveModal}
              className="px-3 py-1.5 font-label-caps text-xs uppercase brutal-border transition-colors flex items-center gap-1 bg-amber-500 text-black font-bold hover:bg-amber-400"
            >
              <Save className="w-3.5 h-3.5" /> GUARDAR CARTELERA EN HISTORIA
            </button>
          )}
        </div>
      </div>

      {registered.length === 0 && (
        <div className="bg-[#1c1b1b] brutal-border p-6 text-center font-label-caps text-xs text-[#a09e9e] uppercase">
          No hay luchadores registrados todavía. Ve a la pestaña RANKINGS e inscribe peleadores primero.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT ROSTER PANEL */}
        <div className="lg:col-span-3 flex flex-col gap-3 bg-[#1c1b1b] brutal-border p-3 min-w-0">
          <span className="font-label-caps text-xs text-[#e5e2e1] font-bold uppercase">ROSTER · PANEL A</span>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#767575] absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              value={searchLeft}
              onChange={(e) => setSearchLeft(e.target.value)}
              placeholder="Buscar..."
              className="w-full bg-[#131313] text-white pl-7 pr-2 py-1.5 brutal-border font-label-caps text-xs focus:outline-none focus:border-[#e61c24]"
            />
          </div>
          <select
            value={filterLeft}
            onChange={(e) => setFilterLeft(e.target.value as UgcDivision | 'ALL')}
            className="bg-[#131313] text-[#e5e2e1] brutal-border px-2 py-1.5 font-label-caps text-xs uppercase focus:outline-none"
          >
            <option value="ALL">TODAS LAS DIVISIONES</option>
            {availableDivisions.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
          <div className="flex flex-col gap-1.5 max-h-[560px] overflow-y-auto pr-1">
            {poolLeft.length === 0 && <span className="font-label-caps text-[10px] text-[#767575] text-center py-4">Sin luchadores disponibles</span>}
            {poolLeft.map(renderFighterListItem)}
          </div>
        </div>

        {/* CENTER: MATCH BUILDER */}
        <div className="lg:col-span-6 flex flex-col gap-3 min-w-0">
          {SECTIONS.map(section => {
            const inSection = matches.filter(m => m.section === section.key);
            if (inSection.length === 0) return null;
            return (
              <React.Fragment key={section.key}>
                <div
                  className="font-label-caps text-xs font-bold uppercase text-center py-2 brutal-border tracking-widest"
                  style={{ backgroundColor: section.color, color: section.textColor }}
                >
                  {section.label}
                </div>
                {inSection.map(m => {
                  runningNumber += 1;
                  return renderMatchCard(m, runningNumber);
                })}
              </React.Fragment>
            );
          })}

          {!cardLocked && (
            <button
              onClick={addMatch}
              className="border-2 border-dashed border-[#353534] hover:border-[#e61c24] text-[#a09e9e] hover:text-white font-label-caps text-xs uppercase py-3 flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" /> AGREGAR PELEA
            </button>
          )}

          {/* Summary / breakdown */}
          <div className="bg-[#1c1b1b] brutal-border p-4 min-w-0">
            <span className="font-label-caps text-xs text-[#e5e2e1] font-bold uppercase block mb-2">DESGLOSE DE LA CARTELERA</span>
            {matches.length === 0 && <span className="font-label-caps text-[10px] text-[#767575]">No hay peleas agregadas.</span>}
            <div className="flex flex-col gap-1.5">
              {SECTIONS.flatMap(section => matches.filter(m => m.section === section.key).map(m => {
                const red = getFighter(m.redId);
                const blue = getFighter(m.blueId);
                return (
                  <div key={m.id} className="flex items-center bg-[#131313] px-3 py-2 brutal-border font-label-caps text-[10px] uppercase gap-2 min-w-0">
                    <span className="px-1.5 py-0.5 flex-shrink-0" style={{ backgroundColor: section.color, color: section.textColor }}>
                      {section.label}
                    </span>
                    {m.isTitleFight && <Trophy className="w-3 h-3 text-[#ffb4ac] flex-shrink-0" />}
                    <span className="text-[#e61c24] flex-1 text-right truncate">{red ? red.name : '— SIN ASIGNAR —'}</span>
                    <span className="text-white px-1 flex-shrink-0">VS</span>
                    <span className="text-[#60a5fa] flex-1 truncate">{blue ? blue.name : '— SIN ASIGNAR —'}</span>
                    {m.status === 'FINISHED' && <span className="text-emerald-400 flex-shrink-0">✓</span>}
                  </div>
                );
              }))}
            </div>
          </div>
        </div>

        {/* RIGHT ROSTER PANEL */}
        <div className="lg:col-span-3 flex flex-col gap-3 bg-[#1c1b1b] brutal-border p-3 min-w-0">
          <span className="font-label-caps text-xs text-[#e5e2e1] font-bold uppercase">ROSTER · PANEL B</span>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#767575] absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              value={searchRight}
              onChange={(e) => setSearchRight(e.target.value)}
              placeholder="Buscar..."
              className="w-full bg-[#131313] text-white pl-7 pr-2 py-1.5 brutal-border font-label-caps text-xs focus:outline-none focus:border-[#3b82f6]"
            />
          </div>
          <select
            value={filterRight}
            onChange={(e) => setFilterRight(e.target.value as UgcDivision | 'ALL')}
            className="bg-[#131313] text-[#e5e2e1] brutal-border px-2 py-1.5 font-label-caps text-xs uppercase focus:outline-none"
          >
            <option value="ALL">TODAS LAS DIVISIONES</option>
            {availableDivisions.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
          <div className="flex flex-col gap-1.5 max-h-[560px] overflow-y-auto pr-1">
            {poolRight.length === 0 && <span className="font-label-caps text-[10px] text-[#767575] text-center py-4">Sin luchadores disponibles</span>}
            {poolRight.map(renderFighterListItem)}
          </div>
        </div>

      </div>

      {/* Save Card Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#1c1b1b] brutal-border border-amber-500/60 max-w-md w-full brutal-cut shadow-2xl p-6">
            <div className="flex justify-between items-center border-b border-[#333333] pb-3 mb-4">
              <h2 className="font-headline-sm text-2xl text-white uppercase m-0">GUARDAR CARTELERA</h2>
              <button onClick={() => setIsSaveModalOpen(false)} className="text-[#a09e9e] hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {saveSuccessMsg ? (
              <div className="flex flex-col gap-4 py-2 text-center items-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                <p className="font-body-md text-sm text-[#c8c6c5] m-0">{saveSuccessMsg}</p>
                <div className="flex gap-2 w-full mt-2">
                  <button
                    onClick={() => setIsSaveModalOpen(false)}
                    className="w-1/2 bg-[#2a2a2a] hover:bg-[#353534] text-white font-headline-sm text-base py-2.5 brutal-cut uppercase"
                  >
                    CERRAR
                  </button>
                  {onNavigateToHistory && (
                    <button
                      onClick={() => { setIsSaveModalOpen(false); onNavigateToHistory(); }}
                      className="w-1/2 bg-[#e61c24] hover:bg-[#c00015] text-white font-headline-sm text-base py-2.5 brutal-cut uppercase flex items-center justify-center gap-1.5"
                    >
                      <HistoryIcon className="w-4 h-4" /> IR A HISTORIA
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveCard} className="flex flex-col gap-3">
                <label className="font-label-caps text-[11px] text-[#ffb4ac] font-bold">NOMBRE DE LA CARTELERA *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="EJ: UGC NOCHE DE VIERNES"
                  value={cardNameInput}
                  onChange={(e) => setCardNameInput(e.target.value.toUpperCase())}
                  className="w-full bg-[#131313] brutal-border border-[#444] focus:border-amber-400 p-2.5 font-label-caps text-sm text-white uppercase focus:outline-none"
                />
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => setIsSaveModalOpen(false)} className="w-1/2 bg-[#2a2a2a] hover:bg-[#353534] text-white font-headline-sm text-lg py-2.5 brutal-cut uppercase">
                    CANCELAR
                  </button>
                  <button type="submit" className="w-1/2 bg-amber-500 hover:bg-amber-400 text-black font-headline-sm text-lg py-2.5 brutal-cut uppercase flex items-center justify-center gap-1.5 font-bold">
                    <Save className="w-4 h-4" /> GUARDAR
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
