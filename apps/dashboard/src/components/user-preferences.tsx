"use client";

import { Button } from "@midday/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@midday/ui/dialog";
import { Label } from "@midday/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@midday/ui/switch";
import { Bell, Globe, Layout, Settings } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function UserPreferences() {
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    language: "en",
    timezone: "UTC",
    density: "comfortable",
    showTooltips: true,
  });

  const handleSave = () => {
    toast("Preferences saved successfully");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 size-4" />
          Preferences
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>User Preferences</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="size-4" />
              <span className="font-medium">Notifications</span>
            </div>
            <div className="space-y-3 pl-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notif">Email Notifications</Label>
                <Switch
                  id="email-notif"
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) =>
                    setPreferences({
                      ...preferences,
                      emailNotifications: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notif">Push Notifications</Label>
                <Switch
                  id="push-notif"
                  checked={preferences.pushNotifications}
                  onCheckedChange={(checked) =>
                    setPreferences({
                      ...preferences,
                      pushNotifications: checked,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="size-4" />
              <span className="font-medium">Regional</span>
            </div>
            <div className="space-y-3 pl-6">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={preferences.language}
                  onValueChange={(value) =>
                    setPreferences({ ...preferences, language: value })
                  }
                >
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={preferences.timezone}
                  onValueChange={(value) =>
                    setPreferences({ ...preferences, timezone: value })
                  }
                >
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">
                      Eastern Time
                    </SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Asia/Dubai">Dubai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Layout className="size-4" />
              <span className="font-medium">Interface</span>
            </div>
            <div className="space-y-3 pl-6">
              <div className="space-y-2">
                <Label htmlFor="density">UI Density</Label>
                <Select
                  value={preferences.density}
                  onValueChange={(value) =>
                    setPreferences({ ...preferences, density: value })
                  }
                >
                  <SelectTrigger id="density">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="comfortable">Comfortable</SelectItem>
                    <SelectItem value="spacious">Spacious</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="tooltips">Show Tooltips</Label>
                <Switch
                  id="tooltips"
                  checked={preferences.showTooltips}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, showTooltips: checked })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
