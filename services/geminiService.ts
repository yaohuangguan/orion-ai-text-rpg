import { GoogleGenAI, ChatSession, Type, Schema } from "@google/genai";
import { GameResponse, GameConfig } from '../types';

// The schema must strictly match the GameResponse interface
const gameResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    narrative: {
      type: Type.STRING,
      description: "The main story text.",
    },
    combatLog: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Combat events (e.g. 'Player hit for 15 dmg')."
    },
    state: {
      type: Type.OBJECT,
      properties: {
        hp: { type: Type.INTEGER },
        maxHp: { type: Type.INTEGER },
        money: { type: Type.INTEGER },
        inventory: { type: Type.ARRAY, items: { type: Type.STRING } },
        location: { type: Type.STRING },
        quests: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              status: { type: Type.STRING, enum: ['active', 'completed', 'failed'] }
            }
          }
        },
        inCombat: { type: Type.BOOLEAN },
        enemies: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              hp: { type: Type.INTEGER },
              maxHp: { type: Type.INTEGER },
              description: { type: Type.STRING }
            }
          }
        },
        abilities: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["hp", "maxHp", "money", "inventory", "location", "quests", "inCombat", "enemies", "abilities"]
    },
    choices: { type: Type.ARRAY, items: { type: Type.STRING } },
    visualEffect: {
      type: Type.STRING,
      enum: ['none', 'glitch', 'shake_small', 'shake_heavy', 'flash_red', 'flash_white', 'scan_line', 'target_flash'],
      description: "Screen effect based on context. 'glitch': hacked/reality distortion. 'shake_small': impact/noise. 'shake_heavy': explosion/damage. 'flash_red': danger. 'scan_line': analyzing/digital view. 'target_flash': when locking on or hitting weak point."
    },
    audioCue: {
      type: Type.STRING,
      enum: ['none', 'combat_start', 'combat_end', 'item_pickup', 'damage', 'quest_update'],
    },
    textStyle: {
      type: Type.STRING,
      enum: ['normal', 'corrupted', 'system_log'],
      description: "Style of the narrative text. 'corrupted': glitchy/scary/hacked text. 'system_log': computer readout/status report. 'normal': standard narration."
    }
  },
  required: ["narrative", "state", "choices", "visualEffect", "audioCue", "textStyle"]
};

let chatSession: ChatSession | null = null;
let genAI: GoogleGenAI | null = null;

const getAIClient = () => {
  if (!genAI) {
    genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return genAI;
};

export const initializeGame = async (config: GameConfig): Promise<GameResponse> => {
  const ai = getAIClient();
  
  const langInstruction = config.language === 'zh' 
    ? "Language: Simplified Chinese (简体中文). Response must be in Chinese." 
    : "Language: English. Response must be in English.";

  const themeInstruction = `Theme: ${config.theme}. Player Character: ${config.characterType}. Adjust currency, items, and abilities to match this theme.`;

  chatSession = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are the AI Game Master for an infinite text RPG.
      
      Configuration:
      ${langInstruction}
      ${themeInstruction}

      Visual & Text Style Rules:
      - USE 'visualEffect' heavily to immerse the player.
        - 'glitch': When the system is hacked, unstable, or reality distorts.
        - 'shake_small': Minor impacts, loud noises, surprises.
        - 'shake_heavy': Taking damage, explosions, massive failures.
        - 'scan_line': When using a terminal, analyzing items, or receiving data.
        - 'target_flash': Critical hit or target acquisition.
      - USE 'textStyle' to match the narrative voice.
        - 'corrupted': When the character is hallucinating, the system is crashing, or an eldritch horror speaks.
        - 'system_log': For notifications like [SYSTEM ALERT], [ITEM ACQUIRED], or terminal readouts.
      
      Core Rules:
      1. Speed: Keep narratives punchy, evocative and exciting.
      2. State: Manage HP, Money, Inventory, and Abilities.
      3. Combat: 
         - When combat starts, set 'inCombat' true.
         - Generate enemies appropriate for the theme.
         - Use 'combatLog' for specific damage numbers.
         - If player is hit, use 'visualEffect': 'flash_red' or 'shake_heavy'.
         - Populate 'choices' with relevant abilities during combat.
      4. Quests: Track objectives.
      
      Start State: HP 100/100, Money 100, Inventory [Basic starting item], Location [Starting area], Abilities [Basic Attack, Special Skill], No Combat.
      
      Intro: Start the game by describing the opening scene based on the theme.`,
      responseMimeType: "application/json",
      responseSchema: gameResponseSchema,
      thinkingConfig: {
         thinkingBudget: 0
      }
    },
  });

  try {
    const response = await chatSession.sendMessage({ message: "Start Game" });
    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    return JSON.parse(text) as GameResponse;
  } catch (error) {
    console.error("Failed to initialize game:", error);
    throw error;
  }
};

export const sendPlayerAction = async (action: string): Promise<GameResponse> => {
  if (!chatSession) {
    throw new Error("Game not initialized");
  }

  try {
    const response = await chatSession.sendMessage({ message: action });
    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    return JSON.parse(text) as GameResponse;
  } catch (error) {
    console.error("Failed to process turn:", error);
    throw error;
  }
};