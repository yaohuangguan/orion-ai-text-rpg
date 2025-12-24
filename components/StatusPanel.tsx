import React from 'react';
import { Heart, Wallet, MapPin, Target, CheckCircle, XCircle } from 'lucide-react';
import { GameState, Language } from '../types';
import { translations } from '../utils/translations';
import { ThemeStyles } from '../utils/theme';

interface StatusPanelProps {
  state: GameState;
  lang: Language;
  styles: ThemeStyles;
}

const StatusPanel: React.FC<StatusPanelProps> = ({ state, lang, styles }) => {
  const t = translations[lang];

  return (
    <div className={`flex flex-col gap-4 p-4 border-b ${styles.accentBorder}/50 bg-black/40 backdrop-blur-sm lg:border-b-0 lg:border-r lg:w-72 lg:h-full lg:sticky lg:top-0 overflow-y-auto scrollbar-hide`}>
      <div className={`${styles.accent} ${styles.fontHead} text-xs tracking-widest uppercase mb-2 opacity-70`}>
        Status // {t.statusTitle}
      </div>

      {/* HP Bar */}
      <div className="group">
        <div className="flex items-center justify-between text-pink-500 mb-1">
          <div className="flex items-center gap-2">
            <Heart size={16} className="fill-current" />
            <span className="font-bold text-sm">{t.hp}</span>
          </div>
          <span className={`${styles.fontHead} text-lg`}>{state.hp}/{state.maxHp}</span>
        </div>
        <div className="h-2 w-full bg-pink-900/30 rounded-full overflow-hidden border border-pink-900/50">
          <div 
            className="h-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)] transition-all duration-500 ease-out"
            style={{ width: `${Math.max(0, Math.min(100, (state.hp / state.maxHp) * 100))}%` }}
          />
        </div>
      </div>

      {/* Money */}
      <div className={`flex items-center justify-between ${styles.textMuted} border ${styles.accentBorder}/30 p-2 rounded bg-white/5`}>
        <div className="flex items-center gap-2">
          <Wallet size={16} />
          <span className="font-bold text-sm">{t.money}</span>
        </div>
        <span className={`${styles.fontHead} text-lg ${styles.accent}`}>{state.money} G</span>
      </div>

      {/* Location */}
      <div className={`flex flex-col gap-1 ${styles.textMuted} border ${styles.accentBorder}/30 p-2 rounded bg-white/5`}>
        <div className="flex items-center gap-2 opacity-80">
          <MapPin size={16} />
          <span className="font-bold text-xs">{t.location}</span>
        </div>
        <span className={`text-sm font-medium truncate ${styles.accent}`}>{state.location}</span>
      </div>

      {/* Quest Log */}
      <div className={`mt-4 border-t ${styles.accentBorder}/30 pt-4`}>
        <div className={`${styles.accent} ${styles.fontHead} text-xs tracking-widest uppercase mb-3 opacity-70 flex items-center gap-2`}>
           <Target size={14} /> {t.missionTitle}
        </div>
        
        <div className="space-y-3">
          {state.quests.length === 0 ? (
             <div className="text-xs text-gray-600 text-center italic py-2">{t.noMissions}</div>
          ) : (
            state.quests.map(quest => (
              <div key={quest.id} className={`p-3 rounded border ${quest.status === 'completed' ? 'border-green-900/50 bg-green-900/10' : `${styles.accentBorder}/30 bg-white/5`}`}>
                <div className="flex items-start justify-between mb-1">
                  <span className={`text-sm font-bold ${quest.status === 'completed' ? 'text-green-400 line-through opacity-70' : 'text-gray-200'}`}>
                    {quest.title}
                  </span>
                  {quest.status === 'completed' && <CheckCircle size={14} className="text-green-500" />}
                  {quest.status === 'failed' && <XCircle size={14} className="text-red-500" />}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{quest.description}</p>
                <div className={`text-[10px] mt-2 uppercase tracking-wider ${styles.fontHead} ${
                   quest.status === 'active' ? `${styles.accent} animate-pulse` : 'text-gray-600'
                }`}>
                  {quest.status}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusPanel;
