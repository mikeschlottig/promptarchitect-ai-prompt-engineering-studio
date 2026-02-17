import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { chatService } from '@/lib/chat';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { History, Search, Trash2, ExternalLink, Calendar, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
export function LibraryView() {
  const sessions = useStore((s) => s.sessions);
  const setSessions = useStore((s) => s.setSessions);
  const setCurrentSessionId = useStore((s) => s.setCurrentSessionId);
  const setActiveView = useStore((s) => s.setActiveView);
  const [search, setSearch] = useState("");
  const filteredSessions = sessions.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );
  const handleOpen = (id: string) => {
    setCurrentSessionId(id);
    chatService.switchSession(id);
    setActiveView('workspace');
  };
  const handleDelete = async (id: string) => {
    try {
      const res = await chatService.deleteSession(id);
      if (res.success) {
        const updated = await chatService.listSessions();
        if (updated.success && updated.data) setSessions(updated.data);
        toast.success("Prompt deleted from library");
      }
    } catch (err) {
      toast.error("Failed to delete prompt");
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Prompt Library</h1>
            <p className="text-muted-foreground">Browse and manage your architected instructions.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search library..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={() => setActiveView('workspace')} className="gap-2">
              <Plus className="h-4 w-4" /> New Prompt
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <Card key={session.id} className="group hover:border-primary/50 transition-colors bg-card overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg line-clamp-1">{session.title}</CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(session.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription className="flex items-center gap-1 text-xs">
                  <Calendar className="h-3 w-3" />
                  {format(session.lastActive, 'MMM d, yyyy • h:mm a')}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="h-20 text-xs text-muted-foreground line-clamp-4 bg-muted/30 p-2 rounded border italic">
                  Draft instructions: {session.title.replace('Optimized: ', '')}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" className="w-full gap-2" onClick={() => handleOpen(session.id)}>
                  <ExternalLink className="h-4 w-4" />
                  Open in Workspace
                </Button>
              </CardFooter>
            </Card>
          ))}
          {filteredSessions.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
              <History className="h-10 w-10 mb-4 opacity-20" />
              <p>No prompts found in your library.</p>
              {search && <Button variant="link" onClick={() => setSearch("")}>Clear search</Button>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}