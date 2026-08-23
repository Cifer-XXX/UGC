import React, { useState } from 'react';
import { Bell, Settings, Search, X, CheckCircle2, AlertTriangle, ShieldCheck, History as HistoryIcon } from 'lucide-react';
import { Fighter, NotificationItem, AppTab } from '../types';
import bossMgrImg from '../assets/images/gakuran_boss_mgr_1787275151429.jpg';

interface TopNavbarProps {
  currentTab: AppTab;
  setCurrentTab: (tab: AppTab) => void;
  fighters: Fighter[];
  onSelectFighter: (fighterId: string) => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onOpenManager: () => void;
  onOpenSettings: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentTab,
  setCurrentTab,
  fighters,
  onSelectFighter,
  notifications,
  onMarkNotificationRead,
  onOpenManager,
  onOpenSettings
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredFighters = searchQuery.trim() === '' ? [] : fighters.filter(f => 
    `${f.firstName} ${f.nickname} ${f.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.weightClass.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.fightingStyle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <nav className="bg-[#131313] border-b-2 border-[#333333] w-full top-0 z-50 flex justify-between items-center px-4 md:px-6 py-3.5 max-w-full mx-auto relative">
      {/* Brand Logo */}
      <button 
        onClick={() => setCurrentTab('RANKINGS')}
        className="text-left focus:outline-none group cursor-pointer flex flex-col justify-center"
        id="navbar-brand-logo"
      >
        <div className="font-headline-lg text-2xl sm:text-3xl md:text-[34px] tracking-tight text-[#ffb4ac] group-hover:text-[#e61c24] transition-colors leading-none">
          ULTIMATE GAKURAN CHAMPIONSHIP
        </div>
        <div className="font-label-caps text-[10px] sm:text-[11px] md:text-xs tracking-[0.25em] text-[#a09e9e] group-hover:text-white uppercase font-bold mt-1 leading-none">
          MANAGER
        </div>
      </button>

      {/* Navigation Tabs */}
      <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
        {(['RANKINGS', 'FIGHTERS', 'MATCHMAKING', 'HISTORIA'] as const).map((tab) => {
          const isActive = currentTab === tab;
          return (
            <button
              key={tab}
              id={`nav-tab-${tab.toLowerCase()}`}
              onClick={() => setCurrentTab(tab)}
              className={`font-label-caps text-xs md:text-sm tracking-wider uppercase transition-all duration-150 relative py-1 ${
                isActive
                  ? 'text-[#ffb4ac] border-b-4 border-[#e61c24] pb-1.5 font-bold scale-100'
                  : 'text-[#a09e9e] hover:text-[#e5e2e1] hover:bg-[#201f1f] px-2 py-1'
              }`}
            >
              {tab === 'HISTORIA' ? (
                <span className="flex items-center gap-1">
                  <HistoryIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>HISTORIA</span>
                </span>
              ) : (
                tab
              )}
            </button>
          );
        })}
      </div>

      {/* Action Controls & Search */}
      <div className="flex items-center space-x-3 md:space-x-4">
        {/* Search Input */}
        <div className="relative">
          <div className="flex items-center bg-[#1c1b1b] brutal-border-bottom px-2 py-1 w-36 sm:w-48 md:w-56 transition-colors focus-within:border-[#e61c24]">
            <input
              type="text"
              id="global-search-input"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="SEARCH..."
              className="bg-transparent text-[#e5e2e1] focus:outline-none font-label-caps text-xs w-full uppercase placeholder-[#767575]"
            />
            {searchQuery ? (
              <button 
                onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }}
                className="text-[#a09e9e] hover:text-[#e5e2e1]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <Search className="w-3.5 h-3.5 text-[#a09e9e]" />
            )}
          </div>

          {/* Search Dropdown */}
          {isSearchOpen && filteredFighters.length > 0 && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-[#1c1b1b] brutal-border shadow-2xl z-50">
              <div className="p-2 border-b border-[#333333] font-label-caps text-[10px] text-[#a09e9e] uppercase tracking-wider">
                Matching Roster Athletes ({filteredFighters.length})
              </div>
              <div className="max-h-60 overflow-y-auto">
                {filteredFighters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      onSelectFighter(f.id);
                      setCurrentTab('FIGHTERS');
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-[#2a2a2a] border-b border-[#252525] flex items-center gap-3 transition-colors"
                  >
                    <img 
                      src={f.imageUrl} 
                      alt={f.lastName} 
                      className="w-8 h-8 object-cover brutal-border grayscale"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="font-headline-sm text-sm text-[#e5e2e1] uppercase leading-none">
                        {f.firstName} "{f.nickname}" {f.lastName}
                      </div>
                      <div className="font-label-caps text-[10px] text-[#e61c24] mt-0.5">
                        {f.rankingBadge} · {f.weight}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Button */}
        <div className="relative">
          <button
            id="notifications-button"
            aria-label="notifications"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="text-[#a09e9e] hover:text-[#e5e2e1] transition-colors p-1.5 relative hover:bg-[#201f1f]"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-none bg-[#e61c24] animate-pulse"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#1c1b1b] brutal-border shadow-2xl z-50">
              <div className="p-3 border-b border-[#333333] flex justify-between items-center bg-[#131313]">
                <span className="font-label-caps text-xs text-[#e5e2e1] uppercase tracking-wider font-bold">
                  Fight Dispatches ({notifications.length})
                </span>
                <button 
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-[#a09e9e] hover:text-[#e5e2e1]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => onMarkNotificationRead(n.id)}
                    className={`p-3 border-b border-[#2a2a2a] cursor-pointer hover:bg-[#262626] transition-colors ${
                      !n.read ? 'bg-[#201f1f] border-l-2 border-l-[#e61c24]' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-label-caps text-[10px] text-[#e61c24] font-bold">
                        {n.title}
                      </span>
                      <span className="font-label-caps text-[10px] text-[#767575]">
                        {n.time}
                      </span>
                    </div>
                    <p className="font-body-md text-xs text-[#c8c6c5] leading-relaxed">
                      {n.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Settings Button */}
        <button
          id="settings-button"
          aria-label="settings"
          onClick={onOpenSettings}
          className="text-[#a09e9e] hover:text-[#e5e2e1] transition-colors p-1.5 hover:bg-[#201f1f]"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Manager Profile Avatar */}
        <button
          id="manager-profile-button"
          onClick={onOpenManager}
          className="w-9 h-9 brutal-border overflow-hidden group relative hover:border-[#e61c24] transition-colors cursor-pointer"
          title="Open Manager Office"
        >
          <img
            alt="Manager profile"
            className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-300"
            src={bossMgrImg}
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#e61c24]"></div>
        </button>
      </div>
    </nav>
  );
};
