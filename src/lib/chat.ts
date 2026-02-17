import type { Message, ChatState, ToolCall, WeatherResult, MCPResult, ErrorResult, SessionInfo } from '../../worker/types';
import { toast } from 'sonner';
export interface ChatResponse {
  success: boolean;
  data?: ChatState;
  error?: string;
}
export const MODELS = [
  { id: 'google-ai-studio/gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
  { id: 'google-ai-studio/gemini-2.0-pro', name: 'Gemini 2.0 Pro' },
  { id: 'google-ai-studio/gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
];
class ChatService {
  private sessionId: string;
  private baseUrl: string;
  constructor() {
    this.sessionId = crypto.randomUUID();
    this.baseUrl = `/api/chat/${this.sessionId}`;
  }
  private parseAndToastError(errorStr?: string) {
    if (!errorStr) return;
    if (errorStr === 'provider:context_overflow') {
      toast.error("The input is too long for this model. Try switching to Gemini Pro or shortening your instructions.");
      return;
    }
    if (errorStr === 'provider:rate_limited') {
      toast.error("The AI provider is busy. Please wait a moment or use your own API key in settings.");
      return;
    }
    if (errorStr === 'provider:invalid_model') {
      toast.error("The selected model is unavailable or incorrect. Please check your settings.");
      return;
    }
    toast.error("Failed to send message. Please check your connection or try again.");
  }
  async sendMessage(
    message: string,
    model?: string,
    onChunk?: (chunk: string) => void
  ): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, model, stream: !!onChunk }),
      });
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        this.parseAndToastError(errJson.error);
        throw new Error(errJson.error || `HTTP ${response.status}`);
      }
      if (onChunk && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            // Detection of embedded error tokens in stream
            if (chunk.includes('[ERROR:provider:')) {
              const errorCode = chunk.match(/\[ERROR:(provider:[a-z_]+)\]/)?.[1];
              this.parseAndToastError(errorCode);
              throw new Error(errorCode);
            }
            if (chunk) onChunk(chunk);
          }
        } finally {
          reader.releaseLock();
        }
        return { success: true };
      }
      const result = await response.json();
      if (!result.success) {
        this.parseAndToastError(result.error);
      }
      return result;
    } catch (error: any) {
      console.error('Failed to send message:', error);
      // If toast wasn't already triggered by parseAndToastError
      if (!error.message?.startsWith('provider:')) {
        toast.error("Network error: Failed to reach the AI agent.");
      }
      return { success: false, error: error.message };
    }
  }
  async getMessages(): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/messages`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get messages:', error);
      return { success: false, error: 'Failed to load messages' };
    }
  }
  async clearMessages(): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/clear`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to clear messages' };
    }
  }
  getSessionId(): string { return this.sessionId; }
  newSession(): void { this.switchSession(crypto.randomUUID()); }
  switchSession(sessionId: string): void {
    this.sessionId = sessionId;
    this.baseUrl = `/api/chat/${sessionId}`;
  }
  async createSession(title?: string, sessionId?: string, firstMessage?: string) {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, sessionId, firstMessage })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to create session' };
    }
  }
  async listSessions(): Promise<{ success: boolean; data?: SessionInfo[]; error?: string }> {
    try {
      const response = await fetch('/api/sessions');
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to list sessions' };
    }
  }
  async deleteSession(sessionId: string) {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to delete session' };
    }
  }
  async updateSessionTitle(sessionId: string, title: string) {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/title`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to update session title' };
    }
  }
  async updateConfig(baseUrl: string, apiKey: string, model: string) {
    try {
      const response = await fetch(`${this.baseUrl}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerConfig: { baseUrl, apiKey, model } })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to update configuration' };
    }
  }
}
export const chatService = new ChatService();