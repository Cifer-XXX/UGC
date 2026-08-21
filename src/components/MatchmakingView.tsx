import React, { useState, useEffect } from 'react';
import { Fighter, ScheduledBout } from '../types';
import { Swords, Flame, Trophy, Play, RotateCcw, Shield, Zap, Sparkles, UserCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MatchmakingViewProps {
  fighters: Fighter[];
  initialRedCornerId?: string;
  initialBlueCornerId?: string;
  onViewFighterProfile: (fighterId: string) => void;
  onRecordFightResult: (winnerId: string, loserId: string, method: string, roundTime: string) => void;
}

export const MatchmakingView: React.FC<MatchmakingViewProps> = ({
  fighters,
  initialRedCornerId,
  initialBlueCornerId,
  onViewFighterProfile,
  onRecordFightResult
}) => {
  const [redCornerId, setRedCornerId] = useState<string>(initialRedCornerId || fighters[0]?.id || '');
  const [blueCornerId, setBlueCornerId] = useState<string>(
    initialBlueCornerId || fighters.find(f => f.id !== (initialRedCornerId || fighters[0]?.id))?.id || fighters[1]?.id || ''
  );
  const [rounds, setRounds] = useState<3 | 5>(5);
  const [isTitleFight, setIsTitleFight] = useState<boolean>(true);

  // Simulation State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [roundTimeRemaining, setRoundTimeRemaining] = useState<number>(300);
  const [combatLogs, setCombatLogs] = useState<string[]>([]);
  const [redHealth, setRedHealth] = useState<number>(100);
  const [blueHealth, setBlueHealth] = useState<number>(100);
  const [redStrikesLanded, setRedStrikesLanded] = useState<number>(0);
  const [blueStrikesLanded, setBlueStrikesLanded] = useState<number>(0);
  const [fightOutcome, setFightOutcome] = useState<{
    winner: Fighter | null;
    loser: Fighter | null;
    method: string;
    round: number;
    time: string;
  } | null>(null);

  const redFighter = fighters.find(f => f.id === redCornerId) || fighters[0];
  const blueFighter = fighters.find(f => f.id === blueCornerId) || fighters[1];

  // Calculate Hype & Projected PPV
  const matchHype = Math.round(((redFighter?.hypeRating || 80) + (blueFighter?.hypeRating || 80)) / 2 + (isTitleFight ? 10 : 0));
  const projectedPPVBuys = Math.round(matchHype * 9200);

  // Fight Simulation Logic
  const startSimulation = () => {
    if (!redFighter || !blueFighter) return;
    setIsSimulating(true);
    setCurrentRound(1);
    setRoundTimeRemaining(300);
    setRedHealth(100);
    setBlueHealth(100);
    setRedStrikesLanded(0);
    setBlueStrikesLanded(0);
    setFightOutcome(null);
    setCombatLogs([
      `GAKURAN ROOFTOP ARENA READY! ${redFighter.lastName} vs ${blueFighter.lastName} is underway!`,
      `ROUND 1 - Delinquents bow coldly. Both fighters circle with iron discipline.`
    ]);
  };

  useEffect(() => {
    if (!isSimulating || fightOutcome) return;

    const interval = setInterval(() => {
      // Pick random combat action
      const attackerIsRed = Math.random() * (redFighter.strikingAccuracy + redFighter.koPower) >=
                            Math.random() * (blueFighter.strikingAccuracy + blueFighter.koPower);

      const attacker = attackerIsRed ? redFighter : blueFighter;
      const defender = attackerIsRed ? blueFighter : redFighter;

      const strikeRoll = Math.random() * 100;
      let logMsg = '';
      let damage = Math.floor(Math.random() * 14) + 4;

      if (strikeRoll > 88) {
        // High impact strike / Knockdown
        damage += 18;
        logMsg = `🚨 HUGE MOMENT! ${attacker.lastName} lands a ferocious ${attacker.fightingStyle.includes('KICK') || attacker.fightingStyle.includes('MUAY') ? 'HEAD KICK' : 'OVERHAND RIGHT'}! ${defender.lastName} is wobbled!`;
      } else if (strikeRoll > 60) {
        // Solid combination
        logMsg = `${attacker.lastName} strings together a crisp 1-2 combination to the body and chin.`;
      } else if (strikeRoll > 35) {
        // Takedown attempt / clinch
        logMsg = `${attacker.lastName} shoots in for a double leg against the cage! ${defender.lastName} defends with a strong whizzer.`;
      } else {
        // Jabs / Low kicks
        logMsg = `${attacker.lastName} digs a heavy leg kick to the lead calf of ${defender.lastName}.`;
      }

      if (attackerIsRed) {
        setRedStrikesLanded(prev => prev + Math.floor(Math.random() * 3) + 1);
        setBlueHealth(prev => {
          const nextVal = Math.max(0, prev - damage);
          if (nextVal <= 0) {
            triggerFinish(redFighter, blueFighter, `KO/TKO (${attacker.fightingStyle.includes('MUAY') ? 'Head Kick & Punches' : 'Right Hook'})`, currentRound, '3:18');
          }
          return nextVal;
        });
      } else {
        setBlueStrikesLanded(prev => prev + Math.floor(Math.random() * 3) + 1);
        setRedHealth(prev => {
          const nextVal = Math.max(0, prev - damage);
          if (nextVal <= 0) {
            triggerFinish(blueFighter, redFighter, `KO/TKO (${attacker.fightingStyle.includes('SAMBO') ? 'Ground & Pound' : 'Uppercut'})`, currentRound, '2:45');
          }
          return nextVal;
        });
      }

      setCombatLogs(prev => [logMsg, ...prev.slice(0, 15)]);

      // Check for round advance
      setRoundTimeRemaining(prevTime => {
        if (prevTime <= 30) {
          if (currentRound >= rounds) {
            // Fight goes to decision!
            const redScore = redStrikesLanded + (redFighter.hypeRating * 0.5);
            const blueScore = blueStrikesLanded + (blueFighter.hypeRating * 0.5);
            const winner = redScore >= blueScore ? redFighter : blueFighter;
            const loser = redScore >= blueScore ? blueFighter : redFighter;
            triggerFinish(winner, loser, 'Decision (Unanimous 48-47, 49-46)', rounds, '5:00');
            return 0;
          } else {
            setCurrentRound(r => r + 1);
            setCombatLogs(prev => [
              `--- END OF ROUND ${currentRound}. CORNER COACHES SHOUTING INSTRUCTIONS. ---`,
              `ROUND ${currentRound + 1} BEGINS!`,
              ...prev
            ]);
            return 300;
          }
        }
        return prevTime - 45;
      });

    }, 850);

    return () => clearInterval(interval);
  }, [isSimulating, currentRound, redHealth, blueHealth, redFighter, blueFighter, rounds, redStrikesLanded, blueStrikesLanded, fightOutcome]);

  const triggerFinish = (winner: Fighter, loser: Fighter, method: string, round: number, time: string) => {
    setIsSimulating(false);
    setFightOutcome({ winner, loser, method, round, time });
    
    // Confetti celebration
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#e61c24', '#ffffff', '#ffb4ac', '#ffdad6']
    });

    onRecordFightResult(winner.id, loser.id, method, `R${round} ${time}`);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#1c1b1b] brutal-border p-4 gap-3">
        <div>
          <h1 className="font-headline-lg text-3xl md:text-4xl text-[#e5e2e1] uppercase m-0 leading-none flex items-center gap-2">
            <Swords className="w-7 h-7 text-[#e61c24]" />
            OCTAGON MATCHMAKER & FIGHT SIMULATOR
          </h1>
          <p className="font-label-caps text-xs text-[#a09e9e] mt-1">
            SCHEDULE MAIN EVENTS, COMPARE TALE OF THE TAPE, AND SIMULATE LIVE OCTAGON ACTION
          </p>
        </div>

        {/* Bout Configuration Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRounds(rounds === 5 ? 3 : 5)}
            className={`px-3 py-1.5 font-label-caps text-xs uppercase brutal-border transition-colors ${
              rounds === 5 ? 'bg-[#e61c24] text-white' : 'bg-[#2a2a2a] text-[#c8c6c5]'
            }`}
          >
            {rounds} ROUNDS
          </button>
          <button
            onClick={() => setIsTitleFight(!isTitleFight)}
            className={`px-3 py-1.5 font-label-caps text-xs uppercase brutal-border transition-colors flex items-center gap-1 ${
              isTitleFight ? 'bg-[#ffb4ac] text-black font-bold' : 'bg-[#2a2a2a] text-[#c8c6c5]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            {isTitleFight ? 'TITLE BOUT' : 'NON-TITLE'}
          </button>
        </div>
      </div>

      {/* Corners Selection & Tale of the Tape Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Red Corner Selector & Card */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="bg-[#1c1b1b] brutal-border border-t-4 border-t-[#e61c24] p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="font-label-caps text-xs text-[#e61c24] font-bold uppercase tracking-wider">
                RED CORNER
              </span>
              <select
                id="red-corner-select"
                value={redCornerId}
                onChange={(e) => setRedCornerId(e.target.value)}
                disabled={isSimulating}
                className="bg-[#131313] text-[#e5e2e1] brutal-border px-2 py-1 font-label-caps text-xs uppercase focus:outline-none focus:border-[#e61c24]"
              >
                {fighters.map((f) => (
                  <option key={f.id} value={f.id} disabled={f.id === blueCornerId}>
                    {f.firstName} "{f.nickname}" {f.lastName} ({f.weightClass.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>

            {/* Fighter Card */}
            <div className="relative aspect-[4/3] brutal-border bg-[#131313] overflow-hidden group">
              <img
                src={redFighter.imageUrl}
                alt={redFighter.lastName}
                className="w-full h-full object-cover fighter-image-hover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent"></div>
              <div className="absolute top-2 left-2 bg-[#e61c24] text-white font-label-caps text-[10px] px-2 py-0.5 brutal-cut-sm">
                {redFighter.rankingBadge}
              </div>
              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                <div>
                  <h3 className="font-headline-md text-2xl text-white uppercase leading-none m-0">
                    {redFighter.firstName} "{redFighter.nickname}" {redFighter.lastName}
                  </h3>
                  <span className="font-label-caps text-xs text-[#ffb4ac]">{redFighter.record} · {redFighter.fightingStyle}</span>
                </div>
                <button
                  onClick={() => onViewFighterProfile(redFighter.id)}
                  className="bg-[#2a2a2a] hover:bg-[#e61c24] text-white p-1 brutal-cut-sm"
                  title="View Full Profile"
                >
                  <UserCheck className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Red Stats */}
            <div className="grid grid-cols-3 gap-2 text-center font-label-caps text-xs">
              <div className="bg-[#131313] p-2 brutal-border">
                <span className="text-[#767575] block text-[10px]">HEIGHT / REACH</span>
                <span className="text-white font-bold">{redFighter.height} / {redFighter.reach}</span>
              </div>
              <div className="bg-[#131313] p-2 brutal-border">
                <span className="text-[#767575] block text-[10px]">STRIKING ACC</span>
                <span className="text-[#e61c24] font-bold">{redFighter.strikingAccuracy}%</span>
              </div>
              <div className="bg-[#131313] p-2 brutal-border">
                <span className="text-[#767575] block text-[10px]">GRAPPLING DEF</span>
                <span className="text-white font-bold">{redFighter.grapplingDefense}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Versus Column & Simulation Console */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center gap-4 py-4">
          <div className="font-display-lg text-6xl text-[#e61c24] leading-none tracking-tight animate-pulse">
            VS
          </div>
          
          <div className="bg-[#1c1b1b] brutal-border p-3 w-full text-center font-label-caps text-xs">
            <span className="text-[#767575] block">BOUT HYPE RATING</span>
            <span className="text-[#ffb4ac] font-headline-sm text-xl">{matchHype}/100</span>
            <span className="text-[#a09e9e] text-[10px] block mt-0.5">Est. PPV: {(projectedPPVBuys).toLocaleString()} buys</span>
          </div>

          {!isSimulating && !fightOutcome && (
            <button
              id="start-fight-simulation-btn"
              onClick={startSimulation}
              className="w-full bg-[#e61c24] hover:bg-[#c00015] text-white font-headline-md text-xl py-3.5 brutal-cut uppercase glitch-hover transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>SIMULATE FIGHT</span>
            </button>
          )}

          {isSimulating && (
            <div className="font-label-caps text-xs text-[#e61c24] animate-pulse uppercase font-bold text-center">
              ● OCTAGON IN SESSION (R{currentRound})
            </div>
          )}

          {fightOutcome && (
            <button
              onClick={startSimulation}
              className="w-full bg-[#2a2a2a] hover:bg-[#353534] text-white font-label-caps text-xs py-2.5 brutal-cut uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RUN REMATCH</span>
            </button>
          )}
        </div>

        {/* Blue Corner Selector & Card */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="bg-[#1c1b1b] brutal-border border-t-4 border-t-[#3b82f6] p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="font-label-caps text-xs text-[#60a5fa] font-bold uppercase tracking-wider">
                BLUE CORNER
              </span>
              <select
                id="blue-corner-select"
                value={blueCornerId}
                onChange={(e) => setBlueCornerId(e.target.value)}
                disabled={isSimulating}
                className="bg-[#131313] text-[#e5e2e1] brutal-border px-2 py-1 font-label-caps text-xs uppercase focus:outline-none focus:border-[#60a5fa]"
              >
                {fighters.map((f) => (
                  <option key={f.id} value={f.id} disabled={f.id === redCornerId}>
                    {f.firstName} "{f.nickname}" {f.lastName} ({f.weightClass.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>

            {/* Fighter Card */}
            <div className="relative aspect-[4/3] brutal-border bg-[#131313] overflow-hidden group">
              <img
                src={blueFighter.imageUrl}
                alt={blueFighter.lastName}
                className="w-full h-full object-cover fighter-image-hover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent"></div>
              <div className="absolute top-2 left-2 bg-[#2563eb] text-white font-label-caps text-[10px] px-2 py-0.5 brutal-cut-sm">
                {blueFighter.rankingBadge}
              </div>
              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                <div>
                  <h3 className="font-headline-md text-2xl text-white uppercase leading-none m-0">
                    {blueFighter.firstName} "{blueFighter.nickname}" {blueFighter.lastName}
                  </h3>
                  <span className="font-label-caps text-xs text-[#93c5fd]">{blueFighter.record} · {blueFighter.fightingStyle}</span>
                </div>
                <button
                  onClick={() => onViewFighterProfile(blueFighter.id)}
                  className="bg-[#2a2a2a] hover:bg-[#2563eb] text-white p-1 brutal-cut-sm"
                  title="View Full Profile"
                >
                  <UserCheck className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Blue Stats */}
            <div className="grid grid-cols-3 gap-2 text-center font-label-caps text-xs">
              <div className="bg-[#131313] p-2 brutal-border">
                <span className="text-[#767575] block text-[10px]">HEIGHT / REACH</span>
                <span className="text-white font-bold">{blueFighter.height} / {blueFighter.reach}</span>
              </div>
              <div className="bg-[#131313] p-2 brutal-border">
                <span className="text-[#767575] block text-[10px]">STRIKING ACC</span>
                <span className="text-[#60a5fa] font-bold">{blueFighter.strikingAccuracy}%</span>
              </div>
              <div className="bg-[#131313] p-2 brutal-border">
                <span className="text-[#767575] block text-[10px]">GRAPPLING DEF</span>
                <span className="text-white font-bold">{blueFighter.grapplingDefense}%</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Live Octagon Simulation Display & Commentary Feed */}
      {(isSimulating || fightOutcome) && (
        <div className="bg-[#1c1b1b] brutal-border p-6 flex flex-col gap-4 animate-in fade-in duration-300">
          
          {/* Live Status & Health Meters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#131313] p-4 brutal-border">
            {/* Red Fighter Meter */}
            <div>
              <div className="flex justify-between font-label-caps text-xs mb-1">
                <span className="text-[#e61c24] font-bold">{redFighter.lastName} (RED)</span>
                <span className="text-white">Strikes: {redStrikesLanded}</span>
              </div>
              <div className="w-full bg-[#353534] h-4 brutal-border">
                <div 
                  className="bg-[#e61c24] h-full transition-all duration-300"
                  style={{ width: `${redHealth}%` }}
                ></div>
              </div>
            </div>

            {/* Blue Fighter Meter */}
            <div>
              <div className="flex justify-between font-label-caps text-xs mb-1">
                <span className="text-[#60a5fa] font-bold">{blueFighter.lastName} (BLUE)</span>
                <span className="text-white">Strikes: {blueStrikesLanded}</span>
              </div>
              <div className="w-full bg-[#353534] h-4 brutal-border">
                <div 
                  className="bg-[#3b82f6] h-full transition-all duration-300"
                  style={{ width: `${blueHealth}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Official Victory Banner if finished */}
          {fightOutcome && (
            <div className="bg-[#201f1f] border-2 border-[#e61c24] p-6 text-center flex flex-col items-center gap-3 animate-in zoom-in-95 duration-200">
              <span className="font-label-caps text-xs text-[#ffb4ac] uppercase tracking-widest font-bold">
                AND THE WINNER BY {fightOutcome.method.toUpperCase()}...
              </span>
              <h2 className="font-display-lg text-4xl sm:text-6xl text-white uppercase m-0 leading-none">
                {fightOutcome.winner?.firstName} <span className="text-[#e61c24]">"{fightOutcome.winner?.nickname}"</span> {fightOutcome.winner?.lastName}
              </h2>
              <div className="font-label-caps text-xs text-[#c8c6c5] bg-[#131313] px-4 py-1.5 brutal-border">
                ROUND {fightOutcome.round} · {fightOutcome.time} · OFFICIALLY RECORDED IN RECORD
              </div>
            </div>
          )}

          {/* Live Play-by-Play Commentary Log */}
          <div>
            <span className="font-label-caps text-xs text-[#a09e9e] uppercase font-bold block mb-2">
              OCTAGON PLAY-BY-PLAY COMMENTARY:
            </span>
            <div className="bg-[#0e0e0e] brutal-border p-4 max-h-52 overflow-y-auto font-mono text-xs flex flex-col gap-2">
              {combatLogs.map((log, i) => (
                <div 
                  key={i} 
                  className={`leading-relaxed ${
                    i === 0 ? 'text-[#ffb4ac] font-bold' : 'text-[#a09e9e]'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
