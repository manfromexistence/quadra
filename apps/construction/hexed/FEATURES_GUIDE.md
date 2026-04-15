# EDMS Features Guide

Complete guide to all enabled features in the Construction EDMS platform.

## 🔍 Search

**Location:** `/dashboard/search`

**Features:**
- Global search across all EDMS entities
- Search by document number, title, project name, workflow, or transmittal
- Real-time results with category badges
- Direct links to matching records

**How to use:**
1. Navigate to Search from the dashboard
2. Enter your search query
3. Results show with category (Project, Document, Workflow, Transmittal)
4. Click any result to open the full record

## 📋 Workflows

**Location:** `/dashboard/workflows`

**Features:**
- Multi-level document review and approval workflows
- Automatic document status updates
- Step-by-step approval routing
- Comments and decision tracking
- Due date management

**Workflow Steps:**
- **Technical Review** - Initial review by assigned reviewer
- **Final Approval** - Optional approval by client/PMC

**Actions:**
- **Approve** - Move document to next step or mark as approved
- **Reject** - Reject document and stop workflow
- **Comment** - Add review notes without changing status

**Button States:**
- **Enabled** - You are assigned to this step and can act
- **Disabled** - Not assigned to you or already completed

**How to create a workflow:**
1. Click "Create workflow" button
2. Select document to review
3. Choose reviewer and optional approver
4. Set due date (optional)
5. Submit to start routing

## 📤 Transmittals

**Location:** `/dashboard/transmittals`

**Features:**
- Formal document issue packages
- Recipient tracking
- Acknowledgement management
- Document bundling
- Status tracking (Draft, Sent, Acknowledged)

**How to create a transmittal:**
1. Click "Create transmittal" button
2. Select project
3. Choose recipient
4. Add subject and purpose
5. Select documents to include
6. Add images (up to 5) to showcase unlimited storage
7. Send package

**Acknowledgement:**
- Recipients can acknowledge receipt
- Button enabled only for assigned recipients
- Automatic status update on acknowledgement

## 🔔 Notifications

**Location:** `/dashboard/notifications`

**Features:**
- Centralized notification inbox
- Workflow alerts (review requests, approvals, rejections)
- Transmittal notifications (sent, acknowledged)
- Document status changes
- Mark as read functionality
- Bulk mark all as read

**Notification Types:**
- **Review Request** - You've been assigned to review a document
- **Approval Decision** - Document you submitted was approved/rejected
- **Transmittal Sent** - Package was sent to you
- **Transmittal Acknowledged** - Recipient acknowledged your package
- **Document Status** - Document status changed

**Actions:**
- **Open** - Navigate to related entity
- **Mark Read** - Mark single notification as read
- **Mark All Read** - Clear all unread notifications

## 🎯 Button States Explained

### Why are some buttons disabled?

**Workflow "Act on step" button:**
- ✅ **Enabled** when:
  - You are assigned as the reviewer/approver for this step
  - The step status is "in_progress"
  - You have vendor role or higher
- ❌ **Disabled** when:
  - Step is assigned to someone else
  - Step is already completed (approved/rejected)
  - You don't have permission

**Transmittal "Acknowledge" button:**
- ✅ **Enabled** when:
  - You are the designated recipient
  - Transmittal status is "sent"
  - Not yet acknowledged
- ❌ **Disabled** when:
  - You are not the recipient
  - Already acknowledged
  - Transmittal is still in draft

**Notification "Mark Read" button:**
- ✅ **Enabled** when notification is unread
- ❌ **Disabled** when already marked as read

## 📊 Metrics Dashboard

Each page shows relevant metrics:

**Workflows:**
- Total workflows
- Pending steps
- Approved documents
- Unread notifications

**Transmittals:**
- Total transmittals
- Sent packages
- Acknowledged packages
- Unread notifications

**Notifications:**
- Unread alerts
- Pending workflows

## 🔐 Role-Based Access

**User Roles (lowest to highest):**
1. **User** - View only, can acknowledge transmittals addressed to them
2. **Subcontractor** - Can acknowledge, limited workflow actions
3. **Vendor** - Can create documents, workflows, transmittals
4. **PMC** - Project management, can create projects
5. **Client** - Full access to assigned projects
6. **Admin** - Full system access

