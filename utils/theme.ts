export interface ThemeStyles {
  fontHead: string;
  fontBody: string;
  accent: string;
  accentBorder: string;
  accentBg: string;
  panelBg: string;
  button: string;
  icon: string;
  textMuted: string;
  backgroundGradient: string;
  scanline: boolean;
}

export const THEMES: Record<string, ThemeStyles> = {
  cyberpunk: {
    fontHead: 'font-mono-tech',
    fontBody: 'font-sans',
    accent: 'text-cyan-400',
    accentBorder: 'border-cyan-500',
    accentBg: 'bg-cyan-500',
    panelBg: 'bg-black/60',
    button: 'bg-cyan-600 hover:bg-cyan-500',
    icon: 'text-cyan-400',
    textMuted: 'text-gray-400',
    backgroundGradient: 'bg-gradient-to-b from-transparent via-zinc-900/5 to-black/20',
    scanline: true
  },
  medieval: {
    fontHead: 'font-cinzel',
    fontBody: 'font-crimson text-lg',
    accent: 'text-amber-500',
    accentBorder: 'border-amber-700',
    accentBg: 'bg-amber-700',
    panelBg: 'bg-stone-900/90',
    button: 'bg-amber-800 hover:bg-amber-700',
    icon: 'text-amber-500',
    textMuted: 'text-stone-400',
    backgroundGradient: 'bg-gradient-to-b from-black/20 via-stone-900/10 to-stone-950/80',
    scanline: false
  },
  // Fallback for others using Cyberpunk base
  default: {
    fontHead: 'font-mono-tech',
    fontBody: 'font-sans',
    accent: 'text-cyan-400',
    accentBorder: 'border-cyan-500',
    accentBg: 'bg-cyan-500',
    panelBg: 'bg-black/60',
    button: 'bg-cyan-600 hover:bg-cyan-500',
    icon: 'text-cyan-400',
    textMuted: 'text-gray-400',
    backgroundGradient: 'bg-gradient-to-b from-transparent via-zinc-900/5 to-black/20',
    scanline: true
  }
};

export const getThemeStyles = (themeName: string): ThemeStyles => {
  return THEMES[themeName] || THEMES.default;
};
