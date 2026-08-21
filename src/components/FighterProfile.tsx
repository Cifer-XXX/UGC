import React, { useState } from 'react';
import { Fighter } from '../types';
import { Swords, Plus, ChevronRight, Trophy, Zap, Shield, Flame, Activity } from 'lucide-react';

interface FighterProfileProps {
  fighter: Fighter;
  allFighters: Fighter[];
  onSelectFighter: (id: string) => void;
  onOfferContract: (fighter: Fighter) => void;
  onBookInMatchmaking: (fighter: Fighter) => void;
  onAddNewFighterModal: () => void;
}

export const FighterProfile: React.FC<FighterProfileProps> = ({
  fighter,
  allFighters,
  onSelectFighter,
  onOfferContract,
  onBookInMatchmaking,
  onAddNewFighterModal
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DETAILED_STATS' | 'CONTRACT_INFO'>('OVERVIEW');

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Quick Roster Selector Strip */}
      <div className="bg-[#1c1b1b] brutal-border p-2.5 flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center gap-2">
          <span className="font-label-caps text-[11px] text-[#a09e9e] uppercase px-2 whitespace-nowrap">
            ROSTER SELECTION:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {allFighters.map((f) => {
              const isSelected = f.id === fighter.id;
              return (
                <button
                  key={f.id}
                  id={`roster-select-${f.id}`}
                  onClick={() => onSelectFighter(f.id)}
                  className={`px-3 py-1 font-label-caps text-xs uppercase brutal-cut-sm transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#e61c24] text-white font-bold'
                      : 'bg-[#2a2a2a] text-[#c8c6c5] hover:bg-[#353534] hover:text-white'
                  }`}
                >
                  <span>{f.lastName}</span>
                  <span className="text-[10px] opacity-75">({f.record})</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={onAddNewFighterModal}
          className="bg-[#2a2a2a] hover:bg-[#e61c24] text-[#e5e2e1] hover:text-white px-3 py-1 font-label-caps text-xs uppercase brutal-cut-sm transition-colors flex items-center gap-1 whitespace-nowrap ml-2"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>SIGN NEW TALENT</span>
        </button>
      </div>

      {/* Main Grid: Left Column (Image + CTA) & Right Column (Tale of the Tape + Octagon History) */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Column: Fighter Image & Core Action */}
        <div className="w-full lg:w-5/12 flex flex-col gap-4">
          <div className="relative w-full aspect-[3/4] brutal-border bg-[#1c1b1b] brutal-cut overflow-hidden group shadow-2xl">
            {/* Fighter Photo with grayscale to color hover transition */}
            <img
              className="w-full h-full object-cover fighter-image-hover z-0 absolute inset-0 contrast-110"
              src={fighter.imageUrl}
              alt={`${fighter.firstName} ${fighter.lastName}`}
              referrerPolicy="no-referrer"
            />

            {/* Overlay Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent z-10 opacity-90 group-hover:opacity-60 transition-opacity"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-[#131313]/60 via-transparent to-transparent z-10 pointer-events-none"></div>

            {/* Top-Left Badges */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
              <div className="bg-[#e61c24] text-white font-headline-md text-2xl md:text-3xl px-3 py-1 uppercase brutal-cut inline-block w-max tracking-wider drop-shadow-md">
                {fighter.rankingBadge}
              </div>
              <div className="bg-[#201f1f] text-[#ffb4ac] font-label-caps text-xs px-2.5 py-1 uppercase brutal-border inline-block w-max flex items-center gap-1.5 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-[#e61c24] animate-pulse"></span>
                {fighter.status}
              </div>
            </div>

            {/* Top-Right Division Badge */}
            <div className="absolute top-4 right-4 z-20">
              <span className="font-label-caps text-[11px] bg-[#131313]/90 text-[#a09e9e] px-2 py-1 brutal-border uppercase">
                {fighter.weightClass.split(' ')[0]}
              </span>
            </div>

            {/* Bottom Giant Typography */}
            <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col">
              <h1 className="font-display-lg text-6xl sm:text-7xl md:text-8xl text-[#e5e2e1] uppercase leading-none m-0 p-0 drop-shadow-lg tracking-tight">
                {fighter.firstName}
                <br />
                <span className="text-[#e61c24]">"{fighter.nickname}"</span>
                <br />
                {fighter.lastName}
              </h1>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              id="offer-contract-button"
              onClick={() => onOfferContract(fighter)}
              className="flex-1 bg-[#e61c24] hover:bg-[#c00015] text-white font-headline-md text-2xl md:text-3xl py-3.5 brutal-cut uppercase glitch-hover transition-all duration-150 flex justify-center items-center gap-2 cursor-pointer shadow-lg active:scale-98"
            >
              <Swords className="w-7 h-7" />
              <span>OFFER CONTRACT</span>
            </button>

            <button
              id="book-fight-button"
              onClick={() => onBookInMatchmaking(fighter)}
              className="bg-[#2a2a2a] hover:bg-[#353534] text-[#e5e2e1] font-headline-md text-xl md:text-2xl px-5 py-3.5 brutal-cut uppercase glitch-hover-white transition-all flex justify-center items-center gap-1.5 cursor-pointer"
              title="Schedule in Octagon Matchmaker"
            >
              <Zap className="w-5 h-5 text-[#e61c24]" />
              <span>MATCHMAKE</span>
            </button>
          </div>

          {/* Contract Status Quick Peek */}
          <div className="bg-[#1c1b1b] brutal-border p-3 flex justify-between items-center text-xs font-label-caps">
            <span className="text-[#a09e9e]">CURRENT CONTRACT:</span>
            <span className="text-[#ffb4ac] font-bold">
              {fighter.contract.fightsRemaining} FIGHT{fighter.contract.fightsRemaining !== 1 ? 'S' : ''} REMAINING · ${ (fighter.contract.showPurse / 1000).toFixed(0) }K / ${ (fighter.contract.winBonus / 1000).toFixed(0) }K
            </span>
          </div>
        </div>

        {/* Right Column: Stats & History */}
        <div className="w-full lg:w-7/12 flex flex-col gap-8">
          
          {/* Tale of the Tape Section */}
          <section className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-[#333333] pb-2">
              <h2 className="font-headline-sm text-2xl text-[#e5e2e1] uppercase tracking-wide">
                Tale of the Tape
              </h2>
              <div className="flex items-center gap-2 font-label-caps text-xs text-[#a09e9e]">
                <span>HYPE RATING:</span>
                <span className="text-[#e61c24] font-bold text-sm">{fighter.hypeRating}/100</span>
              </div>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Record */}
              <div className="bg-[#1c1b1b] brutal-border p-3.5 flex flex-col items-center justify-center text-center group hover:border-[#e61c24] transition-colors">
                <span className="font-label-caps text-[11px] text-[#a09e9e] uppercase mb-1">Record</span>
                <span className="font-headline-md text-2xl sm:text-3xl text-[#e5e2e1]">{fighter.record}</span>
              </div>

              {/* Height */}
              <div className="bg-[#1c1b1b] brutal-border p-3.5 flex flex-col items-center justify-center text-center group hover:border-[#e61c24] transition-colors">
                <span className="font-label-caps text-[11px] text-[#a09e9e] uppercase mb-1">Height</span>
                <span className="font-headline-md text-2xl sm:text-3xl text-[#e5e2e1]">{fighter.height}</span>
              </div>

              {/* Reach */}
              <div className="bg-[#1c1b1b] brutal-border p-3.5 flex flex-col items-center justify-center text-center group hover:border-[#e61c24] transition-colors">
                <span className="font-label-caps text-[11px] text-[#a09e9e] uppercase mb-1">Reach</span>
                <span className="font-headline-md text-2xl sm:text-3xl text-[#e5e2e1]">{fighter.reach}</span>
              </div>

              {/* Weight */}
              <div className="bg-[#1c1b1b] brutal-border p-3.5 flex flex-col items-center justify-center text-center group hover:border-[#e61c24] transition-colors">
                <span className="font-label-caps text-[11px] text-[#a09e9e] uppercase mb-1">Weight</span>
                <span className="font-headline-md text-2xl sm:text-3xl text-[#e5e2e1]">{fighter.weight}</span>
              </div>

              {/* Stance */}
              <div className="bg-[#1c1b1b] brutal-border p-3.5 flex flex-col items-center justify-center text-center col-span-2 group hover:border-[#e61c24] transition-colors">
                <span className="font-label-caps text-[11px] text-[#a09e9e] uppercase mb-1">Stance</span>
                <span className="font-headline-md text-2xl sm:text-3xl text-[#e5e2e1]">{fighter.stance}</span>
              </div>

              {/* Fighting Style */}
              <div className="bg-[#1c1b1b] brutal-border p-3.5 flex flex-col items-center justify-center text-center col-span-2 group hover:border-[#e61c24] transition-colors">
                <span className="font-label-caps text-[11px] text-[#a09e9e] uppercase mb-1">Fighting Style</span>
                <span className="font-headline-md text-2xl sm:text-3xl text-[#e5e2e1]">{fighter.fightingStyle}</span>
              </div>
            </div>

            {/* Combat Skill Progress Bars */}
            <div className="bg-[#1c1b1b] brutal-border p-4 flex flex-col gap-3.5 mt-1">
              {/* Striking Accuracy */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="font-label-caps text-xs text-[#a09e9e] uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-[#e61c24]" />
                    Striking Accuracy
                  </span>
                  <span className="font-label-caps text-xs text-[#e5e2e1] uppercase font-bold">
                    {fighter.strikingAccuracy}%
                  </span>
                </div>
                <div className="w-full bg-[#353534] h-4 brutal-border">
                  <div
                    className="bg-[#e61c24] h-full transition-all duration-700 ease-out"
                    style={{ width: `${fighter.strikingAccuracy}%` }}
                  ></div>
                </div>
              </div>

              {/* Grappling Defense */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="font-label-caps text-xs text-[#a09e9e] uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#ffb4ac]" />
                    Grappling Defense
                  </span>
                  <span className="font-label-caps text-xs text-[#e5e2e1] uppercase font-bold">
                    {fighter.grapplingDefense}%
                  </span>
                </div>
                <div className="w-full bg-[#353534] h-4 brutal-border">
                  <div
                    className="bg-[#ffb4ac] h-full transition-all duration-700 ease-out"
                    style={{ width: `${fighter.grapplingDefense}%` }}
                  ></div>
                </div>
              </div>

              {/* Secondary Power & Takedown Stats */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#2a2a2a]">
                <div>
                  <div className="flex justify-between text-[11px] font-label-caps text-[#a09e9e] mb-1">
                    <span>KO POWER</span>
                    <span className="text-[#e5e2e1]">{fighter.koPower}%</span>
                  </div>
                  <div className="w-full bg-[#353534] h-2">
                    <div className="bg-[#e61c24] h-full" style={{ width: `${fighter.koPower}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-label-caps text-[#a09e9e] mb-1">
                    <span>TAKEDOWN AVG</span>
                    <span className="text-[#e5e2e1]">{fighter.takedownAverage} / 15m</span>
                  </div>
                  <div className="w-full bg-[#353534] h-2">
                    <div className="bg-[#ffb4ac] h-full" style={{ width: `${fighter.takedownAccuracy}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Octagon History Section */}
          <section className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-[#333333] pb-2">
              <h2 className="font-headline-sm text-2xl text-[#e5e2e1] uppercase tracking-wide">
                Recent Octagon History
              </h2>
              <span className="font-label-caps text-xs text-[#767575] uppercase">
                {fighter.recentHistory.length} Recorded Bouts
              </span>
            </div>

            {/* Timeline */}
            <div className="flex flex-col border-l-2 border-[#333333] ml-2 relative">
              {fighter.recentHistory.map((fight, idx) => {
                const isWin = fight.result === 'WIN';
                const isLast = idx === fighter.recentHistory.length - 1;

                return (
                  <div
                    key={fight.id}
                    className={`relative pl-6 py-4 transition-colors group hover:bg-[#1c1b1b] ${
                      !isLast ? 'brutal-border-bottom' : ''
                    }`}
                  >
                    {/* Timeline Node Square Indicator */}
                    <div
                      className={`absolute w-3 h-3 -left-[7px] top-6 brutal-border ${
                        isWin ? 'bg-[#e61c24]' : 'bg-[#353534]'
                      }`}
                    ></div>

                    <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-2">
                      <div>
                        <div className="font-label-caps text-xs text-[#ffb4ac] uppercase mb-1 font-semibold">
                          {fight.event}
                        </div>
                        <h3 className="font-headline-sm text-xl md:text-2xl text-[#e5e2e1] uppercase m-0 leading-tight">
                          {fight.opponent}
                        </h3>
                        <p className="font-body-md text-sm text-[#a09e9e] m-0 mt-0.5">
                          {fight.method}
                        </p>
                      </div>

                      {/* Result Badge */}
                      <div
                        className={`px-3 py-1 brutal-border font-label-caps text-xs uppercase tracking-wider font-bold ${
                          isWin
                            ? 'bg-[#353534] text-[#e5e2e1] border-[#555555]'
                            : 'bg-[#131313] text-[#767575] border-[#2a2a2a]'
                        }`}
                      >
                        {fight.result}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Fighter Bio & Promotion Notes */}
          {fighter.bio && (
            <div className="bg-[#1c1b1b] brutal-border p-4">
              <span className="font-label-caps text-[11px] text-[#e61c24] uppercase font-bold block mb-1">
                SCOUTING REPORT & DOSSIER:
              </span>
              <p className="font-body-md text-sm text-[#c8c6c5] leading-relaxed">
                {fighter.bio}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
