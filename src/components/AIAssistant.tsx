import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatService } from '@/lib/chat';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import ReactMarkdown from 'react-markdown';
export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const model = useStore(s => s.settings.model);
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [messages]);
  const handleSend = async () => {
    if (!message.trim() || isTyping) return;
    const userMsg = message;
    setMessage('');
    // UI update
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);
    try {
      let responseContent = '';
      // Internal prefix to distinguish this as a support chat, not a prompt draft
      const internalMsg = `assistant-chat: ${userMsg}`;
      await chatService.sendMessage(internalMsg, model, (chunk) => {
        responseContent += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant') {
            return [...prev.slice(0, -1), { role: 'assistant', content: responseContent }];
          }
          return [...prev, { role: 'assistant', content: responseContent }];
        });
      });
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't process that right now." }]);
    } finally {
      setIsTyping(false);
    }
  };
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-80 md:w-96 h-[500px] bg-card border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b bg-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="font-semibold text-sm">Architect Assistant</span>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/20 text-white" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8 px-4 text-muted-foreground text-sm">
                    <p>I'm your prompt engineering assistant. Ask me for tips on structuring, refining, or brainstorming your AI instructions!</p>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={cn("flex flex-col max-w-[85%]", msg.role === 'user' ? "ml-auto items-end" : "items-start")}>
                    <div className={cn("p-3 rounded-2xl text-sm", msg.role === 'user' ? "bg-indigo-600 text-white rounded-tr-none" : "bg-muted rounded-tl-none prose prose-sm dark:prose-invert")}>
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-center gap-2 text-muted-foreground text-xs italic">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Architect is thinking...
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="p-4 border-t bg-muted/50">
              <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
                <Input
                  placeholder="Ask a question..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-background text-sm"
                />
                <Button type="submit" size="icon" disabled={!message.trim() || isTyping}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Button
        size="icon"
        className="h-14 w-14 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all bg-indigo-600 text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageSquare className={cn("h-6 w-6 transition-transform", isOpen ? "rotate-90 scale-0" : "scale-100")} />
        <X className={cn("h-6 w-6 absolute transition-transform", isOpen ? "scale-100" : "-rotate-90 scale-0")} />
      </Button>
    </div>
  );
}