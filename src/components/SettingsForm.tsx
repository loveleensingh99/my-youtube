"use client";

import type { ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { Settings } from "@/types";

interface SettingsFormProps {
  settings: Settings;
  onUpdate: (settings: Partial<Settings>) => void;
  onReset: () => void;
}

export function SettingsForm({ settings, onUpdate, onReset }: SettingsFormProps) {
  return (
    <div id="settings" className="scroll-mt-24 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Feed</CardTitle>
          <CardDescription>Control what appears in your distraction-free feed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <SettingRow
            label="Show videos"
            description="Include standard YouTube videos in your feed."
          >
            <Switch
              checked={settings.showVideos}
              onCheckedChange={(checked) => onUpdate({ showVideos: checked })}
            />
          </SettingRow>
          <SettingRow
            label="Show Shorts"
            description="Include Shorts from your selected channels."
          >
            <Switch
              checked={settings.showShorts}
              onCheckedChange={(checked) => onUpdate({ showShorts: checked })}
            />
          </SettingRow>
          <SettingRow label="Compact mode" description="Use a denser card layout.">
            <Switch
              checked={settings.compactMode}
              onCheckedChange={(checked) => onUpdate({ compactMode: checked })}
            />
          </SettingRow>
          <div className="grid gap-2">
            <Label htmlFor="thumbnailSize">Thumbnail size</Label>
            <Select
              value={settings.thumbnailSize}
              onValueChange={(value: Settings["thumbnailSize"]) =>
                onUpdate({ thumbnailSize: value })
              }
            >
              <SelectTrigger id="thumbnailSize">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="defaultFilter">Default filter</Label>
            <Select
              value={settings.defaultFilter}
              onValueChange={(value: Settings["defaultFilter"]) =>
                onUpdate({ defaultFilter: value })
              }
            >
              <SelectTrigger id="defaultFilter">
                <SelectValue placeholder="Select filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="videos">Videos</SelectItem>
                <SelectItem value="shorts">Shorts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Refresh</CardTitle>
          <CardDescription>Keep your feed up to date automatically.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <SettingRow
            label="Auto refresh"
            description="Periodically fetch the latest uploads."
          >
            <Switch
              checked={settings.autoRefresh}
              onCheckedChange={(checked) => onUpdate({ autoRefresh: checked })}
            />
          </SettingRow>
          <div className="grid gap-2">
            <Label htmlFor="refreshInterval">Refresh interval (minutes)</Label>
            <Input
              id="refreshInterval"
              type="number"
              min={5}
              max={120}
              value={settings.refreshInterval}
              onChange={(event) => {
                const value = Number.parseInt(event.target.value, 10);
                if (!Number.isNaN(value)) {
                  onUpdate({ refreshInterval: value });
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reset</CardTitle>
          <CardDescription>Restore default app settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onReset();
              toast.message("Settings reset to defaults");
            }}
          >
            Reset settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Label>{label}</Label>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
      </div>
      <Separator />
    </>
  );
}
