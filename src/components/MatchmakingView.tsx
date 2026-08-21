import React, { useState, useEffect, useRef } from 'react';
import { Fighter, WeightClass } from '../types';
import { Swords, Trophy, Play, RotateCcw, UserCheck, Lock, Unlock, Plus, Trash2, X, Search } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MatchmakingViewProps {
  fighters: Fighter[];
  initialRedCornerId?: string;
  initialBlueCornerId?: string;
  onViewFighterProfile: (fighterId: string) => void;
  onRecordFightResult: (winnerId: string, loserId: string, method: string, roundTime: string) => void;
}

interface BuilderMatch {
  id: string;
  redId: string | null;
  blueId: string | null;
  rounds: 3 | 5;
  isTitleFight: boolean;
  status: 'SCHEDULED' | 'COMPLETED';
  winnerId?: string;
  method?: string;
  roundEnded?: number;
  timeEnded?: string;
}

const WEIGHT_CLASSES: WeightClass[] = [
  'FLYWEIGHT (125 LBS)',
  'BANTAMWEIGHT (135 LBS)',
  'FEATHERWEIGHT (145 LBS)',
  'LIGHTWEIGHT (155 LBS)',
  'WELTERWEIGHT (170 LBS)',
  'MIDDLEWEIGHT (185 LBS)',
  'LIGHT HEAVYWEIGHT (205 LBS)',
  'HEAVYWEIGHT (265 LBS)'
];

