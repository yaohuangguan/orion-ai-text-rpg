import { GameResponse, GameConfig } from '../types';
import { authService } from './authService';

const API_BASE_URL = 'https://bananaboom-api-242273127238.asia-east1.run.app/api/rpg';

/**
 * Initialize a new RPG game by calling the backend.
 * Requires authentication.
 */
export const initializeGame = async (config: GameConfig): Promise<GameResponse> => {
  const token = authService.getToken();
  if (!token) throw new Error("Authentication required to start the game.");

  try {
    const response = await fetch(`${API_BASE_URL}/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({ config })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.msg || "Failed to initialize game session.");
    }

    return result.data as GameResponse;
  } catch (error) {
    console.error("Failed to initialize game:", error);
    throw error;
  }
};

/**
 * Send a player action to the backend.
 * Now requires config and history to maintain state on the backend.
 */
export const sendPlayerAction = async (
  action: string, 
  config: GameConfig, 
  history: any[] = []
): Promise<GameResponse> => {
  const token = authService.getToken();
  if (!token) throw new Error("Authentication required to perform actions.");

  try {
    const response = await fetch(`${API_BASE_URL}/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({ 
        action, 
        config, 
        history 
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.msg || "Failed to process player action.");
    }

    return result.data as GameResponse;
  } catch (error) {
    console.error("Failed to process turn:", error);
    throw error;
  }
};