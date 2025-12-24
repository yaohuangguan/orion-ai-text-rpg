import { GoogleGenAI, Chat, Type, Schema } from "@google/genai";
import { GameResponse, GameConfig } from '../types';

// The schema must strictly match the GameResponse interface
const gameResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    narrative: {
      type: Type.STRING,
      description: "The main story text. If the game ends, include the epilogue here.",
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
        abilities: { type: Type.ARRAY, items: { type: Type.STRING } },
        gameStatus: { 
          type: Type.STRING, 
          enum: ['playing', 'victory', 'defeat'],
          description: "Current status. Set to 'victory' or 'defeat' when the story concludes." 
        },
        narrativeProgress: { 
          type: Type.INTEGER,
          description: "An integer from 0 to 100 indicating how close the game is to the ending."
        },
        narrativeLabel: {
          type: Type.STRING,
          description: "The name of the progress bar, e.g., 'Cyberpsychosis', 'Corruption', 'Time Until Detonation', 'Quest Completion'."
        },
        endingSummary: {
          type: Type.STRING,
          description: "If gameStatus is victory/defeat, provide a 1-2 sentence summary of the outcome."
        }
      },
      required: ["hp", "maxHp", "money", "inventory", "location", "quests", "inCombat", "enemies", "abilities", "gameStatus", "narrativeProgress", "narrativeLabel"]
    },
    choices: { type: Type.ARRAY, items: { type: Type.STRING } },
    visualEffect: {
      type: Type.STRING,
      enum: ['none', 'glitch', 'shake_small', 'shake_heavy', 'flash_red', 'flash_white', 'scan_line', 'target_flash'],
      description: "Screen effect based on context."
    },
    audioCue: {
      type: Type.STRING,
      enum: ['none', 'combat_start', 'combat_end', 'item_pickup', 'damage', 'quest_update', 'game_over', 'game_won'],
    },
    textStyle: {
      type: Type.STRING,
      enum: ['normal', 'corrupted', 'system_log'],
      description: "Style of the narrative text."
    }
  },
  required: ["narrative", "state", "choices", "visualEffect", "audioCue", "textStyle"]
};

let chatSession: Chat | null = null;
let genAI: GoogleGenAI | null = null;

const getAIClient = () => {
  if (!genAI) {
    genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAI;
};

export const initializeGame = async (config: GameConfig): Promise<GameResponse> => {
  const ai = getAIClient();
  
  const langInstruction = config.language === 'zh' 
    ? "Language: Simplified Chinese (简体中文). Response must be in Chinese." 
    : "Language: English. Response must be in English.";

  const themeInstruction = `Theme: ${config.theme}. Player Character: ${config.characterType}. Adjust currency, items, abilities, and the 'narrativeLabel' to match this theme.`;

  chatSession = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are the AI Game Master for a TEXT RPG with a DEFINITIVE ENDING.
      
      Configuration:
      ${langInstruction}
      ${themeInstruction}

      IMPORTANT - FINITE GAMEPLAY RULES:
      1. **NO INFINITE LOOPS**: The game must have a clear beginning, middle, and end.
      2. **Narrative Progress**: Manage 'narrativeProgress' from 0 to 100.
         - 0-30: Intro & Rising Action.
         - 30-70: Main Challenges & Combat.
         - 70-90: Climax / Boss Fight.
         - 100: Conclusion.
      3. **Winning & Losing**:
         - **Defeat**: If HP reaches 0, or the player makes a catastrophic choice, set 'gameStatus' to 'defeat'.
         - **Victory**: If the player completes the main objective and progress reaches 100, set 'gameStatus' to 'victory'.
         - **Ending**: When status is 'victory' or 'defeat', provide a final wrap-up in 'narrative' and a summary in 'endingSummary'. Clear 'choices'.

      Visual & Text Style Rules:
      - USE 'visualEffect' heavily to immerse the player.
      - USE 'textStyle' to match the narrative voice.
      
      Start State: HP 100/100, Money 100, Inventory [Basic Item], GameStatus 'playing', Progress 0.
      
      Intro: Start the game by describing the opening scene and the ULTIMATE GOAL.`,
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