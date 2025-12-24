import React, { useState, useEffect, useRef } from 'react';
import { initializeGame, sendPlayerAction } from './services/geminiService';
import { GameState, ChatMessage, GameResponse, VisualEffectType, GameConfig, Language, User, SaveData } from './types';
import StatusPanel from './components/StatusPanel';
import InventoryPanel from './components/InventoryPanel';
import InputArea from './components/InputArea';
import CombatPanel from './components/CombatPanel';
import SetupScreen from './components/SetupScreen';
import TypewriterText from './components/TypewriterText';
import AuthModal from './components/AuthModal';
import SceneVisualizer from './components/SceneVisualizer';
import { Terminal, RefreshCw, Volume2, VolumeX, ShieldAlert, User as UserIcon, LogOut, Battery, Save, Disc } from 'lucide-react';
import { audio } from './services/audioEngine';
import { translations } from './utils/translations';
import { authService } from './services/authService';
import { getThemeStyles } from './utils/theme';

const INITIAL_STATE: GameState = {
  hp: 100,
  maxHp: 100,
  money: 0,
  inventory: [],
  location: 'Initializing...',
  quests: [],
  inCombat: false,
  enemies: [],
  abilities: []
};

const MAX_FREE_ACTIONS = 5;

const App: React.FC = () => {
  // Game State
  const [gameStarted, setGameStarted] = useState(false);
  const [language, setLanguage] = useState<Language>('zh');
  const [theme, setTheme] = useState('cyberpunk'); // Track active theme for visualizer
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentChoices, setCurrentChoices] = useState<string[]>([]);
  const [visualEffect, setVisualEffect] = useState<VisualEffectType>('none');
  const [isMuted, setIsMuted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [actionCount, setActionCount] = useState(0);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = translations[language];
  
  // Get dynamic styles based on theme
  const styles = getThemeStyles(theme);

  // Load User on Mount
  useEffect(() => {
    const savedUser = authService.getUser();
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  // Sync Audio Mood
  useEffect(() => {
    if (!gameStarted) return;
    if (gameState.inCombat) {
      audio.setMood('combat');
    } else {
      audio.setMood('exploration');
    }
  }, [gameState.inCombat, gameStarted]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isTyping, gameState.inCombat]);

  // Clear visual effects
  useEffect(() => {
    if (visualEffect !== 'none' && visualEffect !== 'scan_line') {
      const timer = setTimeout(() => setVisualEffect('none'), 800);
      return () => clearTimeout(timer);
    }
  }, [visualEffect]);

  const handleStartGame = async (config: GameConfig) => {
    setLanguage(config.language);
    setTheme(config.theme); // Set theme state
    setGameStarted(true);
    setLoading(true);
    setError(null);
    setHistory([]);
    setGameState(INITIAL_STATE);
    setActionCount(0); // Reset action count per game
    
    try {
      const response = await initializeGame(config);
      handleAIResponse(response);
      audio.init(); // Init audio on start click
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the Neural Network. Check your API Key or connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadGame = (data: SaveData) => {
    setLanguage(data.language);
    setTheme(data.theme);
    setGameStarted(true);
    setGameState(data.state);
    setHistory(data.history);
    setActionCount(0); 
    audio.init();
  };

  const handleSaveGame = () => {
    const saveData: SaveData = {
      state: gameState,
      history: history,
      theme: theme,
      language: language,
      timestamp: Date.now()
    };
    localStorage.setItem('rpg_save_slot_1', JSON.stringify(saveData));
    setSavedMessage(t.saveSuccess);
    setTimeout(() => setSavedMessage(null), 2000);
  };

  const restartGame = () => {
    setGameStarted(false);
    setHistory([]);
    setGameState(INITIAL_STATE);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  const handleAIResponse = (response: GameResponse) => {
    setGameState(response.state);
    
    if (response.visualEffect && response.visualEffect !== 'none') {
      setVisualEffect(response.visualEffect);
    }

    if (response.audioCue && response.audioCue !== 'none') {
      setTimeout(() => {
        if (response.audioCue === 'combat_start') { /* handled by state */ }
        else if (response.audioCue === 'item_pickup') audio.playSFX('pickup');
        else if (response.audioCue === 'damage') audio.playSFX('damage');
        else if (response.audioCue === 'quest_update') audio.playSFX('success');
      }, 200);
    }

    const newMessage: ChatMessage = {
      role: 'model',
      text: response.narrative,
      combatLog: response.combatLog,
      parsedResponse: response,
      timestamp: Date.now(),
      textStyle: response.textStyle
    };

    setHistory(prev => [...prev, newMessage]);
    setCurrentChoices(response.choices || []);
    setIsTyping(true);
  };

  const handleUserAction = async (action: string) => {
    // 1. Check Limits
    if (!user && actionCount >= MAX_FREE_ACTIONS) {
      setHistory(prev => [...prev, {
        role: 'model',
        text: t.limitReachedDesc,
        timestamp: Date.now()
      }]);
      setShowAuthModal(true);
      return;
    }

    audio.init();
    audio.playSFX('click');
    
    // Increment Action Count
    setActionCount(prev => prev + 1);

    const userMsg: ChatMessage = {
      role: 'user',
      text: action,
      timestamp: Date.now()
    };
    setHistory(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await sendPlayerAction(action);
      handleAIResponse(response);
    } catch (err) {
      console.error(err);
      setHistory(prev => [...prev, {
        role: 'model',
        text: "System Error: Connection interrupted. Retrying packet...",
        timestamp: Date.now()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMute = () => {
    const muted = audio.toggleMute();
    setIsMuted(muted);
  };

  const getContainerClass = () => {
    let base = `min-h-screen bg-[#050505] text-gray-200 flex flex-col overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-cyan-100 transition-colors duration-300 ${styles.fontBody} `;
    if (visualEffect === 'shake_small') base += "vfx-shake-small ";
    if (visualEffect === 'shake_heavy') base += "vfx-shake-heavy ";
    if (visualEffect === 'flash_red') base += "vfx-flash-red ";
    if (visualEffect === 'flash_white') base += "vfx-flash-white ";
    if (visualEffect === 'glitch') base += "vfx-glitch ";
    if (visualEffect === 'target_flash') base += "vfx-target-flash ";
    if (visualEffect === 'scan_line') base += "vfx-scan-line ";
    return base;
  };

  if (!gameStarted) {
    return (
      <>
        <SetupScreen 
          onStart={handleStartGame} 
          onLoadGame={handleLoadGame}
          user={user}
          onOpenAuth={() => setShowAuthModal(true)}
          onLogout={handleLogout}
          // SetupScreen now manages its own theme preview, or we can pass the initial one.
        />
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            const u = authService.getUser();
            setUser(u);
          }}
          lang={language}
        />
      </>
    );
  }

  return (
    <div className={getContainerClass()}>
      
      {/* Scanline Overlay (Only for Cyberpunk) */}
      {styles.scanline && <div className="scanline"></div>}

      {/* Dynamic Background */}
      <SceneVisualizer theme={theme} inCombat={gameState.inCombat} />

      <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            const u = authService.getUser();
            setUser(u);
          }}
          lang={language}
        />
      
      {/* Save Success Message */}
      {savedMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500/20 border border-green-500 text-green-300 px-4 py-2 rounded shadow-[0_0_20px_rgba(34,197,94,0.4)] animate-in fade-in zoom-in duration-300">
           {savedMessage}
        </div>
      )}

      {/* Header */}
      <header className={`h-14 border-b ${styles.accentBorder}/50 flex items-center justify-between px-6 bg-black/80 backdrop-blur-md sticky top-0 z-20 shadow-md`}>
        <div className="flex items-center gap-3">
          <div className={`p-1.5 ${styles.accentBg}/10 rounded border ${styles.accentBorder}/30`}>
            <Terminal size={20} className={styles.accent} />
          </div>
          <div className="flex flex-col">
            <h1 className={`text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400 ${styles.fontHead} leading-none`}>
              {t.gameTitle}
            </h1>
            {/* Action Counter for Guests */}
            {!user && (
              <div className="flex items-center gap-1 text-[10px] text-yellow-500 mt-1">
                <Battery size={10} />
                <span>{t.auth.actionCount}: {MAX_FREE_ACTIONS - actionCount}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
           {/* Save Button */}
           <button 
             onClick={handleSaveGame}
             className="hidden sm:flex items-center gap-2 px-3 py-1 bg-zinc-800/50 hover:bg-zinc-700/80 border border-zinc-700 rounded text-xs text-gray-300 transition-colors"
           >
             <Save size={14} />
             {t.saveBtn}
           </button>

           {/* User Status in Header */}
           {user ? (
             <div className={`hidden sm:flex items-center gap-2 text-xs ${styles.accent} border ${styles.accentBorder}/50 px-2 py-1 rounded bg-black/30`}>
               <UserIcon size={12} />
               <span>{user.displayName}</span>
             </div>
           ) : (
             <button onClick={() => setShowAuthModal(true)} className={`text-xs ${styles.button} px-3 py-1 rounded text-white font-bold transition-colors`}>
               {t.loginBtn}
             </button>
           )}

           <button 
            onClick={toggleMute}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          
          {user && (
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-red-400"
              title={t.logoutBtn}
            >
              <LogOut size={18} />
            </button>
          )}

          <button 
            onClick={restartGame}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
            title="Back to Menu"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10 transition-all duration-500">
        
        {/* Left: Status Panel */}
        <div className={`transition-all duration-500 ${gameState.inCombat ? 'lg:w-64 opacity-80 hover:opacity-100' : 'lg:w-72'}`}>
          <StatusPanel state={gameState} lang={language} styles={styles} />
        </div>

        {/* Center: Story Feed */}
        <div className={`flex-1 flex flex-col relative overflow-hidden ${styles.backgroundGradient}`}>
          
          {/* Scrollable Story Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 scrollbar-hide scroll-smooth">
            
            {history.length === 0 && !loading && !error && (
               <div className="text-center text-gray-500 py-20 italic">
                 {t.waiting}
               </div>
            )}

            {history.map((msg, idx) => (
              <div 
                key={msg.timestamp + idx} 
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}
              >
                <div 
                  className={`
                    max-w-[90%] lg:max-w-[85%] rounded-sm p-4 sm:p-5 relative
                    ${msg.role === 'user' 
                      ? 'bg-zinc-800/80 border border-zinc-700 text-gray-100 shadow-lg backdrop-blur-sm' 
                      : `${styles.panelBg} border-l-2 ${styles.accentBorder} pl-6 shadow-md backdrop-blur-md`
                    }
                  `}
                >
                  <div className={`text-[10px] ${styles.fontHead} uppercase mb-2 tracking-widest ${msg.role === 'user' ? 'text-zinc-400 text-right' : styles.accent}`}>
                    {msg.role === 'user' ? t.you : t.system}
                  </div>

                  {msg.role === 'user' ? (
                    <div className="text-base">{msg.text}</div>
                  ) : (
                     <>
                       {/* Main Narrative with Style support */}
                       {(idx === history.length - 1 && isTyping) ? (
                          <TypewriterText 
                            text={msg.text} 
                            speed={5} 
                            onComplete={() => setIsTyping(false)}
                            style={msg.textStyle} 
                          />
                       ) : (
                          <TypewriterText 
                            text={msg.text} 
                            speed={0} 
                            style={msg.textStyle} 
                          />
                       )}

                       {/* Combat Log Display */}
                       {msg.combatLog && msg.combatLog.length > 0 && (
                         <div className="mt-4 p-3 bg-red-950/40 border-l-2 border-red-500/50 text-xs space-y-1 animate-in slide-in-from-left duration-300 font-mono">
                           {msg.combatLog.map((log, i) => (
                             <div key={i} className="flex items-center gap-2 text-red-200/80">
                               <ShieldAlert size={12} className="text-red-500" />
                               {log}
                             </div>
                           ))}
                         </div>
                       )}
                     </>
                  )}
                </div>
              </div>
            ))}

            {error && (
              <div className="p-4 border border-red-900/50 bg-red-900/10 text-red-400 text-center rounded">
                {error}
              </div>
            )}

            {/* Limit Reached Warning in Chat */}
            {!user && actionCount >= MAX_FREE_ACTIONS && (
              <div className="mx-auto max-w-md p-4 mt-4 bg-yellow-900/20 border border-yellow-600/50 rounded text-center animate-pulse">
                <div className="text-yellow-500 font-bold mb-2 flex items-center justify-center gap-2">
                  <Battery size={20} />
                  {t.limitReachedTitle}
                </div>
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded transition-colors text-sm"
                >
                  {t.loginBtn}
                </button>
              </div>
            )}
            
            <div className="h-4"></div>
          </div>

          {/* Bottom Interaction Area */}
          <div className={`
             p-4 bg-gradient-to-t from-black via-black/95 to-transparent backdrop-blur-sm border-t border-white/5 flex flex-col gap-4
             ${gameState.inCombat ? 'border-t-red-900/30' : ''}
          `}>
             {/* Combat Overlay Panel */}
             {gameState.inCombat && <CombatPanel enemies={gameState.enemies} lang={language} styles={styles} />}

             <InputArea 
               onSend={handleUserAction} 
               choices={currentChoices}
               disabled={loading || isTyping || (!user && actionCount >= MAX_FREE_ACTIONS)}
               isThinking={loading}
               lang={language}
               styles={styles}
             />
          </div>
        </div>

        {/* Right: Inventory Panel */}
        <div className={`transition-all duration-500 ${gameState.inCombat ? 'hidden lg:block lg:w-48 opacity-60' : 'lg:w-64'}`}>
           <InventoryPanel items={gameState.inventory} lang={language} styles={styles} />
        </div>

      </main>
    </div>
  );
};

export default App;
