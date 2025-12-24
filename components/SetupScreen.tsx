import React, { useState, useEffect } from 'react';
import { GameConfig, Language, User, SaveData } from '../types';
import { translations } from '../utils/translations';
import { Terminal, Globe, ChevronRight, User as UserIcon, Unlock, Lock, Disc, Sword } from 'lucide-react';
import { getThemeStyles } from '../utils/theme';

interface SetupScreenProps {
  onStart: (config: GameConfig) => void;
  onLoadGame: (data: SaveData) => void;
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart, onLoadGame, user, onOpenAuth, onLogout }) => {
  const [lang, setLang] = useState<Language>('zh');
  const [theme, setTheme] = useState('cyberpunk');
  const [customTheme, setCustomTheme] = useState('');
  const [charType, setCharType] = useState('mercenary');
  const [customChar, setCustomChar] = useState('');
  const [hasSave, setHasSave] = useState(false);

  const t = translations[lang];
  const styles = getThemeStyles(theme);

  useEffect(() => {
    const save = localStorage.getItem('rpg_save_slot_1');
    if (save) {
      setHasSave(true);
    }
  }, []);

  const handleStart = () => {
    onStart({
      language: lang,
      theme: theme === 'custom' ? customTheme || 'Cyberpunk' : t.themes[theme as keyof typeof t.themes].split(' (')[0], // Extract clean name
      characterType: charType === 'custom' ? customChar || 'Survivor' : t.chars[charType as keyof typeof t.chars].split(' /')[0],
    });
  };

  const handleLoad = () => {
    const save = localStorage.getItem('rpg_save_slot_1');
    if (save) {
      try {
        const data = JSON.parse(save) as SaveData;
        onLoadGame(data);
      } catch (e) {
        console.error("Save file corrupted");
      }
    }
  };

  return (
    <div className={`min-h-screen bg-[#050505] text-gray-200 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans ${styles.fontBody}`}>
      {/* Dynamic Background Grid/Overlay */}
      {styles.scanline && (
         <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      )}
      {!styles.scanline && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-black to-black"></div>
      )}
      
      {/* User Status Top Right */}
      <div className="absolute top-4 right-4 z-20">
        {user ? (
          <div className="flex items-center gap-3 bg-zinc-900/80 border border-green-900/50 p-2 px-4 rounded-full">
            <div className={`flex items-center gap-2 text-green-400 text-sm ${styles.fontHead}`}>
              <UserIcon size={14} />
              <span>{user.displayName}</span>
            </div>
            <button onClick={onLogout} className="text-xs text-gray-500 hover:text-white ml-2">
              {t.logoutBtn}
            </button>
          </div>
        ) : (
          <button 
            onClick={onOpenAuth}
            className={`flex items-center gap-2 bg-black/40 hover:bg-white/5 border ${styles.accentBorder}/30 ${styles.accent} px-4 py-2 rounded-full text-xs font-bold transition-all shadow-md`}
          >
            <Unlock size={14} />
            {t.loginBtn}
          </button>
        )}
      </div>

      <div className={`relative z-10 w-full max-w-md ${styles.panelBg} backdrop-blur-md border ${styles.accentBorder}/50 p-8 rounded-lg shadow-2xl animate-in fade-in zoom-in duration-500`}>
        
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className={`p-2 bg-white/5 rounded border ${styles.accentBorder}/30`}>
            {theme === 'medieval' ? <Sword size={32} className={styles.accent} /> : <Terminal size={32} className={styles.accent} />}
          </div>
          <h1 className={`text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400 ${styles.fontHead}`}>
            {t.gameTitle}
          </h1>
        </div>

        <p className={`${styles.textMuted} text-center mb-6 text-sm leading-relaxed`}>
          {t.intro}
        </p>

        {/* Warning for Guests */}
        {!user && (
          <div className="mb-6 p-3 bg-yellow-900/10 border border-yellow-700/30 rounded text-center">
            <p className="text-xs text-yellow-500 flex items-center justify-center gap-2">
              <Lock size={12} />
              {t.guestWarning}
            </p>
          </div>
        )}

        <div className="space-y-6">
          {/* Language Selection */}
          <div className="space-y-2">
             <label className={`flex items-center gap-2 text-xs ${styles.fontHead} uppercase tracking-widest ${styles.accent}`}>
               <Globe size={14} /> {t.selectLang}
             </label>
             <div className="flex bg-zinc-900/50 p-1 rounded border border-zinc-800">
               <button 
                 onClick={() => setLang('en')}
                 className={`flex-1 py-2 text-sm rounded transition-colors ${lang === 'en' ? `${styles.accentBg}/20 ${styles.accent} shadow` : 'text-gray-500 hover:text-gray-300'}`}
               >
                 English
               </button>
               <button 
                 onClick={() => setLang('zh')}
                 className={`flex-1 py-2 text-sm rounded transition-colors ${lang === 'zh' ? `${styles.accentBg}/20 ${styles.accent} shadow` : 'text-gray-500 hover:text-gray-300'}`}
               >
                 中文
               </button>
             </div>
          </div>

          {/* Theme Selection */}
          <div className="space-y-2">
            <label className={`text-xs ${styles.fontHead} uppercase tracking-widest ${styles.accent}`}>
              {t.themeLabel}
            </label>
            <select 
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className={`w-full bg-zinc-900/80 border border-zinc-700 rounded px-3 py-2 text-gray-200 focus:${styles.accentBorder} focus:outline-none`}
            >
              <option value="cyberpunk">{t.themes.cyberpunk}</option>
              <option value="medieval">{t.themes.medieval}</option>
              <option value="fantasy">{t.themes.fantasy}</option>
              <option value="apocalypse">{t.themes.apocalypse}</option>
              <option value="custom">{t.themes.custom}</option>
            </select>
            {theme === 'custom' && (
              <input 
                type="text" 
                value={customTheme}
                onChange={(e) => setCustomTheme(e.target.value)}
                placeholder={t.customPlaceholder}
                className={`w-full bg-zinc-900/50 border border-zinc-800 rounded px-3 py-2 text-sm ${styles.accent} focus:${styles.accentBorder} focus:outline-none`}
              />
            )}
          </div>

          {/* Character Selection */}
          <div className="space-y-2">
            <label className={`text-xs ${styles.fontHead} uppercase tracking-widest ${styles.accent}`}>
              {t.charLabel}
            </label>
            <select 
              value={charType}
              onChange={(e) => setCharType(e.target.value)}
              className={`w-full bg-zinc-900/80 border border-zinc-700 rounded px-3 py-2 text-gray-200 focus:${styles.accentBorder} focus:outline-none`}
            >
              <option value="mercenary">{t.chars.mercenary}</option>
              <option value="hacker">{t.chars.hacker}</option>
              <option value="survivor">{t.chars.survivor}</option>
              <option value="custom">{t.chars.custom}</option>
            </select>
            {charType === 'custom' && (
              <input 
                type="text" 
                value={customChar}
                onChange={(e) => setCustomChar(e.target.value)}
                placeholder={t.customPlaceholder}
                className={`w-full bg-zinc-900/50 border border-zinc-800 rounded px-3 py-2 text-sm ${styles.accent} focus:${styles.accentBorder} focus:outline-none`}
              />
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-8">
            {hasSave && (
              <button 
                onClick={handleLoad}
                className="bg-zinc-800 hover:bg-zinc-700 text-gray-300 font-bold py-3 px-6 rounded border border-zinc-600 flex items-center justify-center gap-2 transition-all"
              >
                <Disc size={18} />
                {t.loadBtn}
              </button>
            )}
            <button 
              onClick={handleStart}
              className={`${hasSave ? 'col-span-1' : 'col-span-2'} ${styles.button} text-white font-bold py-3 px-6 rounded shadow-lg transition-all flex items-center justify-center gap-2 group`}
            >
              {t.startBtn}
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;
