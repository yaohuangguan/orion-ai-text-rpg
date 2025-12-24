import React from 'react';
import { Skull, Crosshair } from 'lucide-react';
import { Enemy, Language } from '../types';
import { translations } from '../utils/translations';
import { ThemeStyles } from '../utils/theme';

interface CombatPanelProps {
  enemies: Enemy[];
  lang: Language;
  styles: ThemeStyles;
}

const CombatPanel: React.FC<CombatPanelProps> = ({ enemies, lang, styles }) => {
  if (!enemies || enemies.length === 0) return null;
  const t = translations[lang];

  return (
    <div className="w-full mb-6 animate-in slide-in-from-top duration-500">
      <div className={`flex items-center gap-2 mb-2 text-red-500 ${styles.fontHead} uppercase tracking-[0.2em] animate-pulse`}>
        <Skull size={18} />
        <span>{t.combatEngaged}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {enemies.map((enemy) => (
          <div key={enemy.id} className="relative bg-red-950/20 border border-red-900/60 p-4 rounded overflow-hidden group hover:border-red-500/50 transition-colors">
            {/* Target Reticle Overlay - Only in Cyberpunk maybe? kept for all as 'target' concept */}
            <div className="absolute top-2 right-2 text-red-800 opacity-20 group-hover:opacity-60 transition-opacity">
                <Crosshair size={24} />
            </div>

            <div className="flex justify-between items-end mb-2">
              <span className="text-red-100 font-bold text-lg">{enemy.name}</span>
              <span className={`text-red-400 ${styles.fontHead} text-sm`}>{enemy.hp}/{enemy.maxHp} {t.hp}</span>
            </div>
            
            {/* Enemy HP Bar */}
            <div className="h-3 w-full bg-red-900/30 rounded-full overflow-hidden border border-red-900/50">
              <div 
                className="h-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.6)] transition-all duration-300"
                style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
              />
            </div>

            {enemy.description && (
                <p className="mt-2 text-xs text-red-300/70 italic">{enemy.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CombatPanel;
