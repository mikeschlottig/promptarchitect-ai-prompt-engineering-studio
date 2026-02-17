import React, { useEffect, useState } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStore } from '@/lib/store';
import { chatService, MODELS } from '@/lib/chat';
import { OPTIMIZER_SYSTEM_PROMPT } from '@/lib/optimizers';
import { Wand2, Copy, Check, Sparkles, LayoutPanelLeft, Star, Send, Trash2, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'sonner';
import { VoiceControls } from './VoiceControls';
import { FrameworkSelector } from './FrameworkSelector';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
export function PromptEditor() {
  const input = useStore((s) => s.promptData.input);
  const output = useStore((s) => s.promptData.output);
  const directOutput = useStore((s) => s.promptData.directOutput);
  const setPromptData = useStore((s) => s.setPromptData);
  const currentSessionId = useStore((s) => s.currentSessionId);
  const model = useStore((s) => s.settings.model);
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  const setSessions = useStore((s) => s.setSessions);
  const setActiveView = useStore((s) => s.setActiveView);
  const starredIds = useStore((s) => s.starredIds);
  const toggleStar = useStore((s) => s.toggleStar);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSendingDirectly, setIsSendingDirectly] = useState(false);
  const [copiedType, setCopiedType] = useState<'optimized' | 'direct' | null>(null);
  const isStarred = currentSessionId ? starredIds.includes(currentSessionId) : false;
  const CHAR_LIMIT = 3000;
  useEffect(() => {
    if (currentSessionId) {
      const loadSessionData = async () => {
        try {
          const res = await chatService.getMessages();
          if (res.success && res.data?.messages) {
            const msgs = res.data.messages;
            const relevantHistory = msgs.filter(m => !m.content.includes('assistant-chat: '));
            const lastUserMsg = [...relevantHistory].reverse().find(m => m.role === 'user');
            const lastAssistantMsg = [...relevantHistory].reverse().find(m => m.role === 'assistant');
            let recoveredInput = lastUserMsg?.content || '';
            let recoveredOutput = '';
            let recoveredDirect = '';
            const isDirect = recoveredInput.startsWith('direct:true\n');
            const isOptimized = recoveredInput.includes(OPTIMIZER_SYSTEM_PROMPT);
            if (isOptimized) {
              recoveredInput = recoveredInput.split('USER INPUT:')[1]?.trim() || recoveredInput.replace(OPTIMIZER_SYSTEM_PROMPT, '').trim();
              recoveredOutput = lastAssistantMsg?.content || '';
            } else if (isDirect) {
              recoveredInput = recoveredInput.replace('direct:true\n', '').trim();
              recoveredDirect = lastAssistantMsg?.content || '';
            } else {
              recoveredInput = recoveredInput.trim();
              recoveredOutput = lastAssistantMsg?.content || '';
            }
            setPromptData({
              input: recoveredInput,
              output: recoveredOutput,
              directOutput: recoveredDirect
            });
          }
        } catch (err) {
          console.error("Failed to load session messages", err);
        }
      };
      loadSessionData();
    }
  }, [currentSessionId, setPromptData]);
  const validateAndCleanInput = (rawInput: string) => {
    if (rawInput.length > CHAR_LIMIT) {
      toast.info("Input truncated for optimal performance.");
      return rawInput.slice(0, CHAR_LIMIT);
    }
    return rawInput;
  };
  const handleOptimize = async () => {
    if (!input.trim()) return;
    const cleanedInput = validateAndCleanInput(input);
    setIsOptimizing(true);
    setPromptData({ output: '', directOutput: '' });
    try {
      const fullPrompt = `${OPTIMIZER_SYSTEM_PROMPT}\n\nUSER INPUT: ${cleanedInput}`;
      let streamedOutput = '';
      await chatService.sendMessage(fullPrompt, model, (chunk) => {
        streamedOutput += chunk;
        setPromptData({ output: streamedOutput });
      });
      if (currentSessionId) {
        const title = cleanedInput.slice(0, 30) + (cleanedInput.length > 30 ? '...' : '');
        await chatService.updateSessionTitle(currentSessionId, `Optimized: ${title}`);
        const res = await chatService.listSessions();
        if (res.success && res.data) setSessions(res.data);
      }
      toast.success('Prompt optimized!');
    } catch (err) {
      // Error is handled in chatService.sendMessage with toast
    } finally {
      setIsOptimizing(false);
    }
  };
  const handleSendDirectly = async () => {
    if (!input.trim()) return;
    const cleanedInput = validateAndCleanInput(input);
    setIsSendingDirectly(true);
    setPromptData({ directOutput: '', output: '' });
    try {
      let streamedOutput = '';
      await chatService.sendMessage(`direct:true\n${cleanedInput}`, model, (chunk) => {
        streamedOutput += chunk;
        setPromptData({ directOutput: streamedOutput });
      });
      toast.success('Direct response received!');
    } catch (err) {
      // Error is handled in chatService.sendMessage with toast
    } finally {
      setIsSendingDirectly(false);
    }
  };
  const copyToClipboard = (text: string, type: 'optimized' | 'direct') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
    toast.info('Copied to clipboard');
  };
  const handleClear = () => {
    setPromptData({ input: '', output: '', directOutput: '' });
    toast.info('Workspace cleared');
  };
  const renderMarkdown = (content: string) => (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" {...props}>
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>{children}</code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
  const charCount = input.length;
  const getCounterColor = () => {
    if (charCount >= 2500) return 'text-destructive font-bold';
    if (charCount >= 2000) return 'text-orange-500 font-medium';
    return 'text-muted-foreground';
  };
  return (
    <div className="h-[calc(100vh-16rem)] border rounded-xl overflow-hidden bg-background shadow-soft">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={45} minSize={30}>
          <div className="h-full flex flex-col p-4 md:p-6 gap-4 border-r overflow-hidden relative">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Draft Input</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <VoiceControls onTranscript={(text) => setPromptData({ input: input + (input ? " " : "") + text })} />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={handleClear} title="Clear All">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 gap-2" onClick={() => setActiveView('compare')}>
                    <LayoutPanelLeft className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Compare</span>
                  </Button>
                  <Select value={model} onValueChange={(val) => setSettings({ ...settings, model: val })}>
                    <SelectTrigger className="h-8 w-24 sm:w-36 text-xs">
                      <SelectValue placeholder="Model" />
                    </SelectTrigger>
                    <SelectContent>
                      {MODELS.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleSendDirectly} disabled={isSendingDirectly || isOptimizing || !input} size="sm" className="gap-2 h-8 px-3 sm:px-4 font-semibold bg-emerald-600 hover:bg-emerald-700">
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">{isSendingDirectly ? '...' : 'Send'}</span>
                  </Button>
                  <Button onClick={handleOptimize} disabled={isOptimizing || isSendingDirectly || !input} size="sm" className="gap-2 h-8 px-3 sm:px-4 font-semibold bg-indigo-600 hover:bg-indigo-700">
                    <Wand2 className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">{isOptimizing ? '...' : 'Optimize'}</span>
                  </Button>
                </div>
              </div>
              <FrameworkSelector />
            </div>
            <div className="flex-1 relative flex flex-col mt-2">
              <Textarea
                placeholder="Paste your rough instructions, goals, or context here..."
                className="flex-1 resize-none bg-secondary/5 border-none focus-visible:ring-0 text-base leading-relaxed p-0 placeholder:text-muted-foreground/30"
                value={input}
                onChange={(e) => setPromptData({ input: e.target.value })}
              />
              <div className="absolute bottom-0 right-0 p-2 flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={cn("text-[10px] tabular-nums px-2 py-1 rounded bg-background/80 border border-border/50 flex items-center gap-1.5 cursor-help", getCounterColor())}>
                        {charCount} / {CHAR_LIMIT}
                        <Info className="w-3 h-3" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs max-w-[200px]">
                      <p>Draft limit: {CHAR_LIMIT} characters.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={55} minSize={30}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={50} minSize={20}>
              <div className="h-full flex flex-col p-4 md:p-6 gap-4 bg-accent/5 overflow-hidden">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Architected Result</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className={cn("h-7 gap-2 text-xs", isStarred && "text-yellow-500 border-yellow-500/50 bg-yellow-500/10")} onClick={() => currentSessionId && toggleStar(currentSessionId)}>
                      <Star className={cn("w-3 h-3", isStarred && "fill-yellow-500")} /> Star
                    </Button>
                    {output && (
                      <Button variant="outline" size="sm" className="h-7 gap-2 text-xs" onClick={() => copyToClipboard(output, 'optimized')}>
                        {copiedType === 'optimized' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />} Copy
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-auto bg-background rounded-lg border border-border/50 p-4 shadow-sm">
                  {output ? renderMarkdown(output) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground/20 text-center space-y-2">
                      <Sparkles className="w-5 h-5" />
                      <p className="text-xs">Optimized prompt will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={20}>
              <div className="h-full flex flex-col p-4 md:p-6 gap-4 bg-secondary/5 overflow-hidden">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Direct Response</h2>
                  {directOutput && (
                    <Button variant="outline" size="sm" className="h-7 gap-2 text-xs" onClick={() => copyToClipboard(directOutput, 'direct')}>
                      {copiedType === 'direct' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />} Copy
                    </Button>
                  )}
                </div>
                <div className="flex-1 overflow-auto bg-background rounded-lg border border-border/50 p-4 shadow-sm">
                  {directOutput ? renderMarkdown(directOutput) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground/20 text-center space-y-2">
                      <Send className="w-5 h-5" />
                      <p className="text-xs">Raw model response will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}