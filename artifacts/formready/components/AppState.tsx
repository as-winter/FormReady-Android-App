import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';
export type AccentKey = 'violet' | 'mint' | 'peach' | 'ocean' | 'rose' | 'midnight' | 'forest' | 'sand';
export type ToolId = 'photo' | 'signature' | 'image-pdf' | 'pdf-compress' | 'pdf-merge' | 'pdf-split' | 'pdf-export';

export type HistoryItem = {
  id: string;
  name: string;
  operation: string;
  date: string;
  size: string;
  uri?: string;
};

export type Preset = {
  id: string;
  name: string;
  detail: string;
  tool: ToolId;
};

type AppStateValue = {
  theme: ThemeMode;
  accent: AccentKey;
  favorites: ToolId[];
  history: HistoryItem[];
  presets: Preset[];
  setTheme: (value: ThemeMode) => void;
  setAccent: (value: AccentKey) => void;
  toggleFavorite: (tool: ToolId) => void;
  addHistory: (item: Omit<HistoryItem, 'id' | 'date'>) => void;
  deleteHistory: (id: string) => void;
  addPreset: (preset: Omit<Preset, 'id'>) => void;
};

const STORAGE_KEY = 'formready-state-v1';
const AppStateContext = createContext<AppStateValue | null>(null);

const defaultPresets: Preset[] = [
  { id: 'passport', name: 'Passport Photo', detail: '3.5 × 4.5 cm · JPG · 50 KB', tool: 'photo' },
  { id: 'college', name: 'College Form', detail: 'JPG · max 100 KB', tool: 'photo' },
];

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [accent, setAccentState] = useState<AccentKey>('violet');
  const [favorites, setFavorites] = useState<ToolId[]>(['photo', 'signature', 'image-pdf']);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [presets, setPresets] = useState<Preset[]>(defaultPresets);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (!stored) return;
      try {
        const data = JSON.parse(stored) as Partial<{
          theme: ThemeMode;
          accent: AccentKey;
          favorites: ToolId[];
          history: HistoryItem[];
          presets: Preset[];
        }>;
        if (data.theme) setThemeState(data.theme);
        if (data.accent) setAccentState(data.accent);
        if (data.favorites) setFavorites(data.favorites);
        if (data.history) setHistory(data.history);
        if (data.presets) setPresets(data.presets);
      } catch {
        // Corrupt local settings are ignored and replaced by safe defaults.
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ theme, accent, favorites, history, presets }));
  }, [theme, accent, favorites, history, presets]);

  const value = useMemo<AppStateValue>(() => ({
    theme,
    accent,
    favorites,
    history,
    presets,
    setTheme: setThemeState,
    setAccent: setAccentState,
    toggleFavorite: (tool) => setFavorites((current) => current.includes(tool) ? current.filter((item) => item !== tool) : [...current, tool]),
    addHistory: (item) => setHistory((current) => [{ ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, date: 'Just now' }, ...current].slice(0, 40)),
    deleteHistory: (id) => setHistory((current) => current.filter((item) => item.id !== id)),
    addPreset: (preset) => setPresets((current) => [{ ...preset, id: `${Date.now()}` }, ...current]),
  }), [theme, accent, favorites, history, presets]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used inside AppStateProvider');
  return context;
}