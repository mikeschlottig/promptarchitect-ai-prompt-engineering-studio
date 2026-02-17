import React, { useEffect } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStore } from '@/lib/store';
import { chatService, MODELS } from '@/lib/chat';
import { OPTIMIZER_SYSTEM_PROMPT } from '@/lib/optimizers';
import { Wand2, Copy, Check, Save, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { VoiceControls } from './VoiceControls';
export function PromptEditor() {
  const input = useStore((s) => s.promptData.input);
  const output = useStore((s) => s.promptData.output);
  const setPromptData = useStore((s) => s.setPromptData);
  const currentSessionId = useStore((s) => s.currentSessionId);
  const model = useStore((s) => s.settings.model);
  const setSettings = useStore((s) => s.setSettings);
  const settings = useStore((s) => s.settings);
  const setSessions = useStore((s) => s.setSessions);
  const [isOptimizing, setIsOptimizing] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  // Sync editor with active session data
  useEffect(() => {
    if (currentSessionId) {
      const loadSessionData = async () => {
        try {
          const res = await chatService.getMessages();
          if (res.success && res.data) {
            const msgs = res.data.messages;
            const lastUser = [...msgs].reverse().find(m => m.role === 'user');
            const lastAssistant = [...msgs].reverse().find(m => m.role === 'assistant');
            setPromptData({
              input: lastUser?.content.replace(OPTIMIZER_SYSTEM_PROMPT, '').trim() || '',
              output: lastAssistant?.content || ''
            });
          }
        } catch (err) {
          console.error("Failed to load session messages", err);
        }
      };
      loadSessionData();
    }
  }, [currentSessionId, setPromptData]);
  const handleOptimize = async () => {
    if (!input.trim()) return;
    setIsOptimizing(true);
    setPromptData({ output: '' });
    try {
      const fullPrompt = `${OPTIMIZER_SYSTEM_PROMPT}\n\nUSER INPUT: ${input}`;
      let streamedOutput = '';
      await chatService.sendMessage(fullPrompt, model, (chunk) => {
        streamedOutput += chunk;
        setPromptData({ output: streamedOutput });
      });
      if (currentSessionId) {
        const title = input.slice(0, 30) + (input.length > 30 ? '...' : '');
        await chatService.updateSessionTitle(currentSessionId, `Optimized: ${title}`);
        const res = await chatService.listSessions();
        if (res.success && res.data) setSessions(res.data);
      }
      toast.success('Prompt optimized!');
    } catch (err) {
      toast.error('Failed to optimize prompt');
    } finally {
      setIsOptimizing(false);
    }
  };
  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.info('Copied to clipboard');
  };
  const handleSave = () => {
    if (!output) return;
    toast.success('Saved to library');
  };
  return (
    <div className="h-[calc(100vh-12rem)] border rounded-xl overflow-hidden bg-background shadow-soft">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={45} minSize={30}>
          <div className="h-full flex flex-col p-6 gap-4 border-r">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Draft Input</h2>
              <div className="flex items-center gap-2">
                <VoiceControls onTranscript={(text) => setPromptData({ input: input + (input ? " " : "") + text })} />
                <Select value={model} onValueChange={(val) => setSettings({ ...settings, model: val })}>
                  <SelectTrigger className="h-8 w-40 text-xs">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {MODELS.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button onClick={handleOptimize} disabled={isOptimizing || !input} size="sm" className="gap-2 h-8 px-4 font-semibold">
                  <Wand2 className="w-3.5 h-3.5" />
                  {isOptimizing ? 'Thinking...' : 'Optimize'}
                </Button>
              </div>
            </div>
            <Textarea
              placeholder="Paste your rough instructions, goals, or context here..."
              className="flex-1 resize-none bg-secondary/10 border-none focus-visible:ring-0 text-base leading-relaxed p-0 placeholder:text-muted-foreground/40"
              value={input}
              onChange={(e) => setPromptData({ input: e.target.value })}
            />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={55} minSize={30}>
          <div className="h-full flex flex-col p-6 gap-4 bg-accent/5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Architected Result</h2>
              {output && (
                <div className="flex gap-2">
                   <Button variant="outline" size="sm" className="h-8 gap-2" onClick={handleSave}>
                    <Save className="w-3.5 h-3.5" /> Save
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 gap-2" onClick={copyToClipboard}>
                    {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy
                  </Button>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-auto bg-background rounded-lg border border-border/50 p-6 prose prose-sm dark:prose-invert max-w-none shadow-sm">
              {output ? (
                <ReactMarkdown>{output}</ReactMarkdown>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <p className="text-sm italic">Enter your draft instructions and click 'Optimize' to generate a professional prompt structure.</p>
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}