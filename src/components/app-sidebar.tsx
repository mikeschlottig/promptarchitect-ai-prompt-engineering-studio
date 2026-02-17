import React, { useEffect, useCallback } from "react";
import { PlusCircle, Library, Settings, Sparkles, History, Trash2, LayoutPanelLeft, Star } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import { useStore } from "@/lib/store";
import { chatService } from "@/lib/chat";
import { toast } from "sonner";
export function AppSidebar(): JSX.Element {
  const activeView = useStore((s) => s.activeView);
  const setActiveView = useStore((s) => s.setActiveView);
  const currentSessionId = useStore((s) => s.currentSessionId);
  const setCurrentSessionId = useStore((s) => s.setCurrentSessionId);
  const sessions = useStore((s) => s.sessions);
  const setSessions = useStore((s) => s.setSessions);
  const setPromptData = useStore((s) => s.setPromptData);
  const starredIds = useStore((s) => s.starredIds);
  const setSettingsOpen = useStore((s) => s.setSettingsOpen);
  const starredSessions = sessions.filter(s => starredIds.includes(s.id));
  const fetchSessions = useCallback(async () => {
    try {
      const res = await chatService.listSessions();
      if (res.success && res.data) {
        setSessions(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    }
  }, [setSessions]);
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);
  const handleNewPrompt = async () => {
    const id = crypto.randomUUID();
    const res = await chatService.createSession("New Prompt", id);
    if (res.success) {
      setCurrentSessionId(id);
      setPromptData({ input: "", output: "", directOutput: "" });
      setActiveView("workspace");
      chatService.switchSession(id);
      fetchSessions();
      toast.success("New workspace created");
    }
  };
  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    chatService.switchSession(sessionId);
    setActiveView("workspace");
    toast.info("Switched workspace");
  };
  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const res = await chatService.deleteSession(id);
      if (res.success) {
        fetchSessions();
        if (currentSessionId === id) setCurrentSessionId(null);
        toast.success("Session deleted");
      }
    } catch (err) {
      toast.error("Failed to delete session");
    }
  };
  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="border-b border-border/50 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
            <Sparkles className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-none">Architect</span>
            <span className="text-2xs text-muted-foreground font-mono">BETA</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleNewPrompt} className="text-indigo-600 font-semibold">
                <PlusCircle className="size-4" /> <span>New Workspace</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setActiveView("workspace")} isActive={activeView === "workspace"}>
                <Sparkles className="size-4" /> <span>Editor</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setActiveView("compare")} isActive={activeView === "compare"}>
                <LayoutPanelLeft className="size-4" /> <span>Comparison</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setActiveView("library")} isActive={activeView === "library"}>
                <Library className="size-4" /> <span>Library</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        {starredSessions.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              <Star className="size-3 fill-yellow-500 text-yellow-500" /> Favorites
            </SidebarGroupLabel>
            <SidebarMenu>
              {starredSessions.map((session) => (
                <SidebarMenuItem key={session.id}>
                  <SidebarMenuButton
                    onClick={() => handleSelectSession(session.id)}
                    isActive={currentSessionId === session.id}
                    className="truncate"
                  >
                    <History className="size-4" />
                    <span className="truncate">{session.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
        <SidebarGroup>
          <SidebarGroupLabel>Recent History</SidebarGroupLabel>
          <SidebarMenu>
            {sessions.slice(0, 10).map((session) => (
              <SidebarMenuItem key={session.id}>
                <SidebarMenuButton
                  onClick={() => handleSelectSession(session.id)}
                  isActive={currentSessionId === session.id}
                  className="truncate"
                >
                  <History className="size-4" />
                  <span className="truncate">{session.title}</span>
                </SidebarMenuButton>
                <SidebarMenuAction onClick={(e) => handleDeleteSession(e, session.id)}>
                  <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                </SidebarMenuAction>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/50 p-4">
        <div className="flex flex-col gap-2">
           <SidebarMenuButton size="sm" onClick={() => setSettingsOpen(true)}>
              <Settings className="size-4" /> <span>App Settings</span>
           </SidebarMenuButton>
           <div className="px-2 text-[10px] text-muted-foreground/60">
             Build v1.0.4-phase6
           </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}