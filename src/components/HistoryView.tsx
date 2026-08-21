import React, { useState, useEffect } from 'react';
import { SeasonSnapshot, UgcDivision } from '../types';
import { INITIAL_SEASON_HISTORY } from '../data/historySamples';
import { 
  History as HistoryIcon, 
  Trophy, 
  Calendar, 
  Award, 
  Shield, 
  Ruler, 
  Flame, 
  Trash2, 
  Layers, 
  FileText, 
  Sparkles,
  ArrowRight,
  Eye,
  CheckCircle2,
  Lock
} from 'lucide-react';

export const SEASON_HISTORY_STORAGE_KEY = 'ugc_season_history_v1';

interface HistoryViewProps {
  onNavigateToRankings?: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onNavigateToRankings }) => {
  const [historyList, setHistoryList] = useState<SeasonSnapshot[]>(() => {
    try {
      const saved = localStorage.getItem(SEASON_HISTORY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading history from storage', e);
    }
    return INITIAL_SEASON_HISTORY;
  });

  const [selectedSeasonId, setSelectedSeasonId] = useState<string>(() => {
    return historyList.length > 0 ? historyList[0].id : '';
  });

  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState<string>('ALL');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(SEASON_HISTORY_STORAGE_KEY, JSON.stringify(historyList));
    } catch (e) {
      console.error('Error saving history list', e);
    }
  }, [historyList]);

  // Keep selected season valid
  useEffect(() => {
    if (historyList.length > 0) {
      const exists = historyList.some(s => s.id === selectedSeasonId);
      if (!exists) {
        setSelectedSeasonId(historyList[0].id);
      }
    } else {
      setSelectedSeasonId('');
    }
  }, [historyList, selectedSeasonId]);

  const activeSeason = historyList.find(s => s.id === selectedSeasonId) || historyList[0] || null;

  const handleDeleteSeason = (id: string) => {
    setHistoryList(prev => prev.filter(s => s.id !== id));
    setDeleteConfirmId(null);
  };

  const handleRestoreSamples = () => {
    setHistoryList(INITIAL_SEASON_HISTORY);
    setSelectedSeasonId(INITIAL_SEASON_HISTORY[0].id);
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).toUpperCase();
    } catch {
      return isoString;
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Header Bar */}
      <div className="bg-[#1c1b1b] brutal-border p-4 sm:p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#2a1718] border border-amber-500/50 rounded-xs">
              <HistoryIcon className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400" />
            </div>
            <div>
              <h1 className="font-headline-lg text-3xl sm:text-4xl text-[#e5e2e1] uppercase m-0 leading-none">
                HISTORIA · ARCHIVO DE TEMPORADAS
              </h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="font-label-caps text-xs text-[#a09e9e]">
                  TABLAS DE RANKINGS Y PUNTOS CONGELADOS AL CIERRE DE CADA TEMPORADA
                </span>
                <span className="bg-[#242424] border border-[#444] text-[#ffb4ac] font-label-caps text-[10px] px-2 py-0.5 font-bold flex items-center gap-1 brutal-cut-sm">
                  <Lock className="w-3 h-3 text-[#ffb4ac]" />
                  SOLO VISUALIZACIÓN
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end flex-wrap">
          {onNavigateToRankings && (
            <button
              onClick={onNavigateToRankings}
              className="bg-[#222121] hover:bg-[#2e2d2d] text-white border border-[#444] font-headline-sm text-sm px-3.5 py-2 brutal-cut uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>IR A RANKINGS ACTUALES</span>
            </button>
          )}

          {historyList.length === 0 && (
            <button
              onClick={handleRestoreSamples}
              className="bg-[#e61c24] hover:bg-[#c00015] text-white font-headline-sm text-sm px-3.5 py-2 brutal-cut uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              <span>CARGAR TEMPORADA DE EJEMPLO</span>
            </button>
          )}
        </div>
      </div>

      {/* Empty State if No Seasons */}
      {historyList.length === 0 ? (
        <div className="bg-[#1c1b1b] brutal-border p-10 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 bg-[#261517] rounded-full flex items-center justify-center border border-amber-500/40">
            <HistoryIcon className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h2 className="font-headline-sm text-2xl text-white uppercase m-0">
              NO HAY TEMPORADAS GUARDADAS AÚN
            </h2>
            <p className="font-label-caps text-xs text-[#a09e9e] max-w-lg mt-2 mx-auto">
              Puedes ir a la pestaña de <strong>Rankings</strong> y presionar el botón <strong>"💾 GUARDAR TEMPORADA"</strong> para congelar la tabla de posiciones con sus puntos finales de esta temporada.
            </p>
          </div>
          <div className="flex gap-3 mt-2">
            <button
              onClick={handleRestoreSamples}
              className="bg-[#e61c24] hover:bg-[#c00015] text-white font-headline-sm text-lg px-6 py-2.5 brutal-cut uppercase cursor-pointer transition-all"
            >
              CARGAR TEMPORADA DE MUESTRA
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Season Selector Tabs */}
          <div className="bg-[#181717] brutal-border p-3.5">
            <div className="flex items-center justify-between gap-2 mb-3 border-b border-[#2d2d2d] pb-2">
              <span className="font-label-caps text-xs text-amber-400 font-bold uppercase flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                SELECCIONAR TEMPORADA GUARDADA ({historyList.length})
              </span>
              <span className="font-label-caps text-[10px] text-[#777]">
                Selecciona una temporada para ver sus tablas por peso
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {historyList.map((season) => {
                const isSelected = activeSeason?.id === season.id;
                return (
                  <div
                    key={season.id}
                    onClick={() => setSelectedSeasonId(season.id)}
                    className={`p-3.5 brutal-border cursor-pointer transition-all flex flex-col justify-between relative group ${
                      isSelected
                        ? 'bg-[#281b1c] border-l-4 border-l-amber-500 shadow-lg'
                        : 'bg-[#121212] hover:bg-[#1f1a1a] border-l-4 border-l-transparent'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-label-caps text-[9px] text-[#999] uppercase flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#ffb4ac]" />
                          {formatDate(season.savedAt)}
                        </span>
                        <span className="font-label-caps text-[9px] bg-[#222] text-amber-400 px-1.5 py-0.5 border border-amber-500/30 rounded-xs font-bold">
                          {season.totalPoints} PTS TOTALES
                        </span>
                      </div>

                      <h3 className={`font-headline-sm text-lg sm:text-xl uppercase m-0 leading-tight mt-1 ${
                        isSelected ? 'text-amber-300 font-bold' : 'text-white group-hover:text-amber-200'
                      }`}>
                        {season.name}
                      </h3>

                      {season.notes && (
                        <p className="font-label-caps text-[10px] text-[#a09e9e] line-clamp-2 mt-1">
                          {season.notes}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#2a2a2a] flex items-center justify-between text-[10px] font-label-caps">
                      <span className="text-[#888]">
                        {season.divisions.length} DIVISIONES · {season.totalFighters} PELEADORES
                      </span>
                      {isSelected ? (
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <Eye className="w-3 h-3" /> VIENDO AHORA
                        </span>
                      ) : (
                        <span className="text-[#666] group-hover:text-white transition-colors">
                          VER TABLAS →
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Season Detailed Content */}
          {activeSeason && (
            <div className="flex flex-col gap-6">
              
              {/* Season Spotlight Header Banner */}
              <div className="bg-gradient-to-r from-[#2a1718] via-[#1c1b1b] to-[#141414] brutal-border border-l-4 border-l-amber-500 p-4 sm:p-6 shadow-2xl relative">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div>
                    <div className="font-label-caps text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-2 flex-wrap">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span>REGISTRO HISTÓRICO OFICIAL · TABLAS DE POSICIONES</span>
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.2 text-[9px]">
                        FECHA DE CIERRE: {formatDate(activeSeason.savedAt)}
                      </span>
                    </div>

                    <h2 className="font-headline-lg text-3xl sm:text-5xl text-white uppercase m-0 leading-none mt-1">
                      {activeSeason.name}
                    </h2>

                    {activeSeason.notes && (
                      <p className="font-label-caps text-xs text-[#c8c6c5] mt-2 max-w-2xl">
                        "{activeSeason.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="bg-[#0e0e0e] brutal-border p-3 flex flex-col items-center min-w-[110px]">
                      <span className="font-label-caps text-[9px] text-[#888] uppercase">PUNTOS TOTALES</span>
                      <span className="font-headline-lg text-2xl text-amber-400 leading-none mt-1 font-bold">
                        {activeSeason.totalPoints} PTS
                      </span>
                    </div>
                    <div className="bg-[#0e0e0e] brutal-border p-3 flex flex-col items-center min-w-[110px]">
                      <span className="font-label-caps text-[9px] text-[#888] uppercase">PELEADORES</span>
                      <span className="font-headline-lg text-2xl text-emerald-400 leading-none mt-1 font-bold">
                        {activeSeason.totalFighters}
                      </span>
                    </div>

                    {/* Delete Season Button */}
                    <div className="relative">
                      {deleteConfirmId === activeSeason.id ? (
                        <div className="flex items-center gap-1 bg-[#2a1010] p-1 border border-red-500">
                          <button
                            onClick={() => handleDeleteSeason(activeSeason.id)}
                            className="bg-red-600 hover:bg-red-700 text-white font-label-caps text-[10px] px-2 py-1 uppercase font-bold cursor-pointer"
                          >
                            CONFIRMAR BORRAR
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="bg-[#333] hover:bg-[#444] text-white font-label-caps text-[10px] px-2 py-1 uppercase cursor-pointer"
                          >
                            CANCELAR
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(activeSeason.id)}
                          className="bg-[#242424] hover:bg-red-900/60 text-[#888] hover:text-red-300 border border-[#333] font-label-caps text-xs p-2.5 brutal-cut-sm transition-colors cursor-pointer"
                          title="Eliminar este registro de temporada"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Weight Division Filter Selector */}
              <div className="flex items-center gap-2 bg-[#181717] brutal-border p-2 overflow-x-auto">
                <span className="font-label-caps text-xs text-[#a09e9e] px-2 uppercase font-bold shrink-0">
                  FILTRAR DIVISIÓN:
                </span>
                <button
                  onClick={() => setSelectedDivisionFilter('ALL')}
                  className={`px-3 py-1.5 text-xs font-label-caps uppercase font-bold transition-all shrink-0 cursor-pointer ${
                    selectedDivisionFilter === 'ALL'
                      ? 'bg-[#e61c24] text-white shadow-md'
                      : 'bg-[#222] text-[#888] hover:text-white'
                  }`}
                >
                  🌟 TODAS LAS CATEGORÍAS ({activeSeason.divisions.length})
                </button>
                {activeSeason.divisions.map((div) => {
                  const isSelected = selectedDivisionFilter === div.divisionId;
                  return (
                    <button
                      key={div.divisionId}
                      onClick={() => setSelectedDivisionFilter(div.divisionId)}
                      className={`px-3 py-1.5 text-xs font-label-caps uppercase font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-white text-black shadow-md'
                          : 'bg-[#222] text-[#888] hover:text-white'
                      }`}
                    >
                      <span 
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: div.divisionColor }}
                      />
                      <span>{div.divisionLabel} ({div.fighters.length})</span>
                    </button>
                  );
                })}
              </div>

              {/* Division Tables Loop */}
              <div className="flex flex-col gap-8">
                {activeSeason.divisions
                  .filter(div => selectedDivisionFilter === 'ALL' || selectedDivisionFilter === div.divisionId)
                  .map((div) => {
                    const champ = div.champion || div.fighters[0];

                    return (
                      <div key={div.divisionId} className="bg-[#1c1b1b] brutal-border shadow-2xl overflow-hidden">
                        
                        {/* Division Header Banner */}
                        <div 
                          className="p-4 bg-[#141414] border-b-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                          style={{ borderColor: div.divisionColor }}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-xs flex items-center justify-center text-black font-headline-lg text-lg font-bold shadow-md"
                              style={{ backgroundColor: div.divisionColor }}
                            >
                              🏆
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-headline-sm text-2xl text-white uppercase m-0 leading-none">
                                  {div.divisionLabel}
                                </h3>
                                <span className="font-label-caps text-[10px] text-white px-2 py-0.2 font-bold bg-[#333]">
                                  {div.divisionHeightRange}
                                </span>
                              </div>
                              <span className="font-label-caps text-xs text-[#a09e9e] mt-0.5 block">
                                TOTAL: {div.fighters.length} PELEADORES · {div.totalPoints} PUNTOS ACUMULADOS
                              </span>
                            </div>
                          </div>

                          {champ && (
                            <div className="flex items-center gap-2.5 bg-[#0a0a0a] px-3 py-1.5 border border-[#333] rounded-xs">
                              {champ.clubLogoUrl && (
                                <img
                                  src={champ.clubLogoUrl}
                                  alt={champ.clubName || 'Club'}
                                  className="w-7 h-7 object-contain"
                                  referrerPolicy="no-referrer"
                                />
                              )}
                              <div>
                                <span className="font-label-caps text-[9px] text-amber-400 font-bold block uppercase leading-none">
                                  👑 CAMPEÓN OFICIAL:
                                </span>
                                <span className="font-headline-sm text-base text-white uppercase leading-tight">
                                  {champ.name}
                                </span>
                              </div>
                              <span className="font-headline-sm text-base text-amber-400 bg-amber-950/60 px-2 py-0.5 border border-amber-600/50 rounded-xs">
                                {champ.points ?? 0} PTS
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Division Table Headers */}
                        <div className="p-3 bg-[#181717] border-b border-[#2a2a2a] grid grid-cols-12 font-label-caps text-[11px] text-[#767575] uppercase font-bold items-center">
                          <div className="col-span-2 sm:col-span-1 text-center">POS</div>
                          <div className="col-span-5 sm:col-span-4">PELEADOR / CLUB ASIGNADO</div>
                          <div className="hidden sm:block sm:col-span-3 text-center">ESTATURA & ESTILO</div>
                          <div className="col-span-2 sm:col-span-2 text-center">RÉCORD & RACHA</div>
                          <div className="col-span-3 sm:col-span-2 text-center text-amber-400 font-bold">
                            PUNTOS FINALES
                          </div>
                        </div>

                        {/* Fighters List (Strict Read-Only) */}
                        <div className="divide-y divide-[#2a2a2a]">
                          {div.fighters.map((fighter, index) => {
                            const isChamp = index === 0;

                            return (
                              <div
                                key={fighter.id}
                                className={`p-3.5 sm:p-4 grid grid-cols-12 items-center hover:bg-[#201f1f] transition-all gap-1 sm:gap-2 ${
                                  isChamp ? 'bg-[#22181a] border-l-4 border-l-amber-400' : ''
                                }`}
                              >
                                {/* Position */}
                                <div className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1">
                                  <div className={`font-headline-sm text-xl sm:text-2xl flex items-center gap-1 ${
                                    isChamp ? 'text-amber-400 font-bold' : index === 1 ? 'text-[#e61c24] font-bold' : 'text-white'
                                  }`}>
                                    {isChamp && <Award className="w-4 h-4 text-amber-400" />}
                                    <span>#{index + 1}</span>
                                  </div>
                                </div>

                                {/* Fighter & Club */}
                                <div className="col-span-5 sm:col-span-4 flex items-center gap-2.5">
                                  <div 
                                    className="w-10 h-10 sm:w-11 sm:h-11 bg-[#0a0a0a] rounded-sm p-1 border flex items-center justify-center shrink-0 shadow-md"
                                    style={{ borderColor: fighter.clubColor || '#e61c24' }}
                                    title={`Club: ${fighter.clubName || 'Gakuran'}`}
                                  >
                                    {fighter.clubLogoUrl ? (
                                      <img
                                        src={fighter.clubLogoUrl}
                                        alt={fighter.clubName || 'Club'}
                                        className="w-full h-full object-contain filter drop-shadow"
                                        referrerPolicy="no-referrer"
                                      />
                                    ) : (
                                      <Shield className="w-5 h-5 text-[#888]" />
                                    )}
                                  </div>

                                  <div className="truncate">
                                    <div className="flex items-center gap-1 flex-wrap">
                                      <span className="font-headline-sm text-base sm:text-lg text-[#e5e2e1] uppercase leading-tight truncate">
                                        {fighter.name}
                                      </span>
                                    </div>
                                    
                                    {fighter.nickname && (
                                      <span className="font-label-caps text-[9px] text-[#ffb4ac] font-bold block truncate">
                                        "{fighter.nickname}"
                                      </span>
                                    )}

                                    {fighter.clubName && (
                                      <div className="flex items-center gap-1 mt-0.5">
                                        <span 
                                          className="font-label-caps text-[8px] font-bold px-1.5 py-0.2 border uppercase rounded-xs"
                                          style={{ 
                                            color: fighter.clubColor || '#e61c24',
                                            borderColor: `${fighter.clubColor || '#e61c24'}55`,
                                            backgroundColor: `${fighter.clubColor || '#e61c24'}15`
                                          }}
                                        >
                                          {fighter.clubName}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Height & Style */}
                                <div className="hidden sm:flex sm:col-span-3 flex-col items-center justify-center font-label-caps text-xs">
                                  <span className="text-white font-bold">{fighter.height}</span>
                                  <span className="text-[10px] text-[#a09e9e] truncate max-w-[150px]">
                                    {fighter.fightingStyle || 'GAKURAN COMBAT'}
                                  </span>
                                </div>

                                {/* Record & Streak */}
                                <div className="col-span-2 sm:col-span-2 flex flex-col items-center justify-center font-label-caps text-xs">
                                  <span className="text-white font-bold">{fighter.record}</span>
                                  <span className={`px-1.5 py-0.2 text-[9px] font-bold mt-0.5 brutal-border ${
                                    fighter.streak.startsWith('W') ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' : 'bg-red-950/80 text-red-300 border-red-800'
                                  }`}>
                                    {fighter.streak}
                                  </span>
                                </div>

                                {/* Final Total Points Display (Read-Only) */}
                                <div className="col-span-3 sm:col-span-2 flex items-center justify-center">
                                  <div className="bg-[#0a0a0a] px-3.5 py-1.5 border-2 border-amber-500/60 rounded-xs flex items-center gap-1.5 shadow-md">
                                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                                    <span className="font-headline-sm text-lg sm:text-xl text-amber-400 font-bold leading-none">
                                      {fighter.points ?? 0}
                                    </span>
                                    <span className="text-[9px] text-amber-500 font-label-caps font-bold">
                                      PTS
                                    </span>
                                  </div>
                                </div>

                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
