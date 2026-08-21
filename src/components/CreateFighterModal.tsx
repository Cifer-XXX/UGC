import React, { useState } from 'react';
import { Fighter, WeightClass, FIGHTING_STYLES, FightingStyle } from '../types';
import { X, Plus, Shield, Swords, Sparkles, Image as ImageIcon } from 'lucide-react';
import defaultGakuranFighter from '../assets/images/gakuran_fighter_one_1787275118531.jpg';

interface CreateFighterModalProps {
  onClose: () => void;
  onCreateFighter: (newFighter: Fighter) => void;
}

export const CreateFighterModal: React.FC<CreateFighterModalProps> = ({
  onClose,
  onCreateFighter
}) => {
  const [firstName, setFirstName] = useState('');
  const [nickname, setNickname] = useState('');
  const [lastName, setLastName] = useState('');
  const [weightClass, setWeightClass] = useState<WeightClass>('WELTERWEIGHT (170 LBS)');
  const [stance, setStance] = useState<'ORTHODOX' | 'SOUTHPAW' | 'SWITCH'>('ORTHODOX');
  const [fightingStyle, setFightingStyle] = useState<FightingStyle>('BOXING');
  const [height, setHeight] = useState("6'0\"");
  const [reach, setReach] = useState('74"');
  const [weight, setWeight] = useState('170 LBS');
  const [wins, setWins] = useState(15);
  const [losses, setLosses] = useState(1);
  const [strikingAccuracy, setStrikingAccuracy] = useState(65);
  const [grapplingDefense, setGrapplingDefense] = useState(80);
  const [koPower, setKoPower] = useState(85);
  const [bio, setBio] = useState('Prospect signed from delinquent street circuit with ferocious striking pressure.');
  const [imageUrl, setImageUrl] = useState(defaultGakuranFighter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    const newFighter: Fighter = {
      id: `fighter-${Date.now()}`,
      firstName: firstName.trim().toUpperCase(),
      nickname: (nickname.trim() || 'THE WARRIOR').toUpperCase(),
      lastName: lastName.trim().toUpperCase(),
      rankingBadge: '#5 CONTENDER',
      status: 'ACTIVE ROSTER',
      record: `${wins}-${losses}-0`,
      wins,
      losses,
      draws: 0,
      height,
      reach,
      weight,
      weightClass,
      stance,
      fightingStyle: fightingStyle.toUpperCase(),
      strikingAccuracy,
      grapplingDefense,
      takedownAverage: 2.8,
      takedownAccuracy: 55,
      koPower,
      cardio: 88,
      imageUrl: imageUrl || defaultGakuranFighter,
      recentHistory: [
        {
          id: `h-${Date.now()}-1`,
          event: 'CONTENDER SERIES 42 · MAY 2024',
          date: 'MAY 2024',
          opponent: 'VS. BRANDON MORENO',
          method: 'KO (Spinning Back Fist) · R1 1:44',
          roundTime: 'R1 1:44',
          result: 'WIN'
        }
      ],
      contract: {
        fightsRemaining: 4,
        showPurse: 120000,
        winBonus: 120000,
        ppvCutPercent: 1.0,
        status: 'SIGNED'
      },
      hypeRating: 84,
      bio,
      age: 26,
      country: 'United States',
      countryCode: 'USA'
    };

    onCreateFighter(newFighter);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1c1b1b] brutal-border max-w-xl w-full max-h-[90vh] overflow-y-auto brutal-cut shadow-2xl">
        
        {/* Modal Header */}
        <div className="bg-[#131313] p-4 border-b border-[#333333] flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-[#e61c24]" />
            <h2 className="font-headline-sm text-2xl text-[#e5e2e1] uppercase m-0 leading-none">
              SCOUT & SIGN NEW ATHLETE
            </h2>
          </div>
          <button onClick={onClose} className="text-[#a09e9e] hover:text-white p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-label-caps text-[11px] text-[#a09e9e] uppercase block mb-1">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="CONOR"
                className="w-full bg-[#131313] brutal-border p-2 font-label-caps text-xs text-white uppercase focus:border-[#e61c24] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-label-caps text-[11px] text-[#a09e9e] uppercase block mb-1">Nickname</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="NOTORIOUS"
                className="w-full bg-[#131313] brutal-border p-2 font-label-caps text-xs text-[#ffb4ac] uppercase focus:border-[#e61c24] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-label-caps text-[11px] text-[#a09e9e] uppercase block mb-1">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="MCGREGOR"
                className="w-full bg-[#131313] brutal-border p-2 font-label-caps text-xs text-white uppercase focus:border-[#e61c24] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-label-caps text-[11px] text-[#a09e9e] uppercase block mb-1">Weight Class</label>
              <select
                value={weightClass}
                onChange={(e) => setWeightClass(e.target.value as WeightClass)}
                className="w-full bg-[#131313] brutal-border p-2 font-label-caps text-xs text-white uppercase focus:border-[#e61c24] focus:outline-none"
              >
                <option value="FLYWEIGHT (125 LBS)">FLYWEIGHT (125 LBS)</option>
                <option value="BANTAMWEIGHT (135 LBS)">BANTAMWEIGHT (135 LBS)</option>
                <option value="FEATHERWEIGHT (145 LBS)">FEATHERWEIGHT (145 LBS)</option>
                <option value="LIGHTWEIGHT (155 LBS)">LIGHTWEIGHT (155 LBS)</option>
                <option value="WELTERWEIGHT (170 LBS)">WELTERWEIGHT (170 LBS)</option>
                <option value="MIDDLEWEIGHT (185 LBS)">MIDDLEWEIGHT (185 LBS)</option>
                <option value="LIGHT HEAVYWEIGHT (205 LBS)">LIGHT HEAVYWEIGHT (205 LBS)</option>
                <option value="HEAVYWEIGHT (265 LBS)">HEAVYWEIGHT (265 LBS)</option>
              </select>
            </div>

            <div>
              <label className="font-label-caps text-[11px] text-[#a09e9e] uppercase block mb-1">Fighting Stance</label>
              <select
                value={stance}
                onChange={(e) => setStance(e.target.value as any)}
                className="w-full bg-[#131313] brutal-border p-2 font-label-caps text-xs text-white uppercase focus:border-[#e61c24] focus:outline-none"
              >
                <option value="ORTHODOX">ORTHODOX</option>
                <option value="SOUTHPAW">SOUTHPAW</option>
                <option value="SWITCH">SWITCH</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-label-caps text-[11px] text-[#a09e9e] uppercase block mb-1">Height</label>
              <input
                type="text"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full bg-[#131313] brutal-border p-2 font-label-caps text-xs text-white uppercase focus:border-[#e61c24] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-label-caps text-[11px] text-[#a09e9e] uppercase block mb-1">Reach</label>
              <input
                type="text"
                value={reach}
                onChange={(e) => setReach(e.target.value)}
                className="w-full bg-[#131313] brutal-border p-2 font-label-caps text-xs text-white uppercase focus:border-[#e61c24] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-label-caps text-[11px] text-[#a09e9e] uppercase block mb-1">Wins / Losses</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  value={wins}
                  onChange={(e) => setWins(Number(e.target.value))}
                  className="w-1/2 bg-[#131313] brutal-border p-2 font-label-caps text-xs text-white text-center"
                />
                <input
                  type="number"
                  value={losses}
                  onChange={(e) => setLosses(Number(e.target.value))}
                  className="w-1/2 bg-[#131313] brutal-border p-2 font-label-caps text-xs text-white text-center"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="font-label-caps text-[11px] text-[#a09e9e] uppercase block mb-1">Combat Style / Disciplines</label>
            <select
              value={fightingStyle}
              onChange={(e) => setFightingStyle(e.target.value as FightingStyle)}
              className="w-full bg-[#131313] brutal-border p-2 font-label-caps text-xs text-white uppercase focus:border-[#e61c24] focus:outline-none"
            >
              {FIGHTING_STYLES.map((style) => (
                <option key={style} value={style} className="bg-[#131313] text-white">
                  {style}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-label-caps text-[10px] text-[#a09e9e] uppercase block mb-1">Striking Acc ({strikingAccuracy}%)</label>
              <input
                type="range"
                min="40"
                max="95"
                value={strikingAccuracy}
                onChange={(e) => setStrikingAccuracy(Number(e.target.value))}
                className="w-full accent-[#e61c24]"
              />
            </div>
            <div>
              <label className="font-label-caps text-[10px] text-[#a09e9e] uppercase block mb-1">Grappling Def ({grapplingDefense}%)</label>
              <input
                type="range"
                min="40"
                max="98"
                value={grapplingDefense}
                onChange={(e) => setGrapplingDefense(Number(e.target.value))}
                className="w-full accent-[#ffb4ac]"
              />
            </div>
            <div>
              <label className="font-label-caps text-[10px] text-[#a09e9e] uppercase block mb-1">KO Power ({koPower}%)</label>
              <input
                type="range"
                min="50"
                max="99"
                value={koPower}
                onChange={(e) => setKoPower(Number(e.target.value))}
                className="w-full accent-[#e61c24]"
              />
            </div>
          </div>

          <div>
            <label className="font-label-caps text-[11px] text-[#a09e9e] uppercase block mb-1">Athlete Portrait URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-[#131313] brutal-border p-2 font-label-caps text-xs text-white focus:border-[#e61c24] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#e61c24] hover:bg-[#c00015] text-white font-headline-md text-2xl py-3.5 brutal-cut uppercase glitch-hover transition-all flex justify-center items-center gap-2 cursor-pointer mt-2"
          >
            <Plus className="w-5 h-5" />
            <span>SIGN ATHLETE TO PROMOTION</span>
          </button>
        </form>

      </div>
    </div>
  );
};
