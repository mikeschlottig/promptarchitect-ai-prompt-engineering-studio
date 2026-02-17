import { create } from 'zustand';
interface Settings {
  baseUrl: string;
  apiKey: string;
  model: string;
}
interface PromptData {
  input: string;
  output: string;
}
interface ArchitectState {
  settings: Settings;
  sidebarOpen: boolean;
  promptData: PromptData;
  setSettings: (settings: Settings) => void;
  setSidebarOpen: (open: boolean) => void;
  setPromptData: (data: Partial<PromptData>) => void;
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
  setSettings: (settings) => set({ settings }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setPromptData: (data) =>
    set((state) => ({
      promptData: { ...state.promptData, ...data },
    })),
}));