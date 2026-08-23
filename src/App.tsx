import React, { useState } from 'react';
import { initialFighters } from './data/fighters';
import { initialNotifications } from './data/events';
import { Fighter, NotificationItem, AppTab } from './types';
import { TopNavbar } from './components/TopNavbar';
import { Footer } from './components/Footer';
import { FighterProfile } from './components/FighterProfile';
import { FightersDirectoryView } from './components/FightersDirectoryView';
import { RankingsView } from './components/RankingsView';
import { MatchmakingView } from './components/MatchmakingView';
import { HistoryView } from './components/HistoryView';
import { OfferContractModal } from './components/OfferContractModal';
import { CreateFighterModal } from './components/CreateFighterModal';
import { ManagerModal, SettingsModal } from './components/ManagerModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('FIGHTERS');
  const [fighters, setFighters] = useState<Fighter[]>(initialFighters);
  const [selectedFighterId, setSelectedFighterId] = useState<string>('marcus-vane');
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  
  // Modals
  const [contractFighter, setContractFighter] = useState<Fighter | null>(null);
  const [isCreateFighterOpen, setIsCreateFighterOpen] = useState<boolean>(false);
  const [isManagerOpen, setIsManagerOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [audioFx, setAudioFx] = useState<boolean>(true);
  const [highContrast, setHighContrast] = useState<boolean>(true);

  // Matchmaking selection prefill
  const [matchmakingRedCornerId, setMatchmakingRedCornerId] = useState<string>('marcus-vane');
  const [matchmakingBlueCornerId, setMatchmakingBlueCornerId] = useState<string>('kamaru-usman');

  // Currently viewed fighter
  const currentFighter = fighters.find(f => f.id === selectedFighterId) || fighters[0];

  const handleSelectFighter = (fighterId: string) => {
    setSelectedFighterId(fighterId);
    setCurrentTab('FIGHTERS');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookInMatchmaking = (fighter: Fighter) => {
    setMatchmakingRedCornerId(fighter.id);
    const opponent = fighters.find(f => f.id !== fighter.id) || fighters[0];
    setMatchmakingBlueCornerId(opponent.id);
    setCurrentTab('MATCHMAKING');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignContract = (fighterId: string, updatedContract: Fighter['contract']) => {
    setFighters(prev => prev.map(f => {
      if (f.id === fighterId) {
        return {
          ...f,
          contract: updatedContract,
          status: 'ACTIVE ROSTER'
        };
      }
      return f;
    }));

    // Add notification
    const signedFighter = fighters.find(f => f.id === fighterId);
    if (signedFighter) {
      setNotifications(prev => [
        {
          id: `n-${Date.now()}`,
          title: 'CONTRACT EXECUTED',
          description: `${signedFighter.firstName} "${signedFighter.nickname}" ${signedFighter.lastName} inked a new ${updatedContract.fightsRemaining}-fight promotional deal.`,
          time: 'Just now',
          type: 'CONTRACT',
          read: false
        },
        ...prev
      ]);
    }
  };

  const handleRecordFightResult = (winnerId: string, loserId: string, method: string, roundTime: string) => {
    const winner = fighters.find(f => f.id === winnerId);
    const loser = fighters.find(f => f.id === loserId);
    if (!winner || !loser) return;

    const eventTitle = `OCTAGON SHOWDOWN · ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}`;

    setFighters(prev => prev.map(f => {
      if (f.id === winnerId) {
        return {
          ...f,
          wins: f.wins + 1,
          record: `${f.wins + 1}-${f.losses}-${f.draws}`,
          hypeRating: Math.min(100, f.hypeRating + 3),
          recentHistory: [
            {
              id: `hist-${Date.now()}-w`,
              event: eventTitle,
              date: 'TODAY',
              opponent: `VS. ${loser.firstName} "${loser.nickname}" ${loser.lastName}`,
              method,
              roundTime,
              result: 'WIN'
            },
            ...f.recentHistory
          ]
        };
      }
      if (f.id === loserId) {
        return {
          ...f,
          losses: f.losses + 1,
          record: `${f.wins}-${f.losses + 1}-${f.draws}`,
          hypeRating: Math.max(50, f.hypeRating - 2),
          recentHistory: [
            {
              id: `hist-${Date.now()}-l`,
              event: eventTitle,
              date: 'TODAY',
              opponent: `VS. ${winner.firstName} "${winner.nickname}" ${winner.lastName}`,
              method,
              roundTime,
              result: 'LOSS'
            },
            ...f.recentHistory
          ]
        };
      }
      return f;
    }));
  };

  const handleCreateFighter = (newFighter: Fighter) => {
    setFighters(prev => [newFighter, ...prev]);
    setSelectedFighterId(newFighter.id);
    setIsCreateFighterOpen(false);
    setCurrentTab('FIGHTERS');
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="bg-[#131313] text-[#e5e2e1] min-h-screen flex flex-col relative overflow-x-hidden">
      
      {/* Cage Background Mesh Pattern */}
      <div className="fixed inset-0 cage-bg pointer-events-none z-0"></div>

      {/* Top Navigation Bar */}
      <TopNavbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        fighters={fighters}
        onSelectFighter={handleSelectFighter}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onOpenManager={() => setIsManagerOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Mobile Navigation Tab Bar */}
      <div className="flex md:hidden bg-[#1c1b1b] border-b border-[#333333] px-2 py-2 justify-around z-40 sticky top-0 overflow-x-auto">
        {(['RANKINGS', 'FIGHTERS', 'MATCHMAKING', 'HISTORIA'] as const).map((tab) => {
          const isActive = currentTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab)}
              className={`font-label-caps text-[10px] sm:text-[11px] uppercase py-1 px-1.5 transition-colors whitespace-nowrap ${
                isActive
                  ? 'text-[#e61c24] border-b-2 border-[#e61c24] font-bold'
                  : 'text-[#a09e9e]'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10 relative z-10">
        {currentTab === 'FIGHTERS' && (
          <FightersDirectoryView
            initialFighters={fighters}
            onBookInMatchmaking={handleBookInMatchmaking}
            onOfferContract={(f) => setContractFighter(f)}
            onNavigateToRankings={() => setCurrentTab('RANKINGS')}
          />
        )}

        {currentTab === 'RANKINGS' && (
          <RankingsView
            fighters={fighters}
            onSelectFighter={handleSelectFighter}
            onBookFighter={(id) => {
              const f = fighters.find(item => item.id === id);
              if (f) handleBookInMatchmaking(f);
            }}
            onNavigateToHistory={() => setCurrentTab('HISTORIA')}
          />
        )}

        {currentTab === 'MATCHMAKING' && (
          <MatchmakingView
            fighters={fighters}
            initialRedCornerId={matchmakingRedCornerId}
            initialBlueCornerId={matchmakingBlueCornerId}
            onViewFighterProfile={handleSelectFighter}
            onRecordFightResult={handleRecordFightResult}
            onNavigateToHistory={() => setCurrentTab('HISTORIA')}
          />
        )}

        {currentTab === 'HISTORIA' && (
          <HistoryView
            onNavigateToRankings={() => setCurrentTab('RANKINGS')}
          />
        )}
      </main>

      {/* Contract Offer Modal */}
      {contractFighter && (
        <OfferContractModal
          fighter={contractFighter}
          onClose={() => setContractFighter(null)}
          onSignContract={handleSignContract}
        />
      )}

      {/* Scout / Create Fighter Modal */}
      {isCreateFighterOpen && (
        <CreateFighterModal
          onClose={() => setIsCreateFighterOpen(false)}
          onCreateFighter={handleCreateFighter}
        />
      )}

      {/* Manager Profile Modal */}
      {isManagerOpen && (
        <ManagerModal
          onClose={() => setIsManagerOpen(false)}
          fighterCount={fighters.length}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
          audioFx={audioFx}
          setAudioFx={setAudioFx}
          highContrast={highContrast}
          setHighContrast={setHighContrast}
        />
      )}

      {/* Footer */}
      <Footer
        onNavigateTab={setCurrentTab}
        onOpenPrivacy={() => alert('Ultimate Gakuran Championship Privacy Protocol: All fighter data and purse figures are encrypted under unified athletic commission standards.')}
        onOpenTerms={() => alert('Terms of Promotion: Bouts are subject to unified rules of mixed martial arts and mandatory drug testing protocols.')}
        onOpenContact={() => setIsManagerOpen(true)}
      />

    </div>
  );
}
