import React, { useState, useMemo } from 'react';
import { Fighter } from '../types';
import { X, Check, DollarSign, Award, AlertCircle, Sparkles, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OfferContractModalProps {
  fighter: Fighter;
  onClose: () => void;
  onSignContract: (fighterId: string, updatedContract: Fighter['contract']) => void;
}

export const OfferContractModal: React.FC<OfferContractModalProps> = ({
  fighter,
  onClose,
  onSignContract
}) => {
  const [fights, setFights] = useState<number>(fighter.contract.fightsRemaining <= 1 ? 4 : fighter.contract.fightsRemaining);
  const [showPurse, setShowPurse] = useState<number>(fighter.contract.showPurse || 450000);
  const [winBonus, setWinBonus] = useState<number>(fighter.contract.winBonus || 450000);
  const [ppvCut, setPpvCut] = useState<number>(fighter.contract.ppvCutPercent || 2.5);
  const [signingBonus, setSigningBonus] = useState<number>(100000);
  const [hasChampionshipClause, setHasChampionshipClause] = useState<boolean>(true);
  const [hasPerformanceClause, setHasPerformanceClause] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [dealOutcome, setDealOutcome] = useState<'IDLE' | 'ACCEPTED' | 'REJECTED'>('IDLE');
  const [agentFeedback, setAgentFeedback] = useState<string>('');

  // Calculate Acceptance Probability based on fighter ranking, hype, and money offered
  const acceptanceMetrics = useMemo(() => {
    const minExpectedShow = fighter.rankingBadge.includes('CHAMPION')
      ? 1000000
      : fighter.rankingBadge.includes('#1')
      ? 500000
      : 250000;

    let score = 50;

    // Show purse weight
    if (showPurse >= minExpectedShow * 1.5) score += 30;
    else if (showPurse >= minExpectedShow) score += 15;
    else if (showPurse < minExpectedShow * 0.7) score -= 35;

    // Win bonus weight
    if (winBonus >= showPurse) score += 10;
    else score -= 10;

    // PPV cut weight
    if (ppvCut >= 3.0) score += 15;
    else if (ppvCut > 0) score += 5;

    // Signing bonus weight
    if (signingBonus >= 200000) score += 15;
    else if (signingBonus > 0) score += 5;

    // Clauses
    if (hasChampionshipClause) score += 8;
    if (hasPerformanceClause) score += 5;

    const clamped = Math.max(5, Math.min(99, score));
    return {
      probability: clamped,
      totalGuaranteed: (showPurse * fights) + signingBonus,
      potentialMaxPayout: ((showPurse + winBonus) * fights) + signingBonus
    };
  }, [fighter, showPurse, winBonus, ppvCut, signingBonus, fights, hasChampionshipClause, hasPerformanceClause]);

  const handleProposeContract = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const isAccepted = Math.random() * 100 <= acceptanceMetrics.probability;

      if (isAccepted) {
        setDealOutcome('ACCEPTED');
        setAgentFeedback(
          `"We have an agreement. ${fighter.firstName} '${fighter.nickname}' ${fighter.lastName} is officially locked in for ${fights} bouts under Championship terms!"`
        );
        // Confetti explosion
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#e61c24', '#ffffff', '#ffb4ac']
        });

        // Update parent state
        onSignContract(fighter.id, {
          fightsRemaining: fights,
          showPurse,
          winBonus,
          ppvCutPercent: ppvCut,
          status: 'SIGNED'
        });
      } else {
        setDealOutcome('REJECTED');
        setAgentFeedback(
          `"My client feels insulted by this package. Increase the base show money and add PPV points if you want ${fighter.lastName} in the Octagon."`
        );
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1c1b1b] brutal-border max-w-2xl w-full max-h-[90vh] overflow-y-auto brutal-cut shadow-2xl relative">
        
        {/* Header */}
        <div className="bg-[#131313] p-4 border-b border-[#333333] flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#e61c24] animate-pulse"></div>
            <div>
              <h2 className="font-headline-sm text-2xl text-[#e5e2e1] uppercase m-0 leading-none">
                OCTAGON CONTRACT NEGOTIATOR
              </h2>
              <div className="font-label-caps text-xs text-[#ffb4ac] mt-1">
                ATHLETE: {fighter.firstName} "{fighter.nickname}" {fighter.lastName} ({fighter.record})
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#a09e9e] hover:text-white p-1 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-6">

          {dealOutcome === 'ACCEPTED' ? (
            <div className="bg-[#201f1f] brutal-border border-[#e61c24] p-6 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-[#e61c24] flex items-center justify-center brutal-cut">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-headline-lg text-4xl text-white uppercase m-0">
                CONTRACT SIGNED & EXECUTED!
              </h3>
              <p className="font-body-md text-base text-[#c8c6c5] italic max-w-lg">
                {agentFeedback}
              </p>
              <div className="grid grid-cols-3 gap-3 w-full bg-[#131313] p-3 brutal-border text-center font-label-caps text-xs">
                <div>
                  <span className="text-[#a09e9e] block">BOUTS</span>
                  <span className="text-white font-bold text-base">{fights} FIGHTS</span>
                </div>
                <div>
                  <span className="text-[#a09e9e] block">PURSE PER BOUT</span>
                  <span className="text-[#e61c24] font-bold text-base">${(showPurse / 1000).toFixed(0)}K / ${(winBonus / 1000).toFixed(0)}K</span>
                </div>
                <div>
                  <span className="text-[#a09e9e] block">PPV CUT</span>
                  <span className="text-white font-bold text-base">{ppvCut}%</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="bg-[#e61c24] hover:bg-[#c00015] text-white font-headline-sm text-xl px-8 py-3 brutal-cut uppercase glitch-hover mt-2"
              >
                RETURN TO FIGHTER ROSTER
              </button>
            </div>
          ) : (
            <>
              {/* Outcome Feedback if rejected */}
              {dealOutcome === 'REJECTED' && (
                <div className="bg-[#2a1313] border border-[#e61c24] p-4 flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-[#e61c24] shrink-0" />
                  <div>
                    <div className="font-label-caps text-xs text-[#e61c24] uppercase font-bold">
                      PROPOSAL REJECTED BY AGENT
                    </div>
                    <div className="font-body-md text-sm text-[#e5e2e1] italic mt-0.5">
                      {agentFeedback}
                    </div>
                  </div>
                </div>
              )}

              {/* Sliders & Contract Terms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Number of Bouts */}
                <div className="bg-[#131313] p-4 brutal-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-label-caps text-xs text-[#a09e9e] uppercase">Bout Term Length</span>
                    <span className="font-headline-sm text-xl text-[#ffb4ac]">{fights} FIGHTS</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="1"
                    value={fights}
                    onChange={(e) => setFights(Number(e.target.value))}
                    className="w-full accent-[#e61c24] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-label-caps text-[#767575] mt-1">
                    <span>1 FIGHT</span>
                    <span>4 FIGHTS</span>
                    <span>8 FIGHTS</span>
                  </div>
                </div>

                {/* Show Purse */}
                <div className="bg-[#131313] p-4 brutal-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-label-caps text-xs text-[#a09e9e] uppercase">Base Show Purse</span>
                    <span className="font-headline-sm text-xl text-[#e61c24]">${(showPurse).toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="50000"
                    max="2000000"
                    step="25000"
                    value={showPurse}
                    onChange={(e) => setShowPurse(Number(e.target.value))}
                    className="w-full accent-[#e61c24] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-label-caps text-[#767575] mt-1">
                    <span>$50K</span>
                    <span>$1M</span>
                    <span>$2M</span>
                  </div>
                </div>

                {/* Win Bonus */}
                <div className="bg-[#131313] p-4 brutal-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-label-caps text-xs text-[#a09e9e] uppercase">Win Bonus</span>
                    <span className="font-headline-sm text-xl text-[#e5e2e1]">${(winBonus).toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="50000"
                    max="2000000"
                    step="25000"
                    value={winBonus}
                    onChange={(e) => setWinBonus(Number(e.target.value))}
                    className="w-full accent-[#e61c24] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-label-caps text-[#767575] mt-1">
                    <span>$50K</span>
                    <span>$1M</span>
                    <span>$2M</span>
                  </div>
                </div>

                {/* PPV Cut */}
                <div className="bg-[#131313] p-4 brutal-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-label-caps text-xs text-[#a09e9e] uppercase">PPV Points Cut</span>
                    <span className="font-headline-sm text-xl text-[#ffb4ac]">{ppvCut.toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    step="0.5"
                    value={ppvCut}
                    onChange={(e) => setPpvCut(Number(e.target.value))}
                    className="w-full accent-[#e61c24] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-label-caps text-[#767575] mt-1">
                    <span>0% (NON-PPV)</span>
                    <span>4.0%</span>
                    <span>8.0%</span>
                  </div>
                </div>

                {/* Signing Bonus */}
                <div className="bg-[#131313] p-4 brutal-border md:col-span-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-label-caps text-xs text-[#a09e9e] uppercase">Immediate Signing Bonus</span>
                    <span className="font-headline-sm text-xl text-[#e5e2e1]">${(signingBonus).toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="500000"
                    step="25000"
                    value={signingBonus}
                    onChange={(e) => setSigningBonus(Number(e.target.value))}
                    className="w-full accent-[#e61c24] cursor-pointer"
                  />
                </div>
              </div>

              {/* Special Incentive Clauses */}
              <div className="bg-[#131313] p-4 brutal-border flex flex-col gap-3">
                <span className="font-label-caps text-xs text-[#a09e9e] uppercase font-bold">
                  SPECIAL INCENTIVE CLAUSES
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={hasChampionshipClause}
                      onChange={(e) => setHasChampionshipClause(e.target.checked)}
                      className="w-4 h-4 accent-[#e61c24] rounded-none"
                    />
                    <span className="font-body-md text-sm text-[#e5e2e1]">
                      Automatic 50% Purse Escalator upon winning Title Belt
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={hasPerformanceClause}
                      onChange={(e) => setHasPerformanceClause(e.target.checked)}
                      className="w-4 h-4 accent-[#e61c24] rounded-none"
                    />
                    <span className="font-body-md text-sm text-[#e5e2e1]">
                      Guaranteed $50K Performance Bonus on Stoppage
                    </span>
                  </label>
                </div>
              </div>

              {/* Acceptance Probability Bar */}
              <div className="bg-[#201f1f] brutal-border p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-label-caps text-xs text-[#a09e9e] uppercase flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-[#e61c24]" />
                    Athlete & Management Acceptance Probability
                  </span>
                  <span className={`font-headline-sm text-xl uppercase ${
                    acceptanceMetrics.probability >= 70 ? 'text-[#ffb4ac]' : acceptanceMetrics.probability >= 40 ? 'text-amber-400' : 'text-[#e61c24]'
                  }`}>
                    {acceptanceMetrics.probability}% {acceptanceMetrics.probability >= 70 ? 'LIKELY' : acceptanceMetrics.probability >= 40 ? 'MODERATE' : 'RESISTANT'}
                  </span>
                </div>
                <div className="w-full bg-[#353534] h-3.5 brutal-border">
                  <div
                    className={`h-full transition-all duration-300 ${
                      acceptanceMetrics.probability >= 70 ? 'bg-[#e61c24]' : acceptanceMetrics.probability >= 40 ? 'bg-amber-500' : 'bg-red-800'
                    }`}
                    style={{ width: `${acceptanceMetrics.probability}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] font-label-caps text-[#a09e9e] mt-1">
                  <span>Guaranteed Commitment: ${(acceptanceMetrics.totalGuaranteed / 1000000).toFixed(2)}M</span>
                  <span>Max Potential Value: ${(acceptanceMetrics.potentialMaxPayout / 1000000).toFixed(2)}M</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                id="submit-proposal-button"
                onClick={handleProposeContract}
                disabled={isSubmitting}
                className="w-full bg-[#e61c24] hover:bg-[#c00015] disabled:bg-[#353534] text-white font-headline-md text-2xl py-4 brutal-cut uppercase glitch-hover transition-all flex justify-center items-center gap-2 cursor-pointer shadow-xl"
              >
                {isSubmitting ? (
                  <span>TRANSMITTING PROPOSAL TO MANAGEMENT...</span>
                ) : (
                  <>
                    <Award className="w-6 h-6" />
                    <span>SUBMIT OFFICIAL PROPOSAL</span>
                  </>
                )}
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
