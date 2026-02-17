import React from 'react';
import { useStore } from '@/lib/store';
import { FRAMEWORKS } from '@/lib/optimizers';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { LayoutGrid } from 'lucide-react';
export function FrameworkSelector() {
  const activeFrameworkId = useStore(s => s.activeFrameworkId);
  const setActiveFrameworkId = useStore(s => s.setActiveFrameworkId);
  const promptInput = useStore(s => s.promptData.input);
  const setPromptData = useStore(s => s.setPromptData);
  const handleSelect = (id: string, template: string) => {
    setActiveFrameworkId(id);
    if (!promptInput.trim()) {
      setPromptData({ input: template });
    } else {
      setPromptData({ input: promptInput + "\n\n" + template });
    }
  };
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
      <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/40 rounded-lg border border-border/50">
        <LayoutGrid className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mr-1">Frameworks</span>
        <TooltipProvider>
          {FRAMEWORKS.map((fw) => (
            <Tooltip key={fw.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={activeFrameworkId === fw.id ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-7 px-3 text-xs font-medium transition-all",
                    activeFrameworkId === fw.id ? "shadow-sm bg-background border border-border" : "text-muted-foreground"
                  )}
                  onClick={() => handleSelect(fw.id, fw.template)}
                >
                  {fw.name}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[200px] text-xs">
                <p className="font-semibold">{fw.name}</p>
                <p className="text-muted-foreground">{fw.description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
}