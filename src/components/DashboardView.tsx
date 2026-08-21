import React from 'react';
import { Fighter, PromotionEvent } from '../types';
import { initialEvents } from '../data/events';
import { Swords, Trophy, DollarSign, Users, Flame, Calendar, MapPin, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import arenaBannerImg from '../assets/images/roblox_gakuran_arena_1787275105343.jpg';
import gangFightBannerImg from '../assets/images/gakuran_gang_fight_1787275170386.jpg';

interface DashboardViewProps {
  fighters: Fighter[];
  onSelectFighter: (fighterId: string) => void;
  onNavigateToMatchmaking: () => void;
  onNavigateToRankings: () => void;
  onNavigateToFighters: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  fighters,
  onSelectFighter,
  onNavigateToMatchmaking,
  onNavigateToRankings,
  onNavigateToFighters
}) => {
  const marcusVane = fighters.find(f => f.id === 'marcus-vane') || fighters[0];
  const upcomingEvent = initialEvents[0];

  const totalPursePaid = fighters.reduce((acc, f) => acc + (f.contract.showPurse * 2), 0);
  const averageAccuracy = Math.round(fighters.reduce((acc, f) => acc + f.strikingAccuracy, 0) / fighters.length);

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* Top Banner: Next Live Event Spotlight */}
      <div className="relative bg-[#1c1b1b] brutal-border overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-[#131313] via-[#131313]/90 to-transparent z-10"></div>
        <img
          src={arenaBannerImg}
          alt="Gakuran Rooftop Championship Arena"
          className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 group-hover:opacity-50 group-hover:grayscale-0 transition-all duration-500"
          referrerPolicy="no-referrer"
        />

        <div className="relative z-20 p-6 sm:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#e61c24] text-white font-headline-sm text-sm px-2.5 py-0.5 brutal-cut uppercase tracking-wider">
                NEXT PAY-PER-VIEW EVENT
              </span>
              <span className="font-label-caps text-xs text-[#ffb4ac] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {upcomingEvent.date}
              </span>
              <span className="font-label-caps text-xs text-[#a09e9e] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {upcomingEvent.venue}, {upcomingEvent.location}
              </span>
            </div>

            <h1 className="font-display-lg text-4xl sm:text-6xl md:text-7xl text-white uppercase m-0 leading-none">
              {upcomingEvent.name}
            </h1>

            <div className="font-headline-sm text-xl sm:text-2xl text-[#ffb4ac] uppercase mt-1">
              UNDISPUTED GAKURAN TITLE: USMAN VS. VANE II
            </div>

            {/* Ticket Progress */}
            <div className="w-full max-w-md mt-2">
              <div className="flex justify-between text-xs font-label-caps text-[#a09e9e] mb-1">
                <span>GATE / ARENA TICKETS SOLD</span>
                <span className="text-white font-bold">{upcomingEvent.ticketSalesPercentage}% (ROOFTOP SELLOUT)</span>
              </div>
              <div className="w-full bg-[#353534] h-2.5 brutal-border">
                <div className="bg-[#e61c24] h-full" style={{ width: `${upcomingEvent.ticketSalesPercentage}%` }}></div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={onNavigateToMatchmaking}
              className="bg-[#e61c24] hover:bg-[#c00015] text-white font-headline-md text-xl sm:text-2xl px-6 py-3.5 brutal-cut uppercase glitch-hover transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl"
            >
              <Swords className="w-6 h-6" />
              <span>ENTER GAKURAN MATCHMAKER</span>
            </button>
            <button
              onClick={() => onSelectFighter('marcus-vane')}
              className="bg-[#2a2a2a] hover:bg-[#353534] text-[#e5e2e1] font-label-caps text-xs px-4 py-2.5 brutal-cut uppercase transition-colors text-center"
            >
              VIEW MARCUS VANE PROFILE
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1c1b1b] brutal-border p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center text-[#a09e9e] font-label-caps text-xs">
            <span>ACTIVE ROSTER</span>
            <Users className="w-4 h-4 text-[#ffb4ac]" />
          </div>
          <div className="mt-3">
            <span className="font-headline-lg text-3xl sm:text-4xl text-white block leading-none">
              {fighters.length} ATHLETES
            </span>
            <span className="font-label-caps text-[10px] text-emerald-400 mt-1 block">
              100% DRUG TEST COMPLIANT
            </span>
          </div>
        </div>

        <div className="bg-[#1c1b1b] brutal-border p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center text-[#a09e9e] font-label-caps text-xs">
            <span>TOTAL PURSE CAP</span>
            <DollarSign className="w-4 h-4 text-[#e61c24]" />
          </div>
          <div className="mt-3">
            <span className="font-headline-lg text-3xl sm:text-4xl text-[#ffb4ac] block leading-none">
              ${(totalPursePaid / 1000000).toFixed(1)}M
            </span>
            <span className="font-label-caps text-[10px] text-[#a09e9e] mt-1 block">
              ANNUAL SALARY COMMITMENT
            </span>
          </div>
        </div>

        <div className="bg-[#1c1b1b] brutal-border p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center text-[#a09e9e] font-label-caps text-xs">
            <span>PROJECTED PPV REV</span>
            <Flame className="w-4 h-4 text-[#e61c24]" />
          </div>
          <div className="mt-3">
            <span className="font-headline-lg text-3xl sm:text-4xl text-white block leading-none">
              $42.8M
            </span>
            <span className="font-label-caps text-[10px] text-emerald-400 mt-1 block">
              +18.4% YOY GROWTH
            </span>
          </div>
        </div>

        <div className="bg-[#1c1b1b] brutal-border p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center text-[#a09e9e] font-label-caps text-xs">
            <span>ROSTER ACCURACY</span>
            <Trophy className="w-4 h-4 text-[#ffb4ac]" />
          </div>
          <div className="mt-3">
            <span className="font-headline-lg text-3xl sm:text-4xl text-white block leading-none">
              {averageAccuracy}%
            </span>
            <span className="font-label-caps text-[10px] text-[#a09e9e] mt-1 block">
              STRIKING ACCURACY AVG
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Top Contenders & Recent Contract Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Featured Contenders Carousel / Grid */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-[#333333] pb-2">
            <h2 className="font-headline-sm text-2xl text-[#e5e2e1] uppercase flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#e61c24]" />
              HEADLINE ROSTER CONTENDERS
            </h2>
            <button
              onClick={onNavigateToFighters}
              className="font-label-caps text-xs text-[#ffb4ac] hover:text-[#e61c24] flex items-center gap-1 uppercase transition-colors"
            >
              <span>EXPLORE ALL ROSTER</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {fighters.slice(0, 3).map((f) => (
              <div
                key={f.id}
                onClick={() => onSelectFighter(f.id)}
                className="bg-[#1c1b1b] brutal-border brutal-cut overflow-hidden group cursor-pointer hover:border-[#e61c24] transition-all"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={f.imageUrl}
                    alt={f.lastName}
                    className="w-full h-full object-cover fighter-image-hover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent"></div>
                  <div className="absolute top-2 left-2 bg-[#e61c24] text-white font-label-caps text-[10px] px-2 py-0.5 brutal-cut-sm">
                    {f.rankingBadge}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-headline-md text-2xl text-white uppercase leading-none m-0">
                      {f.firstName} <span className="text-[#e61c24]">"{f.nickname}"</span> {f.lastName}
                    </h3>
                    <div className="font-label-caps text-xs text-[#ffb4ac] mt-1">
                      {f.record} · {f.weight}
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-[#131313] border-t border-[#2a2a2a] flex justify-between items-center text-xs font-label-caps">
                  <span className="text-[#a09e9e]">STRIKING ACC:</span>
                  <span className="text-white font-bold">{f.strikingAccuracy}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contract & Promotion Alerts */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-[#333333] pb-2">
            <h2 className="font-headline-sm text-2xl text-[#e5e2e1] uppercase flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#ffb4ac]" />
              GAKURAN GANG DISPATCH
            </h2>
          </div>

          {/* Action Gang Fight Feature */}
          <div className="relative bg-[#1c1b1b] brutal-border overflow-hidden group">
            <img
              src={gangFightBannerImg}
              alt="Gakuran High School Brawl"
              className="w-full h-32 object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-90 transition-all duration-300"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#131313]/50 to-transparent"></div>
            <div className="absolute bottom-2 left-3 right-3 flex justify-between items-end">
              <div>
                <span className="font-label-caps text-[9px] bg-[#e61c24] text-white px-1.5 py-0.5 uppercase font-bold">STREET CLASH LIVE</span>
                <p className="font-headline-sm text-lg text-white m-0 uppercase leading-none mt-1">
                  DISTRICT BANCHO WARFARE
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="bg-[#1c1b1b] brutal-border border-l-4 border-l-[#e61c24] p-3.5">
              <div className="flex justify-between items-center mb-1">
                <span className="font-label-caps text-[10px] text-[#e61c24] font-bold">URGENT CONTRACT</span>
                <span className="font-label-caps text-[10px] text-[#767575]">TODAY</span>
              </div>
              <p className="font-body-md text-sm text-[#e5e2e1]">
                Marcus Vane has only 1 fight remaining on current promotional contract. Rival gakuran factions are submitting offers.
              </p>
              <button
                onClick={() => onSelectFighter('marcus-vane')}
                className="mt-2 text-xs font-label-caps text-[#ffb4ac] hover:text-white uppercase font-bold flex items-center gap-1"
              >
                OPEN VANE NEGOTIATION <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-[#1c1b1b] brutal-border border-l-4 border-l-[#3b82f6] p-3.5">
              <div className="flex justify-between items-center mb-1">
                <span className="font-label-caps text-[10px] text-[#60a5fa] font-bold">EVENT SANCTIONED</span>
                <span className="font-label-caps text-[10px] text-[#767575]">YESTERDAY</span>
              </div>
              <p className="font-body-md text-sm text-[#e5e2e1]">
                Unified Delinquent Athletic Commission officially approved 5-round gakuran rules for TGC 305 Main Event.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
