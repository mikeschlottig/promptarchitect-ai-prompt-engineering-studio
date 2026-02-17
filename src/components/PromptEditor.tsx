import React from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { chatService } from '@/lib/chat';
import { OPTIMIZER_SYSTEM_PROMPT } from '@/lib/optimizers';
import { Wand2, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
export function PromptEditor() {
  const input = useStore((s) => s.promptData.input);
  const output = useStore((s) => s.promptData.output);
  const setPromptData = useStore((s) => s.setPromptData);
  const [isOptimizing, setIsOptimizing] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const handleOptimize = async () => {
    if (!input.trim()) return;
    setIsOptimizing(true);
    setPromptData({ output: '' });
    try {
      const fullPrompt = `${OPTIMIZER_SYSTEM_PROMPT}\n\nUSER INPUT: ${input}`;
      let streamedOutput = '';
      await chatService.sendMessage(fullPrompt, undefined, (chunk) => {
        streamedOutput += chunk;
        setPromptData({ output: streamedOutput });
      });
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
  return (
    <div className="h-[calc(100vh-4rem)] border rounded-lg overflow-hidden bg-background">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={40} minSize={30}>
          <div className="h-full flex flex-col p-4 gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Draft</h2>
              <Button 
                onClick={handleOptimize} 
                disabled={isOptimizing || !input}
                size="sm"
                className="gap-2"
              >
                <Wand2 className="w-4 h-4" />
                {isOptimizing ? 'Optimizing...' : 'Optimize'}
              </Button>
            </div>
            <Textarea
              placeholder="Paste your vague prompt here..."
              className="flex-1 resize-none bg-secondary/30 focus-visible:ring-1"
              value={input}
              onChange={(e) => setPromptData({ input: e.target.value })}
            />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60} minSize={30}>
          <div className="h-full flex flex-col p-4 gap-4 bg-secondary/10">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Architected Prompt</h2>
              {output && (
                <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              )}
            </div>
            <div className="flex-1 overflow-auto prose prose-sm dark:prose-invert max-w-none p-4 rounded-md border bg-background/50">
              {output ? (
                <ReactMarkdown>{output}</ReactMarkdown>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground italic">
                  Optimized output will appear here...
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}