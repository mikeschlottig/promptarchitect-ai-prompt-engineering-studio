import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PromptEditor } from '@/components/PromptEditor';
import { SettingsDialog } from '@/components/SettingsDialog';
import { Toaster } from '@/components/ui/sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useStore } from '@/lib/store';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
export function HomePage() {
  const [settingsOpen, setSettingsOpen] = React.useState(false);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12 flex flex-col h-screen">
          <header className="mb-8 space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Prompt Architect</h1>
            <p className="text-muted-foreground">Engineering high-performance AI instructions.</p>
          </header>
          <main className="flex-1 min-h-0">
            <PromptEditor />
          </main>
          <footer className="mt-8 text-center text-xs text-muted-foreground">
            <p>Note: AI requests may be limited. Configure your own API key in settings for unlimited usage.</p>
          </footer>
        </div>
      </div>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <Toaster richColors position="bottom-right" />
    </AppLayout>
  );
}