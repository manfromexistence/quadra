# AGENTS.md - AI Agent Collaboration Guide

> **Last Updated:** April 1, 2026  
> **Target Models:** GPT-5.4, GPT-5.4 Pro, GPT-5.4 Thinking, Codex (March 2026+)  
> **Project:** QUADRA (Electronic Document Management System)

---

## 🤖 About This Document

This file provides comprehensive guidance for AI agents (particularly GPT-5.4 and Codex) working on the QUADRA project. It leverages the latest capabilities of GPT-5.4 including:

- **1M token context window** for understanding large codebases
- **Native computer use** for direct software environment interaction
- **Tool search capabilities** for efficient tool discovery and usage
- **Unified reasoning + coding** from GPT-5.3-Codex integration
- **Agentic workflows** for multi-step task execution

---

## 📋 Project Overview

### What is QUADRA?

Construction is an Electronic Document Management System designed specifically for construction projects. It provides:

- **Document Control** - Version control, metadata management, document numbering
- **Workflow Management** - Multi-level review and approval processes
- **Transmittal System** - Formal document transmission tracking
- **Project Management** - Project-wise organization with role-based access
- **Notifications** - Real-time alerts and activity logging

### Technology Stack

```json
{
  "framework": "Next.js 16.2.1 (App Router)",
  "runtime": "React 19.2.4",
  "language": "TypeScript 5.x",
  "database": "PostgreSQL (Neon) + Drizzle ORM 0.42.0",
  "authentication": "Better Auth 1.2.7 (Google/GitHub OAuth)",
  "ui": "shadcn-ui + Radix UI + Tailwind CSS 4.2.2",
  "ai": "Vercel AI SDK + Groq (llama-3.3-70b-versatile)",
  "deployment": "Vercel",
  "package_manager": "npm"
}
```

### User Roles

- **Admin** - Full system access
- **Client** - Project owner, document approval
- **PMC** (Project Management Consultant) - Project oversight, workflow management
- **Vendor** - Document submission, review participation
- **Subcontractor** - Document submission
- **User** - Basic access

---

## 🗂️ Project Structure

```
construction-edms/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── ai/                # AI theme generation (legacy)
│   ├── api/               # API routes
│   ├── community/         # Community themes (legacy)
│   ├── dashboard/         # Main EDMS dashboard
│   ├── editor/            # Theme editor (legacy)
│   ├── settings/          # User settings
│   └── oauth/             # OAuth authorization
├── components/            # React components
│   ├── editor/           # Theme editor components (legacy)
│   ├── ui/               # shadcn-ui components
│   └── ...               # Other shared components
├── db/                    # Database layer
│   ├── schema.ts         # Main schema (Better Auth + themes)
│   └── schema/           # EDMS domain schemas
│       ├── projects.ts
│       ├── documents.ts
│       ├── workflows.ts
│       ├── transmittals.ts
│       ├── notifications.ts
│       └── users.ts
├── lib/                   # Utility libraries
│   ├── ai/               # AI providers and tools
│   ├── auth.ts           # Better Auth configuration
│   └── db.ts             # Database connection
├── actions/              # Server actions
├── hooks/                # React hooks
├── types/                # TypeScript types
├── public/               # Static assets
├── drizzle/              # Database migrations
└── scripts/              # Build and utility scripts
```

---

## 🛠️ Development Commands

### Essential Commands

```bash
# Development server (DO NOT RUN IN AGENT MODE)
npm run dev

# Type checking (FAST - use this for error detection)
npx tsc --noEmit

# Linting and formatting
npm run lint          # Check code quality
npm run lint:fix      # Auto-fix issues
npm run format        # Format code with Biome
npm run check         # Lint + format in one command

# Database operations
npm run db:generate   # Generate migrations from schema
npm run db:migrate    # Run migrations
npm run db:push       # Push schema directly (dev only)
npm run db:studio     # Open Drizzle Studio

# Build (SLOW - only after fixing all errors)
npm run build         # Production build with 4GB heap

# Testing (when implemented)
npm test              # Run tests
npm run test:watch    # Watch mode
```

### Command Usage Strategy

**For AI Agents:**

1. **Type Check First** - Always run `npx tsc --noEmit` before building
2. **Fix All Errors** - Address all TypeScript errors in one pass
3. **Lint Check** - Run `npm run lint` to catch code quality issues
4. **Build Last** - Only run `npm run build` when confident all errors are fixed

