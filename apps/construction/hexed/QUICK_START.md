# Quick Start Guide

## Environment Variables Setup

Add this to your Vercel project (or `.env.local` for local development):

```env
# ImgBB - Unlimited Image Storage (FREE)
IMGBB="your_imgbb_api_key"

# Catbox.moe - Unlimited Document Storage (FREE, NO API KEY NEEDED!)
# No configuration required - works automatically!

# Resend - Email Service (Optional)
RESEND_FROM_EMAIL="your-verified-email@domain.com"
```

## Get Your API Key

### ImgBB (Images) - REQUIRED
1. Go to https://api.imgbb.com/
2. Sign up for free account
3. Copy your API key
4. Add as `IMGBB` environment variable

### Catbox.moe (Documents) - NO SETUP NEEDED! ✅
- Works out of the box
- No API key required
- No signup needed
- Just works! 🎉

### Resend (Email) - OPTIONAL
1. Go to https://resend.com
2. Create account
3. Verify your sender email
4. Add as `RESEND_FROM_EMAIL` environment variable

## Add to Vercel

```bash
# Via CLI (only need ImgBB!)
vercel env add IMGBB
vercel env add RESEND_FROM_EMAIL  # optional

# Then redeploy
vercel --prod
```

Or via Vercel Dashboard:
1. Go to your project settings
2. Navigate to Environment Variables
3. Add `IMGBB` for Production
4. Optionally add `RESEND_FROM_EMAIL`
5. Redeploy

## Features Using Unlimited Storage

### ✅ User Avatars
- Settings → Account
- Upload profile picture
- Stored on ImgBB (unlimited)

### ✅ Project Images
- Dashboard → Projects → Create Project
- Add up to 5 images per project
- Site photos, mockups, references
- Stored on ImgBB (unlimited)

### ✅ Document Images
- Dashboard → Documents → Upload Document
- Add up to 5 preview images
- Diagrams, screenshots, references
- Stored on ImgBB (unlimited)

### ✅ Document Files
- Dashboard → Documents → Upload Document
- Upload PDFs, CAD files, any file type
- Up to 200MB per file (4x larger than before!)
- Stored on Catbox.moe (unlimited, no API key!)

### ✅ Transmittal Images
- Dashboard → Transmittals → Create Transmittal
- Add up to 5 images
- Cover sheets, sign-offs, visuals
- Stored on ImgBB (unlimited)

## File Type Support

### ✅ Supported by Catbox (Documents)
- PDFs, images, videos, audio
- Office: .xlsx, .pptx, .odt, .ods
- CAD: .dwg, .dxf
- Archives: .zip, .rar, .7z
- Code files: .js, .py, .java
- Everything except banned types!

### ❌ Banned by Catbox
- .exe, .scr, .cpl, .jar
- .doc, .docx (use PDF instead!)

**Tip:** Convert Word docs to PDF before uploading!

## Database Migrations

After setting up environment variables, run migrations:

```bash
# Generate migration (if schema changed)
npm run db:generate

# Apply migration to database
npm run db:migrate
```

## Test the Setup

1. Sign up with email/password
2. Go to Settings → Account
3. Upload an avatar (tests ImgBB)
4. Create a project with images (tests ImgBB)
5. Upload a PDF document (tests Catbox - no config needed!)
6. Create a transmittal with images (tests ImgBB)

## Troubleshooting

### Images not uploading?
- Check `IMGBB` is set in Vercel environment variables
- Verify API key is correct
- Check browser console for errors

### Documents not uploading?
- Catbox needs no configuration!
- Check file size is under 200MB
- Verify file extension is not banned (.doc, .docx, .exe, etc.)
- Convert .doc/.docx to PDF if needed

### Emails not sending?
- Check `RESEND_FROM_EMAIL` is set
- Verify email is verified in Resend dashboard
- Check `RESEND_API_KEY` is also set

## Cost Summary

| Service | Storage | File Size | API Key | Cost |
|---------|---------|-----------|---------|------|
| Catbox.moe | Unlimited | 200MB | ❌ Not needed | $0/month |
| ImgBB | Unlimited | 32MB | ✅ Required | $0/month |
| Database | Metadata only | N/A | N/A | Varies |

**Total Storage Cost: $0/month forever!** 🎉

## Why This is Amazing

1. **No API Keys for Documents** - Catbox just works!
2. **Larger Files** - 200MB vs 50MB (4x increase!)
3. **Simpler Setup** - Only need ImgBB key
4. **Unlimited Storage** - Both services are unlimited
5. **Zero Cost** - Completely free forever
6. **No Signup** - Catbox needs no account

## Next Steps

1. ✅ Add `IMGBB` to Vercel (only required variable!)
2. ✅ Deploy to Vercel (Catbox works automatically!)
3. ✅ Run database migrations
4. ✅ Test image uploads
5. ✅ Test document uploads (up to 200MB!)
6. ✅ Invite team members
7. ✅ Start managing projects!

## Support

- Catbox: https://catbox.moe/tools.php
- ImgBB: https://api.imgbb.com/
- Resend: https://resend.com/docs

---

**You're all set!** Start uploading unlimited files for free! 🚀

**Pro Tip:** Catbox supports 200MB files with zero configuration. That's 4x larger than GoFile and requires no API key!
