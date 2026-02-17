import React, { useEffect } from "react";
import { PlusCircle, Library, Settings, Sparkles, History, Trash2 } from "lucide-react";
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
import { cn } from "@/lib/utils";
export function AppSidebar(): JSX.Element {
  const activeView = useStore((s) => s.activeView);
  const setActiveView = useStore((s) => s.setActiveView);
  const currentSessionId = useStore((s) => s.currentSessionId);
  const setCurrentSessionId = useStore((s) => s.setCurrentSessionId);
  const sessions = useStore((s) => s.sessions);
  const setSessions = useStore((s) => s.setSessions);
  const setPromptData = useStore((s) => s.setPromptData);
  const fetchSessions = async () => {
    const res = await chatService.listSessions();
    if (res.success && res.data) {
      setSessions(res.data);
    }
  };
  useEffect(() => {
    fetchSessions();
  }, []);
  const handleNewPrompt = async () => {
    const id = crypto.randomUUID();
    const res = await chatService.createSession("New Prompt", id);
    if (res.success) {
      setCurrentSessionId(id);
      setPromptData({ input: "", output: "" });
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
    // In a real app, we'd fetch the messages for this session and populate the editor
    toast.info("Switched session");
  };
  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const res = await chatService.deleteSession(id);
    if (res.success) {
      fetchSessions();
      if (currentSessionId === id) {
        setCurrentSessionId(null);
      }
      toast.success("Session deleted");
    }
  };
  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="border-b border-border/50 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-none">Architect</span>
            <span className="text-2xs text-muted-foreground">Prompt Studio</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={handleNewPrompt}
                tooltip="New Prompt"
              >
                <PlusCircle /> <span>New Prompt</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => setActiveView("library")}
                isActive={activeView === "library"}
                tooltip="Library"
              >
                <Library /> <span>Library</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Recent History</SidebarGroupLabel>
          <SidebarMenu>
            {sessions.map((session) => (
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
            {sessions.length === 0 && (
              <div className="px-4 py-2 text-xs text-muted-foreground italic">
                No recent prompts
              </div>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/50 p-4">
        <div className="flex flex-col gap-2">
           <SidebarMenuButton size="sm">
              <Settings className="size-4" /> <span>Settings</span>
           </SidebarMenuButton>
           <div className="px-2 text-[10px] text-muted-foreground/60">
             v1.0.0-beta
           </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}