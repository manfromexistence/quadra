# Unlimited Storage Features 🎉

This application showcases **100% FREE unlimited storage** using GoFile and ImgBB!

## Storage Services

| Service | Purpose | Limit | Cost |
|---------|---------|-------|------|
| **GoFile** | Documents, PDFs, any files | ✅ UNLIMITED | FREE |
| **ImgBB** | Images, photos, avatars | ✅ UNLIMITED | FREE |

---

## Image Cards Everywhere! 📸

We've added image upload capabilities throughout the application to showcase the unlimited ImgBB storage:

### 1. User Profile Avatar
**Location:** Settings → Account

- Upload profile picture
- Supports JPEG, PNG, GIF, WebP
- Up to 5MB per image
- Stored on ImgBB (unlimited)
- Beautiful circular avatar display

### 2. Project Images
**Location:** Dashboard → Projects → Create Project

- Add up to 5 images per project
- Site photos, design mockups, visual references
- Beautiful image card grid display
- Hover to remove images
- Perfect for visual project identification

**Use Cases:**
- Construction site progress photos
- Architectural renderings
- Floor plans and layouts
- Before/after comparisons
- Team photos

### 3. Document Images
**Location:** Dashboard → Documents → Upload Document

- Add up to 5 images per document
- Preview images, diagrams, visual references
- Quick visual identification of documents
- Supplement PDF documents with images

**Use Cases:**
- Document preview thumbnails
- Technical diagrams
- Markup screenshots
- Reference photos
- Approval stamps/signatures

### 4. Transmittal Images
**Location:** Dashboard → Transmittals → Create Transmittal

- Add up to 5 images per transmittal
- Cover sheets, sign-offs, supporting visuals
- Track visual evidence of transmissions
- Professional document packages

**Use Cases:**
- Signed cover sheets
- Delivery receipts
- Package contents photos
- Approval signatures
- Supporting documentation

---

## Technical Implementation

### Image Card Upload Component
```typescript
<ImageCardUpload
  value={images}
  onChange={setImages}
  maxImages={5}
  label="Project images"
  helperText="Add site photos or design mockups"
/>
```

### Features:
- ✅ Drag and drop support
- ✅ Multiple file selection
- ✅ Real-time upload progress
- ✅ Image preview grid
- ✅ Remove images on hover
- ✅ Automatic validation
- ✅ Error handling with toast notifications

### Avatar Upload Component
```typescript
<AvatarUpload
  currentAvatar={avatarUrl}
  onAvatarChange={setAvatarUrl}
/>
```

### Features:
- ✅ Circular avatar display
- ✅ Camera icon overlay
- ✅ Click to upload
- ✅ Real-time preview
- ✅ File type validation
- ✅ Size validation (5MB)

---

## Database Schema

All images are stored as JSON arrays of URLs:

```sql
-- Projects table
ALTER TABLE "projects" ADD COLUMN "images" text;

-- Documents table
ALTER TABLE "documents" ADD COLUMN "images" text;

-- Transmittals table
ALTER TABLE "transmittals" ADD COLUMN "images" text;

-- User table (already has image column)
-- image column stores single avatar URL
```

---

## API Endpoints

### Image Upload
```
POST /api/upload/avatar
Content-Type: multipart/form-data

Body:
- file: File (JPEG, PNG, GIF, WebP)

Response:
{
  "url": "https://i.ibb.co/...",
  "fileName": "avatar-1234567890.jpg",
  "fileSize": 123456
}
```

### Document Upload
```
POST /api/edms/uploads
Content-Type: multipart/form-data

Body:
- file: File (any type)
- projectId: string
- folder: "documents" | "versions"

Response:
{
  "fileName": "document.pdf",
  "fileType": "pdf",
  "fileUrl": "https://gofile.io/...",
  "fileSize": 1234567,
  "pathname": "project-id/documents/document.pdf"
}
```

---

## Benefits

### For Users
1. **Unlimited Storage** - Never worry about storage limits
2. **Visual Organization** - Quickly identify projects and documents
3. **Professional Presentation** - Beautiful image cards
4. **Fast Loading** - ImgBB CDN for quick image delivery
5. **No Costs** - Completely free forever

### For Developers
1. **Simple Integration** - Easy API calls
2. **No Infrastructure** - No need to manage storage servers
3. **Automatic Thumbnails** - ImgBB generates thumbnails
4. **Direct URLs** - No complex signed URLs
5. **Reliable** - 99.9% uptime

---

## Cost Savings

### Traditional Approach (Vercel Blob)
- Free tier: 500MB
- After 500MB: $0.15/GB
- 100GB storage: $15/month = $180/year
- 1TB storage: $150/month = $1,800/year

### Our Approach (GoFile + ImgBB)
- Free tier: UNLIMITED
- After unlimited: Still FREE
- 100GB storage: $0/month = $0/year
- 1TB storage: $0/month = $0/year
- 10TB storage: $0/month = $0/year

**Annual Savings: $180 - $1,800+ per year!** 💰

---

## Usage Examples

### Creating a Project with Images
1. Go to Dashboard → Projects
2. Click "Create project"
3. Fill in project details
4. Click "Add image" in the Images section
5. Select up to 5 images
6. Images upload automatically to ImgBB
7. See beautiful image card grid
8. Hover over images to remove if needed
9. Submit project

### Uploading Profile Avatar
1. Go to Settings → Account
2. Click camera icon on avatar
3. Select image file
4. Image uploads to ImgBB
5. Avatar updates immediately
6. Save profile

### Adding Document Images
1. Go to Dashboard → Documents
2. Click "Upload document"
3. Fill in document details
4. Upload main PDF to GoFile
5. Add preview images via ImgBB
6. Submit document

---

## Future Enhancements

Potential areas to add more image support:

1. **Workflow Steps** - Add images to approval steps
2. **Comments** - Attach images to document comments
3. **Activity Log** - Visual activity timeline
4. **User Gallery** - Team photo gallery
5. **Project Timeline** - Visual project milestones
6. **Document Versions** - Version comparison images
7. **Notifications** - Image previews in notifications
8. **Dashboard Widgets** - Image-based widgets

---

## Environment Setup

Add to your `.env` file:

```env
# ImgBB for unlimited image storage
IMGBB="your_imgbb_api_key_here"

# GoFile for unlimited document storage
GOFILE_API_TOKEN="your_gofile_token_here"
```

Get your keys:
- ImgBB: https://api.imgbb.com/
- GoFile: https://gofile.io (Profile → API Token)

---

## Conclusion

By leveraging free unlimited storage services, we've created a rich, visual application without any storage costs. Users can upload as many images as they want, making the EDMS more intuitive and professional.

**Total Storage Cost: $0/month forever!** 🎉
