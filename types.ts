export type Language = 'en' | 'zh';

export interface GameConfig {
  language: Language;
  theme: string;
  characterType: string;
}

export interface User {
  id: string;
  displayName: string;
  email: string;
  phone?: string;
  vip: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'failed';
}

export interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  description: string;
}

export interface GameState {
  hp: number;
  maxHp: number;
  money: number;
  inventory: string[];
  location: string;
  quests: Quest[];
  inCombat: boolean;
  enemies: Enemy[];
  abilities: string[];
}

export type VisualEffectType = 'none' | 'glitch' | 'shake_small' | 'shake_heavy' | 'flash_red' | 'flash_white' | 'scan_line' | 'target_flash';
export type AudioCueType = 'none' | 'combat_start' | 'combat_end' | 'item_pickup' | 'damage' | 'quest_update';
export type TextStyleType = 'normal' | 'corrupted' | 'system_log';

export interface GameResponse {
  narrative: string;
  combatLog?: string[];
  state: GameState;
  choices: string[];
  visualEffect: VisualEffectType;
  audioCue: AudioCueType;
  textStyle: TextStyleType;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  combatLog?: string[];
  parsedResponse?: GameResponse;
  timestamp: number;
  textStyle?: TextStyleType;
}

export interface SaveData {
  state: GameState;
  history: ChatMessage[];
  theme: string;
  language: Language;
  timestamp: number;
}