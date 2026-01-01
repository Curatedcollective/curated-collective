# Creations - AI & Code Platform

## Overview

This is a full-stack web application that combines creative coding with AI capabilities. Users can build and share code creations (snippets/apps), create custom AI agents with unique personalities, and engage in AI-powered chat conversations. The platform features Replit Auth for authentication, PostgreSQL for data persistence, and OpenAI integration for AI features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style variant)
- **Build Tool**: Vite with HMR support for development

The frontend follows a pages-based structure with reusable components. Protected routes require authentication and render within a layout that includes the Navigation sidebar.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Management**: Express sessions with PostgreSQL-backed store (connect-pg-simple)
- **Authentication**: Replit Auth via OpenID Connect (passport-based)

The server uses a modular integration pattern where features like auth, chat, and image generation are organized under `server/replit_integrations/`. Routes are registered centrally in `server/routes.ts`.

### Data Storage
- **Database**: PostgreSQL (provisioned via Replit)
- **Schema Location**: `shared/schema.ts` with model-specific files in `shared/models/`
- **Migrations**: Managed via Drizzle Kit (`drizzle-kit push`)

Key entities:
- `users` and `sessions` - Authentication (required for Replit Auth)
- `creations` - Code snippets with title, description, language, and visibility
- `agents` - AI personas with personality, system prompt, and avatar
- `conversations` and `messages` - Chat history
- `conversationAgents` - Many-to-many linking agents to conversations

### API Design
- Type-safe API routes defined in `shared/routes.ts` using Zod schemas
- RESTful endpoints under `/api/` prefix
- Input validation with Zod, response typing for frontend consumption
- Credentials included in all fetch requests for session authentication

### Build System
- Development: `tsx` for running TypeScript directly
- Production: esbuild bundles server code, Vite builds client to `dist/public`
- Selective dependency bundling to optimize cold start times

## External Dependencies

### AI Integration
- **OpenAI API** via Replit AI Integrations (environment variables: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`)
- Used for chat completions and image generation (`gpt-image-1` model)

### Authentication
- **Replit Auth** - OpenID Connect provider at `https://replit.com/oidc`
- Requires `REPL_ID`, `SESSION_SECRET`, and `DATABASE_URL` environment variables

### Database
- **PostgreSQL** - Connection via `DATABASE_URL` environment variable
- Session storage uses the `sessions` table directly

### UI Components
- **Radix UI** - Headless primitives for accessibility
- **shadcn/ui** - Pre-styled component variants
- **Lucide React** - Icon library
- **date-fns** - Date formatting utilities