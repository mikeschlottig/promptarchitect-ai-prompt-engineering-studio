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
}
type ViewType = 'workspace' | 'library';
interface ArchitectState {
  settings: Settings;
  sidebarOpen: boolean;
  promptData: PromptData;
  activeView: ViewType;
  currentSessionId: string | null;
  sessions: SessionInfo[];
  setSettings: (settings: Settings) => void;
  setSidebarOpen: (open: boolean) => void;
  setPromptData: (data: Partial<PromptData>) => void;
  setActiveView: (view: ViewType) => void;
  setCurrentSessionId: (id: string | null) => void;
  setSessions: (sessions: SessionInfo[]) => void;
}
export const useStore = create<ArchitectState>((set) => ({
  settings: {
    baseUrl: '',
    apiKey: '',
    model: 'google-ai-studio/gemini-2.0-flash',
  },
  sidebarOpen: true,
  promptData: {
    input: '',
    output: '',
  },
  activeView: 'workspace',
  currentSessionId: null,
  sessions: [],
  setSettings: (settings) => set({ settings }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setPromptData: (data) =>
    set((state) => ({
      promptData: { ...state.promptData, ...data },
    })),
  setActiveView: (activeView) => set({ activeView }),
  setCurrentSessionId: (currentSessionId) => set({ currentSessionId }),
  setSessions: (sessions) => set({ sessions }),
}));