"use client";

import { Camera, Loader2, User } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "../ui/button";

interface AvatarUploadProps {
  currentAvatar?: string | null;
  onAvatarChange: (url: string) => void;
}

export function AvatarUpload({ currentAvatar, onAvatarChange }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentAvatar || "");

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, GIF, or WebP).",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Avatar images must be smaller than 5 MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const data = await response.json();
      setPreviewUrl(data.url);
      onAvatarChange(data.url);

      toast({
        title: "Avatar uploaded",
        description: "Your profile picture has been updated.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <div className="flex size-24 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-muted">
          {previewUrl ? (
            <img src={previewUrl} alt="Avatar" className="size-full object-cover" />
          ) : (
            <User className="size-12 text-muted-foreground" />
          )}
        </div>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute bottom-0 right-0 size-8 rounded-full shadow-md"
          disabled={isUploading}
          onClick={() => document.getElementById("avatar-upload-input")?.click()}
        >
          {isUploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Camera className="size-4" />
          )}
        </Button>
      </div>

      <div className="flex-1 space-y-2">
        <p className="text-sm font-medium">Profile picture</p>
        <p className="text-sm text-muted-foreground">
          Upload a photo to personalize your account. Supports JPEG, PNG, GIF, and WebP up to 5MB.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => document.getElementById("avatar-upload-input")?.click()}
        >
          {isUploading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Camera className="size-4" />
              Change photo
            </>
          )}
        </Button>
      </div>

      <input
        id="avatar-upload-input"
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isUploading}
      />
    </div>
  );
}
