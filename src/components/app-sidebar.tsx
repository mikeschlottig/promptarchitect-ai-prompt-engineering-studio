import React from "react";
import { PlusCircle, Library, Settings, Sparkles, History } from "lucide-react";
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
} from "@/components/ui/sidebar";
export function AppSidebar(): JSX.Element {
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
              <SidebarMenuButton tooltip="New Prompt" isActive>
                <PlusCircle /> <span>New Prompt</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Library">
                <Library /> <span>Library</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="History">
                <History /> <span>History</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
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