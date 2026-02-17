import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PromptEditor } from '@/components/PromptEditor';
import { LibraryView } from '@/components/LibraryView';
import { ComparisonView } from '@/components/ComparisonView';
import { AIAssistant } from '@/components/AIAssistant';
import { SettingsDialog } from '@/components/SettingsDialog';
import { Toaster } from '@/components/ui/sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useStore } from '@/lib/store';
import { Settings, Sparkles, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
export function HomePage() {
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const activeView = useStore((s) => s.activeView);
  const renderContent = () => {
    switch (activeView) {
      case 'workspace':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-8 md:py-10 lg:py-12 flex flex-col min-h-screen">
              <header className="mb-8 space-y-2">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Sparkles className="h-6 w-6" />
                  <span className="font-bold tracking-tight text-xl">Architect Studio</span>
                  <div className="ml-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-600 border border-indigo-100 uppercase">
                    <BadgeCheck className="w-3 h-3" /> Pro
                  </div>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Prompt Workspace</h1>
                <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                  Precision-engineer high-performance instructions using advanced prompting frameworks.
                </p>
              </header>
              <main className="flex-1">
                <PromptEditor />
              </main>
              <footer className="mt-12 py-8 border-t flex flex-col items-center gap-4">
                <div className="flex gap-6 text-sm text-muted-foreground/60">
                  <span>Documentation</span>
                  <span>Framework Guide</span>
                  <span>Model Status</span>
                </div>
                <div className="text-center text-xs text-muted-foreground/40 space-y-1">
                  <p>© 2024 Prompt Architect Studio. The Professional AI Toolset.</p>
                  <p>Note: AI requests are subject to provider quotas. Use custom API keys in settings for high volume work.</p>
                </div>
              </footer>
            </div>
          </div>
        );
      case 'compare':
        return <ComparisonView />;
      case 'library':
        return <LibraryView />;
      default:
        return null;
    }
  };
  return (
    <AppLayout className="relative">
      <ThemeToggle className="absolute top-4 right-16" />
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-50"
        onClick={() => setSettingsOpen(true)}
      >
        <Settings className="h-5 w-5 text-foreground/80 hover:text-foreground" />
      </Button>
      {renderContent()}
      <AIAssistant />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <Toaster richColors position="bottom-right" />
    </AppLayout>
  );
}