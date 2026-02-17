import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { chatService, MODELS } from '@/lib/chat';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Loader2, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'sonner';
export function ComparisonView() {
  const input = useStore(s => s.promptData.input);
  const comparisonModels = useStore(s => s.comparisonModels);
  const setComparisonModels = useStore(s => s.setComparisonModels);
  const [results, setResults] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const runComparison = async () => {
    if (!input.trim()) return toast.error("Please enter a prompt first");
    const newResults = { ...results };
    const newLoading = { ...loading };
    comparisonModels.forEach(m => {
      newResults[m] = "";
      newLoading[m] = true;
    });
    setResults(newResults);
    setLoading(newLoading);
    comparisonModels.forEach(async (model) => {
      try {
        let streamText = "";
        await chatService.sendMessage(input, model, (chunk) => {
          streamText += chunk;
          setResults(prev => ({ ...prev, [model]: streamText }));
        });
      } catch (err) {
        toast.error(`Error with model ${model}`);
      } finally {
        setLoading(prev => ({ ...prev, [model]: false }));
      }
    });
  };
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Copied to clipboard");
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12 h-screen flex flex-col">
        <header className="mb-6 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Model Comparison</h1>
            <p className="text-sm text-muted-foreground">Benchmarking prompt performance side-by-side.</p>
          </div>
          <Button onClick={runComparison} className="gap-2 bg-indigo-600 hover:bg-indigo-700" size="lg">
            <Play className="w-4 h-4" /> Run All
          </Button>
        </header>
        <div className="flex-1 border rounded-xl overflow-hidden bg-background shadow-soft">
          <ResizablePanelGroup direction="horizontal">
            {comparisonModels.map((modelId, idx) => (
              <React.Fragment key={`${modelId}-${idx}`}>
                <ResizablePanel 
                  id={`comparison-panel-${idx}`}
                  order={idx}
                  defaultSize={100 / comparisonModels.length}
                >
                  <div className="h-full flex flex-col">
                    <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
                      <Select
                        value={modelId}
                        onValueChange={(val) => {
                          const newModels = [...comparisonModels];
                          newModels[idx] = val;
                          setComparisonModels(newModels);
                        }}
                      >
                        <SelectTrigger className="h-8 w-full max-w-[180px] text-xs bg-transparent border-none shadow-none focus:ring-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MODELS.map(m => <SelectItem key={`${m.id}-${idx}`} value={m.id}>{m.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {results[modelId] && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(results[modelId], modelId)}>
                          {copied === modelId ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </Button>
                      )}
                    </div>
                    <div className="flex-1 p-4 overflow-auto bg-card/50">
                      {loading[modelId] && !results[modelId] ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2">
                          <Loader2 className="w-6 h-6 animate-spin text-primary/40" />
                          <span className="text-xs italic">Awaiting response...</span>
                        </div>
                      ) : results[modelId] ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown
                            components={{
                              code({ node, inline, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline && match ? (
                                  <SyntaxHighlighter
                                    style={vscDarkPlus}
                                    language={match[1]}
                                    PreTag="div"
                                    {...props}
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                ) : (
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                );
                              },
                            }}
                          >
                            {results[modelId]}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground/30 text-xs italic text-center p-8">
                          Draft prompt results will appear here after clicking 'Run All'.
                        </div>
                      )}
                    </div>
                  </div>
                </ResizablePanel>
                {idx < comparisonModels.length - 1 && <ResizableHandle withHandle key={`handle-${idx}`} />}
              </React.Fragment>
            ))}
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  );
}