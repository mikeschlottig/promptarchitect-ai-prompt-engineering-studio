import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PromptEditor } from '@/components/PromptEditor';
import { LibraryView } from '@/components/LibraryView';
import { AIAssistant } from '@/components/AIAssistant';
import { SettingsDialog } from '@/components/SettingsDialog';
import { Toaster } from '@/components/ui/sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useStore } from '@/lib/store';
import { Settings, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
export function HomePage() {
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const activeView = useStore((s) => s.activeView);
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
      {activeView === 'workspace' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 md:py-10 lg:py-12 flex flex-col min-h-screen">
            <header className="mb-8 space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-6 w-6" />
                <span className="font-bold tracking-tight text-lg">Architect</span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Prompt Workspace</h1>
              <p className="text-muted-foreground text-lg max-w-2xl">Engineer high-performance instructions using advanced prompting frameworks.</p>
            </header>
            <main className="flex-1">
              <PromptEditor />
            </main>
            <footer className="mt-12 py-6 border-t text-center text-xs text-muted-foreground/60 space-y-1">
              <p>© 2024 Prompt Architect Studio. Professional AI Engineering Tools.</p>
              <p>Note: AI requests may be limited by cloud provider quotas. Use custom API keys for higher throughput.</p>
            </footer>
          </div>
        </div>
      ) : (
        <LibraryView />
      )}
      <AIAssistant />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <Toaster richColors position="bottom-right" />
    </AppLayout>
  );
}