const makeId = () => `bout-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const MatchmakingView: React.FC<MatchmakingViewProps> = ({
  fighters,
  initialRedCornerId,
  initialBlueCornerId,
  onViewFighterProfile,
  onRecordFightResult
}) => {
  const [rounds, setRounds] = useState<3 | 5>(5);
  const [isTitleFight, setIsTitleFight] = useState<boolean>(true);
  const [cardLocked, setCardLocked] = useState<boolean>(false);

  const [matches, setMatches] = useState<BuilderMatch[]>(() => [
    {
      id: makeId(),
      redId: initialRedCornerId || null,
      blueId: initialBlueCornerId || null,
      rounds: 5,
      isTitleFight: true,
      status: 'SCHEDULED'
    }
  ]);

  const [filterLeft, setFilterLeft] = useState<WeightClass | 'ALL'>('ALL');
  const [filterRight, setFilterRight] = useState<WeightClass | 'ALL'>('ALL');
  const [searchLeft, setSearchLeft] = useState('');
  const [searchRight, setSearchRight] = useState('');
  const [selectedFighterId, setSelectedFighterId] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);

  // ----- Simulation state (applies to one match at a time) -----
  const [simMatchId, setSimMatchId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [combatLogs, setCombatLogs] = useState<string[]>([]);
  const [redHealth, setRedHealth] = useState(100);
  const [blueHealth, setBlueHealth] = useState(100);
  const [redStrikes, setRedStrikes] = useState(0);
  const [blueStrikes, setBlueStrikes] = useState(0);
  const timeLeftRef = useRef(300);

  const getFighter = (id: string | null | undefined) => fighters.find(f => f.id === id) || null;

  const assignedIds = new Set(
    matches.flatMap(m => [m.redId, m.blueId]).filter((id): id is string => !!id)
  );

  const buildPool = (filter: WeightClass | 'ALL', search: string) =>
    fighters.filter(f => {
      if (assignedIds.has(f.id)) return false;
      if (filter !== 'ALL' && f.weightClass !== filter) return false;
      if (search.trim() && !`${f.firstName} ${f.nickname} ${f.lastName}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

  const poolLeft = buildPool(filterLeft, searchLeft);
  const poolRight = buildPool(filterRight, searchRight);

  const addMatch = () => {
    if (cardLocked) return;
    setMatches(prev => [...prev, { id: makeId(), redId: null, blueId: null, rounds, isTitleFight, status: 'SCHEDULED' }]);
  };

  const removeMatch = (id: string) => {
    if (cardLocked) return;
    setMatches(prev => prev.filter(m => m.id !== id));
    if (simMatchId === id) { setSimMatchId(null); setIsSimulating(false); }
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

  // ----- Simulation logic -----
  const startSimulation = (match: BuilderMatch) => {
    if (!match.redId || !match.blueId) return;
    setSimMatchId(match.id);
    setIsSimulating(true);
    setCurrentRound(1);
    timeLeftRef.current = 300;
    setRedHealth(100);
    setBlueHealth(100);
    setRedStrikes(0);
    setBlueStrikes(0);
    const red = getFighter(match.redId)!;
    const blue = getFighter(match.blueId)!;
    setCombatLogs([
      `¡EL OCTÁGONO ESTÁ LISTO! ${red.lastName} vs ${blue.lastName} está por comenzar.`,
      `ROUND 1 - Ambos peleadores se saludan con disciplina de hierro.`
    ]);
  };

  useEffect(() => {
    if (!isSimulating || !simMatchId) return;
    const match = matches.find(m => m.id === simMatchId);
    if (!match || match.status === 'COMPLETED') return;
    const red = getFighter(match.redId);
    const blue = getFighter(match.blueId);
    if (!red || !blue) return;

    const interval = setInterval(() => {
      const attackerIsRed = Math.random() * (red.strikingAccuracy + red.koPower) >= Math.random() * (blue.strikingAccuracy + blue.koPower);
      const attacker = attackerIsRed ? red : blue;
      const defender = attackerIsRed ? blue : red;
      const roll = Math.random() * 100;
      let damage = Math.floor(Math.random() * 14) + 4;
      let log = '';

      if (roll > 88) {
        damage += 18;
        log = `🚨 ¡MOMENTO CLAVE! ${attacker.lastName} conecta un golpe feroz. ¡${defender.lastName} está tambaleándose!`;
      } else if (roll > 60) {
        log = `${attacker.lastName} conecta una combinación limpia de 1-2.`;
      } else if (roll > 35) {
        log = `${attacker.lastName} intenta un derribo contra la jaula. ${defender.lastName} defiende bien.`;
      } else {
        log = `${attacker.lastName} conecta una patada baja sobre ${defender.lastName}.`;
      }

      if (attackerIsRed) {
        setRedStrikes(p => p + Math.floor(Math.random() * 3) + 1);
        setBlueHealth(prev => {
          const next = Math.max(0, prev - damage);
          if (next <= 0) finishMatch(match.id, red, blue, 'KO/TKO', currentRound, '3:18');
          return next;
        });
      } else {
        setBlueStrikes(p => p + Math.floor(Math.random() * 3) + 1);
        setRedHealth(prev => {
          const next = Math.max(0, prev - damage);
          if (next <= 0) finishMatch(match.id, blue, red, 'KO/TKO', currentRound, '2:45');
          return next;
        });
      }

      setCombatLogs(prev => [log, ...prev.slice(0, 12)]);

      timeLeftRef.current -= 45;
      if (timeLeftRef.current <= 30) {
        if (currentRound >= match.rounds) {
          const redScore = redStrikes + red.hypeRating * 0.5;
          const blueScore = blueStrikes + blue.hypeRating * 0.5;
          const winner = redScore >= blueScore ? red : blue;
          const loser = redScore >= blueScore ? blue : red;
          finishMatch(match.id, winner, loser, 'Decisión (Unánime)', match.rounds, '5:00');
        } else {
          setCurrentRound(r => r + 1);
          setCombatLogs(prev => [`--- FIN DEL ROUND ${currentRound} ---`, `¡COMIENZA EL ROUND ${currentRound + 1}!`, ...prev]);
          timeLeftRef.current = 300;
        }
      }
    }, 850);

    return () => clearInterval(interval);
  }, [isSimulating, simMatchId, currentRound, redStrikes, blueStrikes]);

  const finishMatch = (matchId: string, winner: Fighter, loser: Fighter, method: string, round: number, time: string) => {
    setIsSimulating(false);
    setMatches(prev => prev.map(m => m.id === matchId
      ? { ...m, status: 'COMPLETED', winnerId: winner.id, method, roundEnded: round, timeEnded: time }
      : m
    ));
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 }, colors: ['#e61c24', '#ffffff', '#ffb4ac'] });
    onRecordFightResult(winner.id, loser.id, method, `R${round} ${time}`);
  };

  // ----- Small sub-render helpers -----
  const renderFighterListItem = (f: Fighter) => (
    <div
      key={f.id}
      draggable={!cardLocked}
      onDragStart={(e) => e.dataTransfer.setData('fighterId', f.id)}
      onClick={() => !cardLocked && setSelectedFighterId(prev => prev === f.id ? null : f.id)}
      className={`flex items-center gap-2 p-2 bg-[#131313] brutal-border cursor-pointer transition-all ${
        selectedFighterId === f.id ? 'ring-2 ring-[#e61c24]' : ''
      } ${cardLocked ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#e61c24]'}`}
    >
      <img src={f.imageUrl} alt={f.lastName} className="w-10 h-10 object-cover brutal-border flex-shrink-0" referrerPolicy="no-referrer" />
      <div className="min-w-0 flex-1">
        <div className="font-label-caps text-[11px] text-white truncate">{f.firstName} "{f.nickname}" {f.lastName}</div>
        <div className="font-label-caps text-[10px] text-[#767575]">{f.record} · {f.weightClass.split(' (')[0]}</div>
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
        <div className="relative bg-[#131313] brutal-border p-2 flex items-center gap-2">
          <img src={fighter.imageUrl} alt={fighter.lastName} className="w-12 h-12 object-cover brutal-border flex-shrink-0" referrerPolicy="no-referrer" />
          <div className="min-w-0 flex-1">
            <div className="font-label-caps text-xs text-white truncate">{fighter.firstName} "{fighter.nickname}" {fighter.lastName}</div>
            <div className="font-label-caps text-[10px]" style={{ color: accent }}>{fighter.record} · {fighter.weightClass.split(' (')[0]}</div>
          </div>
          <button onClick={() => onViewFighterProfile(fighter.id)} className="p-1 bg-[#2a2a2a] hover:bg-[#353534] text-white flex-shrink-0" title="Ver perfil">
            <UserCheck className="w-3.5 h-3.5" />
          </button>
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
        className={`p-4 border-2 border-dashed flex items-center justify-center text-center font-label-caps text-[10px] uppercase cursor-pointer transition-colors ${
          dragOverSlot === slotKey ? 'border-[#e61c24] bg-[#2a1414] text-white' : 'border-[#353534] text-[#767575]'
        }`}
        style={{ minHeight: '68px' }}
      >
        Arrastra o selecciona<br />un luchador para {corner === 'red' ? 'ESQUINA ROJA' : 'ESQUINA AZUL'}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#1c1b1b] brutal-border p-4 gap-3">
        <div>
          <h1 className="font-headline-lg text-3xl md:text-4xl text-[#e5e2e1] uppercase m-0 leading-none flex items-center gap-2">
            <Swords className="w-7 h-7 text-[#e61c24]" />
            OCTAGON MATCHMAKER & FIGHT SIMULATOR
          </h1>
          <p className="font-label-caps text-xs text-[#a09e9e] mt-1">
            ARMA LA CARTELERA ARRASTRANDO LUCHADORES, FILTRA POR PESO Y SIMULA CADA COMBATE
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setRounds(rounds === 5 ? 3 : 5)}
            className={`px-3 py-1.5 font-label-caps text-xs uppercase brutal-border transition-colors ${rounds === 5 ? 'bg-[#e61c24] text-white' : 'bg-[#2a2a2a] text-[#c8c6c5]'}`}
          >
            {rounds} ROUNDS
          </button>
          <button
            onClick={() => setIsTitleFight(!isTitleFight)}
            className={`px-3 py-1.5 font-label-caps text-xs uppercase brutal-border transition-colors flex items-center gap-1 ${isTitleFight ? 'bg-[#ffb4ac] text-black font-bold' : 'bg-[#2a2a2a] text-[#c8c6c5]'}`}
          >
            <Trophy className="w-3.5 h-3.5" />
            {isTitleFight ? 'TITLE BOUT' : 'NON-TITLE'}
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

      {/* 3-column layout: roster left / matches center / roster right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT ROSTER PANEL */}
        <div className="lg:col-span-3 flex flex-col gap-3 bg-[#1c1b1b] brutal-border p-3">
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
            onChange={(e) => setFilterLeft(e.target.value as WeightClass | 'ALL')}
            className="bg-[#131313] text-[#e5e2e1] brutal-border px-2 py-1.5 font-label-caps text-xs uppercase focus:outline-none"
          >
            <option value="ALL">TODOS LOS PESOS</option>
            {WEIGHT_CLASSES.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
          <div className="flex flex-col gap-1.5 max-h-[560px] overflow-y-auto pr-1">
            {poolLeft.length === 0 && <span className="font-label-caps text-[10px] text-[#767575] text-center py-4">Sin luchadores disponibles</span>}
            {poolLeft.map(renderFighterListItem)}
          </div>
        </div>

        {/* CENTER: MATCH BUILDER */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {matches.map((match, idx) => {
            const red = getFighter(match.redId);
            const blue = getFighter(match.blueId);
            const bothFilled = !!red && !!blue;
            const hype = bothFilled ? Math.round(((red!.hypeRating + blue!.hypeRating) / 2) + (match.isTitleFight ? 10 : 0)) : null;
            const weightMismatch = bothFilled && red!.weightClass !== blue!.weightClass;
            const isThisSimActive = simMatchId === match.id && isSimulating;

            return (
              <div key={match.id} className="bg-[#1c1b1b] brutal-border p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="font-label-caps text-xs text-[#a09e9e] font-bold uppercase">
                    PELEA #{idx + 1} {match.status === 'COMPLETED' && <span className="text-[#22c55e]">· FINALIZADA</span>}
                  </span>
                  {!cardLocked && (
                    <button onClick={() => removeMatch(match.id)} className="p-1 bg-[#2a2a2a] hover:bg-[#e61c24] text-white" title="Eliminar pelea">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                  {renderSlot(match, 'red')}
                  <span className="font-display-lg text-2xl text-[#e61c24] leading-none">VS</span>
                  {renderSlot(match, 'blue')}
                </div>

                {weightMismatch && (
                  <div className="font-label-caps text-[10px] text-[#eab308] text-center uppercase">⚠ Catchweight · pesos distintos</div>
                )}

                {bothFilled && match.status === 'SCHEDULED' && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-label-caps text-[10px] text-[#767575]">HYPE: <span className="text-[#ffb4ac] font-bold">{hype}/100</span></span>
                    <button
                      onClick={() => startSimulation(match)}
                      disabled={isSimulating}
                      className="bg-[#e61c24] hover:bg-[#c00015] disabled:opacity-40 disabled:cursor-not-allowed text-white font-label-caps text-xs px-4 py-2 brutal-cut-sm uppercase flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> SIMULAR
                    </button>
                  </div>
                )}

                {match.status === 'COMPLETED' && (
                  <div className="bg-[#131313] border-2 border-[#22c55e] p-3 text-center">
                    <span className="font-label-caps text-[10px] text-[#22c55e] uppercase font-bold block">GANADOR</span>
                    <span className="font-headline-sm text-lg text-white uppercase">{getFighter(match.winnerId)?.lastName}</span>
                    <span className="font-label-caps text-[10px] text-[#a09e9e] block">{match.method} · R{match.roundEnded} {match.timeEnded}</span>
                  </div>
                )}

                {/* Live simulation panel (only for the active match) */}
                {isThisSimActive && red && blue && (
                  <div className="bg-[#131313] brutal-border p-3 flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between font-label-caps text-[10px] mb-1">
                          <span className="text-[#e61c24] font-bold">{red.lastName}</span>
                          <span className="text-white">{redStrikes} golpes</span>
                        </div>
                        <div className="w-full bg-[#353534] h-3 brutal-border">
                          <div className="bg-[#e61c24] h-full transition-all duration-300" style={{ width: `${redHealth}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between font-label-caps text-[10px] mb-1">
                          <span className="text-[#60a5fa] font-bold">{blue.lastName}</span>
                          <span className="text-white">{blueStrikes} golpes</span>
                        </div>
                        <div className="w-full bg-[#353534] h-3 brutal-border">
                          <div className="bg-[#3b82f6] h-full transition-all duration-300" style={{ width: `${blueHealth}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#0e0e0e] brutal-border p-3 max-h-32 overflow-y-auto font-mono text-[10px] flex flex-col gap-1.5">
                      {combatLogs.map((log, i) => (
                        <div key={i} className={i === 0 ? 'text-[#ffb4ac] font-bold' : 'text-[#a09e9e]'}>{log}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
          <div className="bg-[#1c1b1b] brutal-border p-4">
            <span className="font-label-caps text-xs text-[#e5e2e1] font-bold uppercase block mb-2">DESGLOSE DE LA CARTELERA</span>
            {matches.length === 0 && <span className="font-label-caps text-[10px] text-[#767575]">No hay peleas agregadas.</span>}
            <div className="flex flex-col gap-1.5">
              {matches.map((m, i) => {
                const red = getFighter(m.redId);
                const blue = getFighter(m.blueId);
                return (
                  <div key={m.id} className="flex justify-between items-center bg-[#131313] px-3 py-2 brutal-border font-label-caps text-[10px] uppercase">
                    <span className="text-[#a09e9e]">#{i + 1}</span>
                    <span className="text-[#e61c24] flex-1 text-right pr-2 truncate">{red ? red.lastName : '— SIN ASIGNAR —'}</span>
                    <span className="text-white px-2">VS</span>
                    <span className="text-[#60a5fa] flex-1 truncate">{blue ? blue.lastName : '— SIN ASIGNAR —'}</span>
                    <span className={`ml-3 ${m.status === 'COMPLETED' ? 'text-[#22c55e]' : 'text-[#767575]'}`}>
                      {m.status === 'COMPLETED' ? 'HECHA' : 'PENDIENTE'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT ROSTER PANEL */}
        <div className="lg:col-span-3 flex flex-col gap-3 bg-[#1c1b1b] brutal-border p-3">
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
            onChange={(e) => setFilterRight(e.target.value as WeightClass | 'ALL')}
            className="bg-[#131313] text-[#e5e2e1] brutal-border px-2 py-1.5 font-label-caps text-xs uppercase focus:outline-none"
          >
            <option value="ALL">TODOS LOS PESOS</option>
            {WEIGHT_CLASSES.map(w => <option key={w} value={w}>{w}</option>)}
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