**Why?** Building takes significantly longer than type checking. Type checking provides the same error information in a fraction of the time.

---

## 🗄️ Database Schema

### Core Tables

#### Better Auth Tables (Existing)
- `user` - User accounts with EDMS extensions
- `session` - User sessions
- `account` - OAuth accounts
- `verification` - Email verification

#### Theme System Tables (Existing - Keep for UI)
- `theme` - User-created themes
- `community_theme` - Published themes
- `theme_like` - Theme likes
- `ai_usage` - AI generation tracking

#### EDMS Tables (New)
- `projects` - Construction projects
- `project_members` - User-project assignments
- `documents` - Document metadata and versions
- `document_versions` - Version history
- `document_comments` - Reviews and comments
- `document_workflows` - Approval workflows
- `workflow_steps` - Individual workflow steps
- `transmittals` - Document transmissions
- `transmittal_documents` - Transmittal attachments
- `notifications` - User notifications
- `activity_log` - Audit trail

### Schema Files Location

- **Main schema:** `db/schema.ts` (Better Auth + themes + user extensions)
- **EDMS schemas:** `db/schema/*.ts` (domain-separated)

### Migration Workflow

```bash
# 1. Modify schema files in db/schema/
# 2. Generate migration
npm run db:generate

# 3. Review migration in drizzle/ folder
# 4. Apply migration
npm run db:migrate

# Or push directly in development
npm run db:push
```

---

## 🎨 UI Development

### shadcn-ui Components

This project uses shadcn-ui. To add new components:

```bash
# Install a component
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add table

# Install dashboard components
npx shadcn@latest add sidebar
npx shadcn@latest add breadcrumb
npx shadcn@latest add card
```

### Component Patterns

```typescript
// ✅ Good - Server Component by default
export default async function ProjectsPage() {
  const projects = await getProjects();
  return <ProjectsList projects={projects} />;
}

// ✅ Good - Client component only when needed
"use client";
export function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// ❌ Bad - Unnecessary "use client"
"use client";
export function StaticCard({ title }: { title: string }) {
  return <div>{title}</div>;
}
```

### Styling Guidelines

- Use Tailwind CSS utility classes
- Use `cn()` helper for conditional classes
- Mobile-first responsive design
- Use `flex` and `gap` instead of `space-x-*` and `space-y-*`

---

## 🔐 Authentication & Authorization

### Better Auth Setup

Authentication is configured in `lib/auth.ts` using Better Auth with:
- Google OAuth
- GitHub OAuth
- Email verification
- Session management

### Role-Based Access Control

Implement RBAC middleware for protected routes:

```typescript
// Example middleware pattern
export async function requireRole(role: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/");
  if (session.user.role !== role) throw new Error("Unauthorized");
  return session.user;
}
```

---

## 📝 Code Style & Best Practices

### React Patterns (from dx.md)

**State Management:**
- Avoid multiple `useState` - use state machines or reducers
- Prefer derived state over `useEffect`
- UIs are thin wrappers over data

**Component Structure:**
- Extract complex conditionals into components
- Use early returns instead of nested ternaries
- Co-locate related logic

**Side Effects:**
- Avoid `useEffect` for dependent logic
- Be explicit about dependencies
- Prefer event handlers over effects

### TypeScript Guidelines

```typescript
// ✅ Use interfaces for objects
interface Project {
  id: string;
  name: string;
  status: "active" | "completed";
}

// ✅ Use maps instead of enums
const ProjectStatus = {
  ACTIVE: "active",
  COMPLETED: "completed",
} as const;

// ✅ Descriptive variable names
const isLoading = true;
const hasError = false;

// ✅ Use console.log with object shorthand
console.log({ projectId, status });
```

### File Naming

- **Directories:** lowercase-with-dashes (e.g., `project-management`)
- **Components:** PascalCase (e.g., `ProjectCard.tsx`)
- **Utilities:** camelCase (e.g., `formatDate.ts`)

---

## 🚀 Deployment

### Environment Variables

Required variables (see `.env.example`):

```bash
# Database
DATABASE_URL=postgresql://...

# Better Auth
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# AI (optional - for theme generation)
GROQ_API_KEY=...

# Polar (optional - for subscriptions)
POLAR_ACCESS_TOKEN=...
POLAR_WEBHOOK_SECRET=...
```

### Build Process

```bash
# 1. Install dependencies
npm install

# 2. Generate migrations
npm run db:generate

# 3. Run migrations
npm run db:migrate

# 4. Build
npm run build

# 5. Start production server
npm start
```

