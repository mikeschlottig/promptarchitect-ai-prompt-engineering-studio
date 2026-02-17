import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { chatService } from '@/lib/chat';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { History, Search, Trash2, ExternalLink, Calendar, Plus, Star, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
export function LibraryView() {
  const sessions = useStore((s) => s.sessions);
  const setSessions = useStore((s) => s.setSessions);
  const setCurrentSessionId = useStore((s) => s.setCurrentSessionId);
  const setActiveView = useStore((s) => s.setActiveView);
  const starredIds = useStore((s) => s.starredIds);
  const toggleStar = useStore((s) => s.toggleStar);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "starred">("all");
  const filteredSessions = sessions.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || starredIds.includes(s.id);
    return matchesSearch && matchesFilter;
  });
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
  const handleCopy = (title: string) => {
    const content = title.replace('Optimized: ', '');
    navigator.clipboard.writeText(content);
    toast.success("Copied draft text");
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight">Prompt Library</h1>
            <p className="text-muted-foreground text-lg">Your curated collection of engineered instructions.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Tabs value={filter} onValueChange={(v: any) => setFilter(v)} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="starred" className="gap-2">
                  <Star className="w-3.5 h-3.5" /> Starred
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search history..."
                className="pl-9 h-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={() => setActiveView('workspace')} className="h-10 gap-2 bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4" /> New
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSessions.map((session) => (
            <Card key={session.id} className="group hover:ring-2 hover:ring-indigo-500/20 transition-all bg-card overflow-hidden border-border/50">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg font-bold leading-tight line-clamp-2 min-h-[3rem]">{session.title}</CardTitle>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className={cn("h-8 w-8", starredIds.includes(session.id) ? "text-yellow-500" : "text-muted-foreground")} onClick={() => toggleStar(session.id)}>
                      <Star className={cn("h-4 w-4", starredIds.includes(session.id) && "fill-yellow-500")} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(session.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="flex items-center gap-1 text-xs pt-2">
                  <Calendar className="h-3 w-3" />
                  {format(session.lastActive, 'MMM d, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="h-24 text-xs text-muted-foreground line-clamp-5 bg-muted/30 p-3 rounded-lg border border-border/50 italic font-mono leading-relaxed">
                  {session.title.replace('Optimized: ', '')}
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Button variant="secondary" className="flex-1 gap-2" onClick={() => handleOpen(session.id)}>
                  <ExternalLink className="h-4 w-4" /> Open
                </Button>
                <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => handleCopy(session.title)} title="Copy raw draft">
                  <Copy className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
          {filteredSessions.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-muted-foreground bg-muted/5 rounded-2xl border-2 border-dashed border-border/50">
              <History className="h-12 w-12 mb-4 opacity-10" />
              <p className="text-lg font-medium">No results found.</p>
              <p className="text-sm">Try adjusting your filters or creating a new prompt.</p>
              {(search || filter !== "all") && <Button variant="link" onClick={() => {setSearch(""); setFilter("all");}} className="mt-2 text-indigo-600">Clear all filters</Button>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}