# Storage Configuration Guide

This application uses **100% FREE unlimited storage** for all file uploads:

## Storage Services Overview

| Service | Purpose | Storage Limit | File Size | API Key | Cost |
|---------|---------|---------------|-----------|---------|------|
| **Catbox.moe** | Documents, PDFs, any files | ✅ UNLIMITED | 200 MB | ❌ Not needed | FREE |
| **ImgBB** | Images, avatars, photos | ✅ UNLIMITED | 32 MB | ✅ Required | FREE |
| **Database** | Metadata only (not files) | Depends on host | N/A | N/A | Varies |

---

## 1. Catbox.moe (Document Storage)

**Purpose:** Unlimited storage for EDMS documents, project files, PDFs, and any file type

**Setup:**
✅ **NO SETUP REQUIRED!** Catbox works out of the box with anonymous uploads.

**Features:**
- ✅ Unlimited storage (completely free)
- ✅ Up to 200MB per file (4x larger than GoFile!)
- ✅ No API key needed
- ✅ Any file type supported (except .exe, .scr, .cpl, .doc, .docx, .jar)
- ✅ Permanent storage
- ✅ Direct download links
- ✅ No bandwidth limits
- ✅ User-funded, no ads

**Restrictions:**
- ⚠️ Cannot upload: .exe, .scr, .cpl, .doc, .docx, .jar files
- ✅ PDFs, images, videos, .xlsx, .pptx, .dwg, .zip, etc. are all fine!
- ⚠️ Not for commercial CDN use without approval

**API Documentation:** https://catbox.moe/tools.php

---

## 2. ImgBB (Image Storage)

**Purpose:** User avatars, profile images, project photos, document preview images

**Setup:**
1. Go to [api.imgbb.com](https://api.imgbb.com/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add to `.env`:
   ```
   IMGBB="your_api_key_here"
   ```

**Features:**
- ✅ Unlimited image hosting (completely free)
- ✅ Up to 32MB per image
- ✅ Automatic thumbnail generation
- ✅ Direct image URLs
- ✅ Optional expiration (60 seconds to 180 days)
- ✅ Supports JPEG, PNG, GIF, WebP

**API Documentation:** https://api.imgbb.com/

---

## New Features: Image Cards

Both projects and documents now support image cards:

### Project Images
- Add site photos, design mockups, or visual references
- Up to 5 images per project
- Displayed as beautiful image cards
- Stored on ImgBB (unlimited free)

### Document Images
- Add preview images, diagrams, or visual references
- Up to 5 images per document
- Perfect for quick visual identification
- Stored on ImgBB (unlimited free)

---

## Environment Variables

Add this to your `.env` file:

```env
# ImgBB for image storage (UNLIMITED FREE)
IMGBB="your_imgbb_key"

# Catbox.moe for document storage (UNLIMITED FREE, NO API KEY NEEDED!)
# No configuration required - works automatically!
```

---

## Usage in Code

### Document Upload (Catbox)
```typescript
import { uploadEdmsFile } from "@/lib/edms/storage-catbox";

const result = await uploadEdmsFile({
  file: myFile,
  projectId: "project-123",
  folder: "documents"
});
```

### Image Upload (ImgBB)
```typescript
import { uploadAvatarImage } from "@/lib/storage-imgbb";

const imageUrl = await uploadAvatarImage(avatarFile);
```

### Image Cards Component
```typescript
import { ImageCardUpload } from "@/components/edms/image-card-upload";

<ImageCardUpload
  value={images}
  onChange={setImages}
  maxImages={5}
  label="Project images"
/>
```

---

## API Endpoints

### Document Upload
- **Endpoint:** `POST /api/edms/uploads`
- **Auth:** Required
- **Max Size:** 200MB
- **Storage:** Catbox.moe (unlimited, no API key)
- **Banned:** .exe, .scr, .cpl, .doc, .docx, .jar

### Image Upload
- **Endpoint:** `POST /api/upload/avatar`
- **Auth:** Required
- **Max Size:** 5MB (images), 32MB (max supported)
- **Formats:** JPEG, PNG, GIF, WebP
- **Storage:** ImgBB (unlimited)

---

## Migration from Vercel Blob

If you were previously using Vercel Blob storage:

1. Remove `BLOB_READ_WRITE_TOKEN` from environment variables
2. Add `IMGBB` environment variable
3. Catbox needs no configuration!
4. Existing file URLs will continue to work
5. New uploads will use Catbox/ImgBB

---

## Cost Comparison

| Service | Free Tier | File Size | API Key | Monthly Cost |
|---------|-----------|-----------|---------|--------------|
| **Catbox.moe** | ✅ Unlimited storage | 200MB | ❌ Not needed | $0 |
| **ImgBB** | ✅ Unlimited images | 32MB | ✅ Required | $0 |
| **GoFile** | ✅ Unlimited storage | 50MB | ✅ Required | $0 |
| **Vercel Blob** | 500MB free | No limit | ✅ Required | $15+ for 100GB |

**Result:** Save $180+/year with unlimited free storage! 🎉

---

## Why Catbox is Better

1. **No API Key** - Works immediately, no signup needed
2. **Larger Files** - 200MB vs 50MB (GoFile)
3. **Simpler API** - Just POST the file, get back URL
4. **Permanent Storage** - Files never expire
5. **User-Funded** - No ads, no tracking
6. **Reliable** - Been around since 2014

---

## File Type Support

### ✅ Supported (Catbox)
- PDFs, images, videos, audio
- Office files: .xlsx, .pptx, .odt, .ods
- CAD files: .dwg, .dxf
- Archives: .zip, .rar, .7z
- Code: .js, .py, .java, .cpp
- And basically everything else!

### ❌ Not Supported (Catbox)
- Executables: .exe, .scr, .cpl, .jar
- Old Word docs: .doc, .docx (use PDF instead!)

---

## Database Storage

The database only stores:
- Metadata (titles, descriptions, tags)
- Image URLs (not the actual images)
- File URLs (not the actual files)
- User data and relationships

This keeps your database small and fast, while files are stored on specialized free services.

---

## Troubleshooting

### Document upload fails?
- Check file size is under 200MB
- Verify file extension is not banned (.doc, .docx, .exe, etc.)
- Convert .doc/.docx to PDF if needed
- Check browser console for errors

### Images not uploading?
- Check `IMGBB` is set in environment variables
- Verify API key is correct
- Check file size is under 5MB (or 32MB max)
- Ensure file is JPEG, PNG, GIF, or WebP

---

## Summary

**Setup Required:**
- ✅ ImgBB API key (for images)
- ❌ Catbox API key (not needed!)

**Total Cost:** $0/month forever

**Total Storage:** Unlimited for both services

**Setup Time:** 2 minutes (just get ImgBB key)