---

## 🧪 Testing Strategy

### Current Status
- **Unit tests:** Not yet implemented
- **Integration tests:** Not yet implemented
- **E2E tests:** Not yet implemented

### Recommended Testing Stack
- **Unit:** Vitest
- **Component:** React Testing Library
- **E2E:** Playwright
- **API:** Supertest or Vitest

### Testing Commands (when implemented)

```bash
npm test              # Run all tests
npm run test:unit     # Unit tests only
npm run test:e2e      # E2E tests only
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

---

## 📚 Key Files to Understand

### Configuration Files

- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `drizzle.config.ts` - Database configuration
- `next.config.ts` - Next.js configuration
- `.env.local` - Environment variables (not in git)

### Documentation Files

- `README.md` - Project overview and setup
- `TODO.md` - Development progress tracker
- `CHANGELOG.md` - Project history
- `GOAL.md` - Original EDMS requirements (DO NOT EDIT)
- `AGENTS.md` - This file
- `.kiro/steering/dx.md` - Development guidelines

### Core Application Files

- `app/layout.tsx` - Root layout with providers
- `lib/auth.ts` - Authentication configuration
- `lib/db.ts` - Database connection
- `db/schema.ts` - Main database schema
- `db/schema/index.ts` - EDMS schema exports

---

## 🎯 Current Development Status

### ✅ Completed (Phase 1-2)

- Project renamed to "construction-edms"
- README, CHANGELOG, TODO created
- Database schema designed for all EDMS modules
- User table extended with EDMS fields
- Schema files organized by domain

### 🚧 In Progress (Phase 3)

- Generate and run database migrations
- Create app directory structure for EDMS
- Set up dashboard layout with sidebar
- Install shadcn-ui dashboard components

### 📋 Pending (Phase 4-6)

- Implement project management module
- Implement document control module
- Implement workflow management
- Implement transmittal system
- Add search and filters
- Set up notifications
- Testing and refinement
- Documentation and deployment

**See `TODO.md` for detailed task breakdown.**

---

## 🤝 Working with AI Agents (GPT-5.4 Specific)

### Leveraging GPT-5.4 Capabilities

**1M Token Context Window:**
- Load entire codebase context when needed
- Understand cross-file dependencies
- Plan multi-file refactoring

**Tool Search:**
- Efficiently discover and use project-specific tools
- Find relevant npm packages and APIs
- Locate utility functions across the codebase

**Native Computer Use:**
- Execute commands directly in the development environment
- Run type checks, lints, and builds
- Interact with database tools (Drizzle Studio)

**Agentic Workflows:**
- Break down complex features into subtasks
- Execute multi-step implementations autonomously
- Verify and test changes before completion

### Recommended Workflow for Agents

```
1. READ TODO.md to understand current status
2. READ relevant schema files for context
3. PLAN the implementation approach
4. IMPLEMENT changes across necessary files
5. TYPE CHECK with `npx tsc --noEmit`
6. FIX any errors found
7. LINT with `npm run lint`
8. BUILD with `npm run build` (only when confident)
9. UPDATE TODO.md with progress
10. UPDATE CHANGELOG.md with changes
```

### Error Handling Strategy

**When encountering errors:**

1. **Analyze** - Read the full error message and stack trace
2. **Research** - Search for solutions if unfamiliar
3. **Fix** - Apply the fix across all affected files
4. **Verify** - Run type check again to confirm
5. **Document** - Note the fix in CHANGELOG.md if significant

**Three-Strike Rule:**
- Attempt 1: Try initial fix
- Attempt 2: Research and try alternative approach
- Attempt 3: Try fundamentally different solution
- If all fail: Document in HELP.md and move to next task

---

## 🔍 Common Tasks & Solutions

### Adding a New EDMS Module

```bash
# 1. Create schema file
touch db/schema/new-module.ts

# 2. Define tables and relations
# (see existing schema files for patterns)

# 3. Export from index
# Add to db/schema/index.ts

# 4. Generate migration
npm run db:generate

# 5. Run migration
npm run db:migrate

# 6. Create server actions
touch actions/new-module.ts

# 7. Create UI pages
mkdir -p app/new-module
touch app/new-module/page.tsx

# 8. Add navigation link
# Update sidebar component
```

### Fixing TypeScript Errors

```bash
# Check for errors
npx tsc --noEmit