**Permission Matrix:**

| Action | User | Vendor | PMC | Client | Admin |
|--------|------|--------|-----|--------|-------|
| View documents | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create documents | ❌ | ✅ | ✅ | ✅ | ✅ |
| Create workflows | ❌ | ✅ | ✅ | ✅ | ✅ |
| Act on assigned workflows | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create transmittals | ❌ | ✅ | ✅ | ✅ | ✅ |
| Acknowledge transmittals | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create projects | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ❌ | ❌ | ✅ |

## 💾 Storage Features

**Unlimited Storage:**
- **Catbox.moe** - Documents up to 200MB (FREE, no API key)
- **ImgBB** - Images up to 32MB (FREE, requires API key)
- **Telegram Bot API** - Up to 50MB documents, 10MB photos (FREE, optional)

**Database Optimization:**
- URLs truncated before storage (~40-60 chars saved per URL)
- Only file IDs stored in database
- Full URLs reconstructed on client side
- Neon DB free tier lasts much longer

**Image Galleries:**
- Up to 5 images per project
- Up to 5 images per document
- Up to 5 images per transmittal
- Thumbnail previews in lists
- Full galleries on detail pages
- Click to view full resolution

## 🚀 Quick Start

1. **Create a Project**
   - Go to Projects → Create Project
   - Add project details and images
   - Assign team members

2. **Upload Documents**
   - Go to Documents → Create Document
   - Select project
   - Upload file (Catbox handles storage)
   - Add preview images (ImgBB)
   - Set metadata (discipline, category, revision)

3. **Start a Workflow**
   - Go to Workflows → Create Workflow
   - Select document
   - Assign reviewer
   - Optional: Add final approver
   - Set due date

4. **Review Documents**
   - Go to Workflows
   - Find your assigned steps (enabled buttons)
   - Click "Act on step"
   - Choose: Approve, Reject, or Comment
   - Add notes
   - Submit decision

5. **Send Transmittals**
   - Go to Transmittals → Create Transmittal
   - Select project and recipient
   - Add documents
   - Add images
   - Send package

6. **Manage Notifications**
   - Go to Notifications
   - Review alerts
   - Click "Open" to view related items
   - Mark as read when done
   - Use "Mark all read" to clear inbox

## 🔧 Troubleshooting

**"Button is disabled"**
- Check if you're assigned to the task
- Verify your role has permission
- Ensure the item hasn't been completed already

**"No results in search"**
- Try different keywords
- Check spelling
- Search by document number or project name

**"Can't create workflow/transmittal"**
- Verify you have vendor role or higher
- Check if documents exist in the project
- Ensure project has team members assigned

**"Images not loading"**
- Check IMGBB environment variable is set
- Verify image URLs are valid
- Check browser console for errors

## 📝 Best Practices

1. **Use descriptive document titles** - Makes search more effective
2. **Add comments to workflow decisions** - Provides context for team
3. **Set realistic due dates** - Helps track progress
4. **Acknowledge transmittals promptly** - Keeps project moving
5. **Review notifications regularly** - Stay informed on project activity
6. **Add images to documents** - Showcase unlimited storage capability
7. **Use proper document numbering** - Maintains organization

## 🎨 UI Features

**Document Preview Popover:**
- Click document thumbnail or title
- View images and metadata
- Quick actions (View Details, Open File)
- No page navigation needed

**Toast Notifications:**
- Appear at top-right
- Success/error feedback
- Auto-dismiss after 5 seconds

**Select Components:**
- Proper padding for dropdown icon
- Smooth animations
- Keyboard accessible

**Image Galleries:**
- Responsive grid layout
- Hover effects
- Click to open full size
- Lazy loading for performance

## 🔄 Status Flow

**Document Status:**
1. Draft → Submitted → Under Review → Approved/Rejected

**Workflow Status:**
1. In Progress → Approved/Rejected

**Transmittal Status:**
1. Draft → Sent → Acknowledged

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review role permissions
3. Verify environment variables are set
4. Check browser console for errors
5. Contact system administrator

---

**Last Updated:** April 2, 2026
**Version:** 1.0.0
