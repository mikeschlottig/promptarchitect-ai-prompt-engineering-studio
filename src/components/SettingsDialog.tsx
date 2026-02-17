import React from 'react';
import { useStore } from '@/lib/store';
import { chatService } from '@/lib/chat';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  const [localSettings, setLocalSettings] = React.useState(settings);
  const handleSave = async () => {
    setSettings(localSettings);
    try {
      await chatService.updateConfig(
        localSettings.baseUrl,
        localSettings.apiKey,
        localSettings.model
      );
      toast.success('Settings saved and synced');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to sync settings with agent');
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Provider Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="baseUrl">Base URL (AI Gateway / OpenRouter)</Label>
            <Input
              id="baseUrl"
              value={localSettings.baseUrl}
              onChange={(e) => setLocalSettings({ ...localSettings, baseUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={localSettings.apiKey}
              onChange={(e) => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
              placeholder="sk-..."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="model">Model Name</Label>
            <Input
              id="model"
              value={localSettings.model}
              onChange={(e) => setLocalSettings({ ...localSettings, model: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}