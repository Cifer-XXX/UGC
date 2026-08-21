import React from 'react';
import { X, Shield, Award, DollarSign, Building2, User, Trophy, BarChart3 } from 'lucide-react';
import bossMgrImg from '../assets/images/gakuran_boss_mgr_1787275151429.jpg';

interface ManagerModalProps {
  onClose: () => void;
  fighterCount: number;
}

export const ManagerModal: React.FC<ManagerModalProps> = ({ onClose, fighterCount }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1c1b1b] brutal-border max-w-lg w-full brutal-cut shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#131313] p-4 border-b border-[#333333] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#e61c24]" />
            <h2 className="font-headline-sm text-2xl text-[#e5e2e1] uppercase m-0 leading-none">
              EXECUTIVE MATCHMAKER OFFICE
            </h2>
          </div>
          <button onClick={onClose} className="text-[#a09e9e] hover:text-white p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5">
          <div className="flex items-center gap-4 bg-[#131313] p-4 brutal-border">
            <div className="w-16 h-16 brutal-border overflow-hidden shrink-0">
              <img
                src={bossMgrImg}
                alt="Executive Manager"
                className="w-full h-full object-cover grayscale contrast-125"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="font-label-caps text-xs text-[#e61c24] font-bold">
                GAKURAN COMBAT ARCHITECT
              </div>
              <h3 className="font-headline-lg text-3xl text-white uppercase leading-none m-0 mt-0.5">
                EXECUTIVE BANCHO PROMOTER
              </h3>
              <p className="font-body-md text-xs text-[#a09e9e] m-0 mt-1">
                Chairman Authority · All-Japan Delinquent Combat Sports Regulatory Board
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 font-label-caps text-xs">
            <div className="bg-[#131313] p-3 brutal-border">
              <span className="text-[#767575] block text-[10px]">MANAGEMENT REPUTATION</span>
              <span className="text-emerald-400 font-headline-sm text-2xl">99.4% S-TIER</span>
            </div>
            <div className="bg-[#131313] p-3 brutal-border">
              <span className="text-[#767575] block text-[10px]">CONTRACTED ROSTER</span>
              <span className="text-white font-headline-sm text-2xl">{fighterCount} ATHLETES</span>
            </div>
            <div className="bg-[#131313] p-3 brutal-border">
              <span className="text-[#767575] block text-[10px]">TOTAL PPV EVENTS</span>
              <span className="text-[#ffb4ac] font-headline-sm text-2xl">305 EVENTS</span>
            </div>
            <div className="bg-[#131313] p-3 brutal-border">
              <span className="text-[#767575] block text-[10px]">CHAMPIONSHIP BELTS</span>
              <span className="text-[#e61c24] font-headline-sm text-2xl">8 DIVISIONS</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-[#e61c24] hover:bg-[#c00015] text-white font-headline-sm text-xl py-3 brutal-cut uppercase glitch-hover transition-colors text-center"
          >
            CONFIRM EXECUTIVE CREDENTIALS
          </button>
        </div>

      </div>
    </div>
  );
};

interface SettingsModalProps {
  onClose: () => void;
  audioFx: boolean;
  setAudioFx: (val: boolean) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  audioFx,
  setAudioFx,
  highContrast,
  setHighContrast
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1c1b1b] brutal-border max-w-md w-full brutal-cut shadow-2xl">
        <div className="bg-[#131313] p-4 border-b border-[#333333] flex justify-between items-center">
          <h2 className="font-headline-sm text-2xl text-[#e5e2e1] uppercase m-0 leading-none">
            PROMOTION SETTINGS
          </h2>
          <button onClick={onClose} className="text-[#a09e9e] hover:text-white p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between p-3 bg-[#131313] brutal-border">
            <div>
              <span className="font-label-caps text-xs text-white font-bold block">Fight FX & Announcer Audio</span>
              <span className="font-body-md text-xs text-[#a09e9e]">Enable audio alerts on knockouts and contract signings</span>
            </div>
            <input
              type="checkbox"
              checked={audioFx}
              onChange={(e) => setAudioFx(e.target.checked)}
              className="w-5 h-5 accent-[#e61c24]"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-[#131313] brutal-border">
            <div>
              <span className="font-label-caps text-xs text-white font-bold block">High Contrast Brutalist Mode</span>
              <span className="font-body-md text-xs text-[#a09e9e]">Sharp 90-degree lines and maximum visibility</span>
            </div>
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
              className="w-5 h-5 accent-[#e61c24]"
            />
          </div>

          <button
            onClick={onClose}
            className="w-full bg-[#e61c24] hover:bg-[#c00015] text-white font-headline-sm text-xl py-3 brutal-cut uppercase glitch-hover transition-colors"
          >
            SAVE PREFERENCES
          </button>
        </div>
      </div>
    </div>
  );
};
