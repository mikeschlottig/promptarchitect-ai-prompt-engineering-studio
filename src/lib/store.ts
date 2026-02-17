import { create } from 'zustand';
import type { SessionInfo } from '../../worker/types';
interface Settings {
  baseUrl: string;
  apiKey: string;
  model: string;
}
interface PromptData {
  input: string;
  output: string;
  directOutput: string;
}
export type ViewType = 'workspace' | 'library' | 'compare';
interface ArchitectState {
  settings: Settings;
  sidebarOpen: boolean;
  settingsOpen: boolean;
  promptData: PromptData;
  activeView: ViewType;
  currentSessionId: string | null;
  sessions: SessionInfo[];
  starredIds: string[];
  comparisonModels: string[];
  activeFrameworkId: string | null;
  setSettings: (settings: Settings) => void;
  setSidebarOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setPromptData: (data: Partial<PromptData>) => void;
  setActiveView: (view: ViewType) => void;
  setCurrentSessionId: (id: string | null) => void;
  setSessions: (sessions: SessionInfo[]) => void;
  setComparisonModels: (models: string[]) => void;
  setActiveFrameworkId: (id: string | null) => void;
  toggleStar: (id: string) => void;
}
export const useStore = create<ArchitectState>((set) => ({
  settings: {
    baseUrl: '',
    apiKey: '',
    model: 'google-ai-studio/gemini-2.0-flash',
  },
  sidebarOpen: true,
  settingsOpen: false,
  promptData: {
    input: '',
    output: '',
    directOutput: '',
  },
  activeView: 'workspace',
  currentSessionId: null,
  sessions: [],
  starredIds: JSON.parse(localStorage.getItem('starred_prompts') || '[]'),
  comparisonModels: ['google-ai-studio/gemini-2.0-flash', 'google-ai-studio/gemini-1.5-flash'],
  activeFrameworkId: null,
  setSettings: (settings) => set({ settings }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
  setPromptData: (data) =>
    set((state) => ({
      promptData: { ...state.promptData, ...data },
    })),
  setActiveView: (activeView) => set({ activeView }),
  setCurrentSessionId: (currentSessionId) => set({ currentSessionId }),
  setSessions: (sessions) => set({ sessions }),
  setComparisonModels: (comparisonModels) => set({ comparisonModels }),
  setActiveFrameworkId: (activeFrameworkId) => set({ activeFrameworkId }),
  toggleStar: (id) => set((state) => {
    const isStarred = state.starredIds.includes(id);
    const newStarred = isStarred
      ? state.starredIds.filter(sid => sid !== id)
      : [...state.starredIds, id];
    localStorage.setItem('starred_prompts', JSON.stringify(newStarred));
    return { starredIds: newStarred };
  }),
}));