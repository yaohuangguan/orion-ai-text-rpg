import { AuthResponse, User } from '../types';

const API_URL = 'https://bananaboom-api-242273127238.asia-east1.run.app/api/users';

export const authService = {
  async register(data: { displayName: string; email: string; password: string; passwordConf: string; phone?: string }) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
        // Handle specific error array format from backend
        if (result.errors && Array.isArray(result.errors)) {
            throw new Error(result.errors.map((e: any) => e.msg).join(', '));
        }
        throw new Error(result.message_cn || result.message || 'Registration failed');
    }

    return result as AuthResponse;
  },

  async login(data: { email: string; password: string }) {
    const response = await fetch(`${API_URL}/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.errors && Array.isArray(result.errors)) {
          throw new Error(result.errors.map((e: any) => e.msg).join(', '));
      }
      throw new Error(result.message_cn || result.message || 'Login failed');
    }

    return result as AuthResponse;
  },

  logout() {
    localStorage.removeItem('rpg_token');
    localStorage.removeItem('rpg_user');
  },

  saveSession(response: AuthResponse) {
    localStorage.setItem('rpg_token', response.token);
    localStorage.setItem('rpg_user', JSON.stringify(response.user));
  },

  getUser(): User | null {
    const u = localStorage.getItem('rpg_user');
    return u ? JSON.parse(u) : null;
  },

  getToken(): string | null {
    return localStorage.getItem('rpg_token');
  }
};
