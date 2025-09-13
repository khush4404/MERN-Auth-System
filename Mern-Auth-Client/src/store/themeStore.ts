// src/utils/themeStore.ts
import { create } from 'zustand';

type ThemeMode = 'light' | 'dark' | 'system';

type ThemeState = {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    applyTheme: (mode?: ThemeMode) => void;
    initTheme: () => void;
    isDarkMode: () => boolean;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
    mode: 'system',

    setMode: (mode) => {
        localStorage.setItem('theme', mode);
        set({ mode });
        get().applyTheme(mode);
    },

    applyTheme: (mode = get().mode) => {
        const root = window.document.documentElement;
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        const effectiveTheme = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;

        if (effectiveTheme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    },

    initTheme: () => {
        const stored = localStorage.getItem('theme') as ThemeMode | null;
        const mode = stored ?? 'system';
        set({ mode });
        get().applyTheme(mode);
    },

    isDarkMode: () => document.documentElement.classList.contains('dark'),
}));
