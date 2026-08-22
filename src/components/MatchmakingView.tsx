import React, { useState, useEffect } from 'react';
import { UgcDivision, RankedFighterItem, Fighter } from '../types';
import { Swords, Trophy, UserCheck, Lock, Unlock, Plus, Trash2, X, Search, RefreshCw } from 'lucide-react';

interface MatchmakingViewProps {
  fighters: Fighter[];
  initialRedCornerId?: string;
  initialBlueCornerId?: string;
  onViewFighterProfile: (fighterId: string) => void;
  onRecordFightResult: (winnerId: string, loserId: string, method: string, roundTime: string) => void;
}

type CardSection = 'MAIN_EVENT' | 'MAIN_CARD' | 'PRELIMS';

interface BuilderMatch {
  id: string;
  redId: string | null;
  blueId: string | null;
  section: CardSection;
  isTitleFight: boolean;
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

// Reads the same fighters that appear in the Rankings tab
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

export const MatchmakingView: React.FC<MatchmakingViewProps> = () => {
  const [cardLocked, setCardLocked] = useState<boolean>(false);
  const [registered, setRegistered] = useState<RegisteredFighter[]>(() => loadRegisteredFighters());

  const [matches, setMatches] = useState<BuilderMatch[]>(() => [
    { id: makeId(), redId: null, blueId: null, section: 'MAIN_EVENT', isTitleFight: false }
  ]);

  // Only divisions that actually have registered fighters show up as filter options
  const availableDivisions = DIVISION_META.filter(d => registered.some(f => f.divisionId === d.id));

  const [filterLeft, setFilterLeft] = useState<UgcDivision | 'ALL'>('ALL');
  const [filterRight, setFilterRight] = useState<UgcDivision | 'ALL'>('ALL');
  const [searchLeft, setSearchLeft] = useState('');
  const [searchRight, setSearchRight] = useState('');
  const [selectedFighterId, setSelectedFighterId] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);

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
    setMatches(prev => [...prev, { id: makeId(), redId: null, blueId: null, section: 'MAIN_CARD', isTitleFight: false }]);
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

  const renderMatchCard = (match: BuilderMatch, displayNumber: number) => {
    const red = getFighter(match.redId);
    const blue = getFighter(match.blueId);
    const bothFilled = !!red && !!blue;
    const weightMismatch = bothFilled && red!.divisionId !== blue!.divisionId;

    return (
      <div key={match.id} className="bg-[#1c1b1b] brutal-border p-4 flex flex-col gap-3 min-w-0">
        <div className="flex justify-between items-center gap-2 flex-wrap">
          <span className="font-label-caps text-xs text-[#a09e9e] font-bold uppercase">PELEA #{displayNumber}</span>
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

        {match.isTitleFight && match.section === 'MAIN_EVENT' && (
          <div className="font-label-caps text-[10px] text-[#ffb4ac] text-center uppercase font-bold">🏆 PELEA POR EL CAMPEONATO</div>
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
            ARMA LA CARTELERA CON LOS LUCHADORES REGISTRADOS EN EL RANKING
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
        </div>
      </div>

      {registered.length === 0 && (
        <div className="bg-[#1c1b1b] brutal-border p-6 text-center font-label-caps text-xs text-[#a09e9e] uppercase">
          No hay luchadores registrados todavía. Ve a la pestaña RANKINGS e inscribe peleadores primero.
        </div>
      )}

      {/* 3-column layout: roster left / matches center / roster right */}
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

        {/* CENTER: MATCH BUILDER, grouped by section */}
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

          {/* Summary / breakdown of all bouts */}
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
    </div>
  );
};
