# Deployment Checklist

## Required Environment Variables

Add these to your Vercel project settings:

### 1. Catbox.moe (Document Storage)
✅ **NO CONFIGURATION NEEDED!**

Catbox works out of the box with anonymous uploads. No API key required!

- Provides unlimited document storage (free)
- Supports up to 200MB per file
- Any file type except .exe, .scr, .cpl, .doc, .docx, .jar

### 2. ImgBB (Image Storage)
```
IMGBB=your_key_from_api.imgbb.com
```
- Sign up at https://api.imgbb.com/
- Get API key from dashboard
- Provides unlimited image hosting

### 3. Email (Optional but Recommended)
```
RESEND_FROM_EMAIL=your-verified-email@domain.com
```
- Verify sender email in Resend dashboard
- Required for password reset emails

## Quick Setup Commands

### Add to Vercel via CLI:
```bash
vercel env add IMGBB
vercel env add RESEND_FROM_EMAIL
```

### Or via Vercel Dashboard:
1. Go to your project settings
2. Navigate to Environment Variables
3. Add `IMGBB` for Production environment
4. Optionally add `RESEND_FROM_EMAIL`
5. Redeploy the project

## What Changed

✅ Removed dependency on Vercel Blob (paid after 500MB)
✅ Removed dependency on GoFile (required API key)
✅ Added Catbox.moe for unlimited document storage (free, no API key!)
✅ Added ImgBB for unlimited image storage (free)
✅ Commented out OAuth buttons (Google/GitHub)
✅ Email/password authentication works without OAuth
✅ Increased file size limit from 50MB to 200MB

## Testing After Deployment

1. Sign up with email/password
2. Try uploading a document in EDMS (up to 200MB!)
3. Try uploading an avatar image
4. Test password reset flow
5. Create a project with images
6. Upload a document with preview images

## Cost Savings

- Before: Vercel Blob ($0.15/GB after 500MB)
- After: Catbox + ImgBB (unlimited free, no API keys!)
- Savings: 100% on storage costs! 🎉

## File Type Support

### ✅ Supported by Catbox
- PDFs, images, videos, audio
- Office: .xlsx, .pptx, .odt
- CAD: .dwg, .dxf
- Archives: .zip, .rar, .7z
- Everything except banned types!

### ❌ Banned by Catbox
- .exe, .scr, .cpl, .jar
- .doc, .docx (use PDF instead!)

## Advantages Over GoFile

| Feature | Catbox | GoFile |
|---------|--------|--------|
| API Key | ❌ Not needed | ✅ Required |
| File Size | 200MB | 50MB |
| Setup Time | 0 minutes | 5 minutes |
| Complexity | Dead simple | More complex |
| Storage | Unlimited | Unlimited |

## Environment Variable Summary

```env
# Required
IMGBB="your_imgbb_api_key"

# Optional
RESEND_FROM_EMAIL="your-verified-email@domain.com"

# Not needed anymore!
# GOFILE_API_TOKEN - Removed, using Catbox instead
# BLOB_READ_WRITE_TOKEN - Removed, using free services
```

## Deployment Steps

1. ✅ Push code to GitHub (auto-deploys to Vercel)
2. ✅ Add `IMGBB` to Vercel environment variables
3. ✅ Optionally add `RESEND_FROM_EMAIL`
4. ✅ Wait for deployment to complete
5. ✅ Test file uploads (documents and images)
6. ✅ Celebrate unlimited free storage! 🎉

## Support Links

- Catbox: https://catbox.moe/tools.php
- ImgBB: https://api.imgbb.com/
- Resend: https://resend.com/docs
