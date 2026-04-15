# QUADRA

> Electronic Document Management System for Construction Projects

![Next.js](https://img.shields.io/badge/Next.js-16.2.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🏗️ Overview

Construction is a modern Electronic Document Management System (EDMS) specifically designed for civil construction projects. It enables Clients, PMC (Project Management Consultants), Vendors, and Subcontractors to upload, review, approve, and track project documents efficiently.

## ✨ Key Features

### 🔐 User Management & Authentication
- Secure user registration and login
- Role-based access control (Client, PMC, Vendor, Subcontractor, Admin)
- OAuth integration (Google, GitHub)
- Password reset via email
- JWT-based authentication

### 📁 Project Management
- Create and manage multiple construction projects
- Assign users to specific projects
- Define user roles per project
- Project-wise dashboards

### 📄 Document Control
- Upload documents (PDF, Word, Excel, CAD drawings)
- Version control system
- Automated document numbering
- Rich metadata fields:
  - Document Title
  - Document Number
  - Revision
  - Discipline
  - Status
  - Upload Date
- Document preview and download
- Advanced search and filtering

### 🔄 Document Workflow
- Submit documents for review
- Multi-level review workflow
- Approve / Reject / Comment functionality
- Real-time status tracking:
  - Draft
  - Submitted
  - Under Review
  - Approved
  - Rejected
- Complete comment history

### 📮 Transmittal Module
- Create and manage transmittals
- Attach multiple documents
- Send to project parties
- Track acknowledgements

### 📊 Dashboard & Analytics
- Project-wise dashboard
- Document status summary
- Pending approvals overview
- Activity log
- Real-time notifications

### 🔔 Notifications
- Email notifications for:
  - Document submission
  - Review requests
  - Approval/Rejection
  - Comments and updates

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16.2.1 with Turbopack
- **Language:** TypeScript 5.x
- **UI Library:** React 19
- **Styling:** Tailwind CSS
- **Components:** shadcn-ui
- **Forms:** React Hook Form + Zod validation
- **State Management:** Zustand

### Backend
- **Runtime:** Node.js
- **API:** Next.js API Routes
- **Authentication:** Better Auth
- **Database:** PostgreSQL (Neon)
- **ORM:** Drizzle ORM
- **File Storage:** Vercel Blob / S3 (configurable)

### Development Tools
- **Linting:** Biome
- **Type Checking:** TypeScript
- **Git Hooks:** Husky
- **Package Manager:** Bun / pnpm

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database (Neon recommended)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd construction-edms
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your credentials:
   ```env
   # Database
   DATABASE_URL="your-postgresql-connection-string"

   # Authentication
   BETTER_AUTH_SECRET="your-secret-key"
   GITHUB_CLIENT_ID="your-github-oauth-id"
   GITHUB_CLIENT_SECRET="your-github-oauth-secret"
   GOOGLE_CLIENT_ID="your-google-oauth-id"
   GOOGLE_CLIENT_SECRET="your-google-oauth-secret"

   # File Storage (optional)
   BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
   ```

4. **Set up the database**
   ```bash
   bun run db:generate
   bun run db:migrate
   ```

5. **Run the development server**
   ```bash
   bun run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
construction-edms/
├── app/                      # Next.js app directory
│   ├── (auth)/              # Authentication pages
│   ├── (dashboard)/         # Dashboard pages
│   ├── api/                 # API routes
│   ├── projects/            # Project management
│   ├── documents/           # Document control
│   ├── workflows/           # Workflow management
│   └── transmittals/        # Transmittal module
├── components/              # React components
│   ├── ui/                  # shadcn-ui components
│   ├── dashboard/           # Dashboard components
│   ├── documents/           # Document components
│   └── workflows/           # Workflow components
├── lib/                     # Utility functions
│   ├── db/                  # Database utilities
│   ├── auth/                # Authentication utilities
│   └── utils/               # Helper functions
├── db/                      # Database schema
│   ├── schema/              # Drizzle schema files
│   └── migrations/          # Database migrations
├── public/                  # Static assets
├── types/                   # TypeScript type definitions
└── scripts/                 # Build and utility scripts
```

## 👥 User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **Admin** | System administrator | Full access to all features |
| **Client** | Project owner | View all documents, approve final submissions |
| **PMC** | Project Management Consultant | Review and approve documents, manage workflows |
| **Vendor** | External vendor | Upload and view assigned documents |
| **Subcontractor** | Subcontractor | Upload and view assigned documents |

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Secure file storage
- SQL injection prevention (Drizzle ORM)
- XSS protection
- CSRF protection
- Rate limiting
- Encrypted passwords (bcrypt)

## 📝 Development Workflow

1. Check `TODO.md` for current tasks
2. Create a feature branch
3. Make your changes
4. Run linting: `bun run check`
5. Test your changes
6. Update `CHANGELOG.md`
7. Submit a pull request

## 🧪 Testing

```bash
# Run linting
bun run lint

# Run type checking
bun run type-check

# Run all checks
bun run check
```

## 📦 Building for Production

```bash
# Build the application
bun run build

# Start production server
bun run start
```

## 🌐 Deployment

The application is optimized for deployment on:
- Vercel (recommended)
- AWS
- Google Cloud Platform
- Any Node.js hosting platform

### Vercel Deployment

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

## 📚 Documentation

- [User Guide](./docs/USER_GUIDE.md) - Coming soon
- [Admin Guide](./docs/ADMIN_GUIDE.md) - Coming soon
- [API Documentation](./docs/API.md) - Coming soon
- [Development Guide](./docs/DEVELOPMENT.md) - Coming soon

## 🗺️ Roadmap

See [TODO.md](./TODO.md) for detailed development roadmap.

### Phase 1: MVP (Current)
- ✅ Project setup and branding
- 🔄 Database schema design
- 🔄 Core UI components
- ⏳ User management enhancement
- ⏳ Project management module
- ⏳ Document control module

### Phase 2: Advanced Features
- Document workflow automation
- Transmittal module
- Advanced search and filters
- Email notifications
- Activity logging

### Phase 3: Enterprise Features
- Multi-organization support
- Advanced analytics
- Custom workflows
- API for integrations
- Mobile app

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn-ui](https://ui.shadcn.com/)
- Database by [Neon](https://neon.tech/)
- Authentication by [Better Auth](https://www.better-auth.com/)

## 📞 Support

For support, email support@construction-edms.com or join our Slack channel.

---

**QUADRA** - Streamlining construction document management, one project at a time.