# Common fixes:
# - Add missing imports
# - Fix type annotations
# - Update interface definitions
# - Add null checks (user?.field)
# - Fix async/await usage
```

### Adding shadcn-ui Components

```bash
# Install component
npx shadcn@latest add [component-name]

# Import and use
import { Button } from "@/components/ui/button";
```

### Database Schema Changes

```bash
# 1. Edit schema file
# 2. Generate migration
npm run db:generate

# 3. Review migration SQL
cat drizzle/[timestamp]_[name].sql

# 4. Apply migration
npm run db:migrate

# Or push directly (dev only)
npm run db:push
```

---

## 📖 Additional Resources

### Official Documentation

- [Next.js App Router](https://nextjs.org/docs/app) - Framework docs
- [React 19](https://react.dev) - React documentation
- [Drizzle ORM](https://orm.drizzle.team) - Database ORM
- [Better Auth](https://www.better-auth.com) - Authentication
- [shadcn-ui](https://ui.shadcn.com) - UI components
- [Tailwind CSS](https://tailwindcss.com) - Styling

### Project-Specific Docs

- `GOAL.md` - Original EDMS requirements
- `.kiro/steering/dx.md` - React patterns and best practices
- `README.md` - Setup and getting started
- `TODO.md` - Current development tasks

### GPT-5.4 Resources

- [OpenAI GPT-5.4 Announcement](https://openai.com/index/introducing-gpt-5-4/) - Official release
- [GPT-5.4 API Documentation](https://platform.openai.com/docs) - API reference
- [Codex Environment](https://codex.openai.com) - Agentic coding platform

---

## ⚠️ Important Notes

### DO NOT

- ❌ Delete existing files without explicit permission
- ❌ Remove working features (like theme system)
- ❌ Edit `GOAL.md` file
- ❌ Run `npm run dev` in agent mode (long-running process)
- ❌ Create unnecessary markdown documentation files
- ❌ Use `cd` command (use `cwd` parameter instead)
- ❌ Manually edit `package.json` dependencies (use npm commands)

### DO

- ✅ Read `TODO.md` before starting work
- ✅ Update `TODO.md` after completing tasks
- ✅ Update `CHANGELOG.md` with significant changes
- ✅ Run type checks before building
- ✅ Fix all errors in one pass when possible
- ✅ Use parallel tool calls for independent operations
- ✅ Preserve existing authentication and theme features
- ✅ Follow React patterns from `dx.md`

---

## 🎓 Learning from This Codebase

### Architecture Patterns

**Server Components First:**
- Most pages are server components
- Client components only for interactivity
- Data fetching in server components

**Server Actions:**
- Form submissions use server actions
- Located in `actions/` directory
- Type-safe with Zod validation

**Database Access:**
- Drizzle ORM for type-safe queries
- Schema-first approach
- Migrations for version control

**Authentication Flow:**
- Better Auth with OAuth providers
- Session-based authentication
- Role-based access control

### Code Organization

**Feature-Based Structure:**
- Group related files by feature
- Co-locate components, actions, and types
- Shared utilities in `lib/`

**Type Safety:**
- TypeScript everywhere
- Zod for runtime validation
- Drizzle for database types

**Styling Approach:**
- Tailwind utility classes
- shadcn-ui for components
- Consistent design system

---

## 📞 Getting Help

### For AI Agents

1. **Read this file thoroughly** before starting work
2. **Check `TODO.md`** for current status and next tasks
3. **Review `dx.md`** for React patterns and best practices
4. **Search the codebase** for similar implementations
5. **Use GPT-5.4's tool search** to find relevant utilities
6. **Leverage 1M context** to understand cross-file dependencies

### For Human Developers

1. Check existing documentation files
2. Review code comments and type definitions
3. Use Drizzle Studio to explore database
4. Run type checker for immediate feedback
5. Use linter for code quality issues

---

## 🔄 Version History

- **v1.0.0** (April 1, 2026) - Initial AGENTS.md creation
  - Comprehensive project overview
  - GPT-5.4 specific guidance
  - Development workflows and commands
  - Database schema documentation
  - Best practices and patterns

---

**Remember:** This is a living document. Update it as the project evolves, new patterns emerge, or GPT-5.4 capabilities expand.

**Target Audience:** GPT-5.4, GPT-5.4 Pro, GPT-5.4 Thinking, Codex, and other advanced AI agents working on this codebase.

**Goal:** Enable AI agents to work autonomously and effectively on the QUADRA project with minimal human intervention.
