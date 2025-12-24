import React from 'react';
import { Package, Shield, Zap, Box } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';
import { ThemeStyles } from '../utils/theme';

interface InventoryPanelProps {
  items: string[];
  lang: Language;
  styles: ThemeStyles;
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({ items, lang, styles }) => {
  const t = translations[lang];

  // Simple helper to guess icon based on name
  const getIcon = (name: string) => {
    if (name.includes('剑') || name.includes('刀') || name.includes('Gun') || name.includes('Weapon') || name.includes('Sword')) return <Zap size={18} />;
    if (name.includes('甲') || name.includes('衣') || name.includes('Suit') || name.includes('Armor')) return <Shield size={18} />;
    if (name.includes('药') || name.includes('Med') || name.includes('Potion')) return <Package size={18} />;
    return <Box size={18} />;
  };

  return (
    <div className={`flex flex-col gap-2 p-4 border-t ${styles.accentBorder}/50 bg-black/40 lg:border-t-0 lg:border-l lg:w-64 lg:h-full lg:sticky lg:top-0`}>
       <div className={`${styles.accent} ${styles.fontHead} text-xs tracking-widest uppercase mb-2 opacity-70`}>
        Inventory // {t.inventoryTitle}
      </div>
      
      <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[200px] lg:max-h-[calc(100vh-100px)] scrollbar-hide">
        {items.length === 0 ? (
          <div className="col-span-2 text-gray-600 text-xs text-center py-4 border border-dashed border-gray-800 rounded">
            {t.emptyInventory}
          </div>
        ) : (
          items.map((item, idx) => (
            <div 
              key={`${item}-${idx}`} 
              className={`group relative flex flex-col items-center justify-center p-3 bg-white/5 border border-white/10 hover:${styles.accentBorder} rounded transition-all duration-300 hover:shadow-lg`}
            >
              <div className={`${styles.icon} mb-2 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-transform`}>
                {getIcon(item)}
              </div>
              <span className="text-[10px] text-center text-gray-400 group-hover:text-gray-200 leading-tight">
                {item}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InventoryPanel;
