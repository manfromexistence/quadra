# QUADRA Construction EDMS

> Electronic Document Management System for Construction Projects

A modern, production-ready EDMS platform built with Next.js 16, React 19, and TypeScript for managing construction project documentation, workflows, and transmittals with role-based access control.

## 🚀 Features

### ✅ Implemented
- **Document Management** - Upload, version control, status tracking, PDF preview
- **Workflow System** - Multi-step approvals with approve/reject/comment functionality
- **Role-Based Access Control** - 6 role levels (admin, client, pmc, vendor, subcontractor, user)
- **Project Management** - Projects, members, assignments, and collaboration
- **Transmittal System** - Formal document packages and acknowledgement tracking
- **Notification System** - In-app notifications + email alerts (Resend)
- **Activity Logging** - Complete audit trail of all actions
- **Authentication** - OAuth with Google and GitHub (Better Auth)
- **Theme System** - Dark/light mode with custom themes

### 🚧 In Progress
- **Admin User Management** - Edit roles, manage users, bulk operations
- **Analytics Dashboard** - Charts and metrics for system insights
- **Advanced Search** - Full-text search with filters
- **User Statistics** - Activity tracking and reporting

## 🛠️ Tech Stack

- **Framework:** Next.js 16.2.1 with App Router
- **UI:** React 19.2.4, TypeScript 5.9.3
- **Database:** PostgreSQL (Neon) with Drizzle ORM 0.42
- **Auth:** Better Auth 1.5.6 (OAuth: Google, GitHub)
- **Styling:** Tailwind CSS 4.2, Shadcn UI, Radix UI
- **Forms:** React Hook Form 7.72, Zod 3.25
- **AI:** Google Generative AI, Groq
- **Storage:** ImgBB (images), Vercel Blob (documents)
- **Email:** Resend
- **Runtime:** Bun (preferred) or Node.js

## 📦 Installation

```bash
# Clone repository
git clone <repository-url>
cd construction

# Install dependencies
npm install
# or
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Push database schema
npm run db:push

# Start development server
npm run dev
# or
bun dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🔑 Environment Variables

Required variables in `.env.local`:

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
BETTER_AUTH_SECRET="your-secret-key"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI (Optional)
GOOGLE_API_KEY="your-google-api-key"
GROQ_API_KEY="your-groq-api-key"

# Storage
IMGBB="your-imgbb-api-key"

# Email
RESEND="your-resend-api-key"
```

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter
npm run format       # Format code

# Database
npm run db:push      # Push schema to database
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio
```

## 🏗️ Project Structure

```
construction/
├── app/                    # Next.js App Router
│   ├── dashboard/          # Main EDMS dashboard
│   │   ├── admin/          # Admin pages
│   │   ├── documents/      # Document management
│   │   ├── workflows/      # Workflow management
│   │   ├── projects/       # Project management
│   │   └── transmittals/   # Transmittal management
│   ├── api/                # API routes
│   └── auth/               # Authentication pages
├── actions/                # Server actions
├── components/             # React components
│   ├── edms/               # EDMS-specific components
│   └── ui/                 # Shadcn UI components
├── lib/                    # Utility libraries
│   ├── edms/               # EDMS business logic
│   └── auth.ts             # Auth configuration
├── db/                     # Database
│   ├── schema/             # Drizzle schemas
│   └── index.ts            # Database connection
├── types/                  # TypeScript types
├── hooks/                  # React hooks
└── hexed/                  # Documentation
```

## 👥 User Roles

1. **Admin** - Full system access, user management
2. **Client** - Project owner, final approvals
3. **PMC** - Project management consultant
4. **Vendor** - Contractor, document submission
5. **Subcontractor** - Sub-contractor access
6. **User** - Basic read-only access

## 🔐 Security

- Role-based access control (RBAC)
- OAuth authentication
- Input validation with Zod
- SQL injection prevention (Drizzle ORM)
- Activity logging and audit trail
- Secure file uploads

## 📚 Documentation

- `AGENTS.md` - AI agent instructions
- `hexed/AGENT.md` - Detailed implementation guide
- `hexed/BRUTAL_CHECK_RESULTS.md` - Feature analysis
- `hexed/ADMIN_POWERS_ANALYSIS.md` - Admin requirements
- `hexed/DATABASE.md` - Database schema

## 🤝 Contributing

This is a private project. For development guidelines, see `AGENTS.md`.

## 📄 License

MIT

## 🆘 Support

For issues or questions, contact the development team.

---

**Built with ❤️ for the construction industry**
