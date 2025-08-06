# Technology Stack

## Core Framework
- **Next.js 15** with App Router pattern
- **React 18** with hooks and modern patterns
- **TypeScript** for type safety

## Database & Backend
- **Supabase** for PostgreSQL database and real-time features
- REST API through Supabase client
- Full-text search using PostgreSQL capabilities

## Styling & UI
- **Tailwind CSS** for utility-first styling
- **Liquid Glass React** (https://github.com/rdev/liquid-glass-react) for glassmorphism navigation
- **Framer Motion** for animations and transitions
- Custom glassmorphism design system

## Development Tools
- **React Hook Form** with **Zod** for form validation
- **Jest** and **React Testing Library** for unit testing
- **Playwright** for end-to-end testing

## Package Manager
- **pnpm** for fast, efficient package management

## Common Commands

### Development
```bash
pnpm dev             # Start development server
pnpm build           # Build for production
pnpm start           # Start production server
pnpm lint            # Run ESLint
pnpm type-check      # Run TypeScript compiler
```

### Testing
```bash
pnpm test            # Run unit tests
pnpm test:watch      # Run tests in watch mode
pnpm test:e2e        # Run end-to-end tests
pnpm test:coverage   # Generate coverage report
```

### Package Management
```bash
pnpm install         # Install dependencies
pnpm add <package>   # Add new dependency
pnpm add -D <package> # Add dev dependency
pnpm remove <package> # Remove dependency
```

### Database
```bash
pnpx supabase start  # Start local Supabase
pnpx supabase stop   # Stop local Supabase
pnpx supabase reset  # Reset local database
```

## Architecture Patterns
- Component-based architecture with clear separation of concerns
- Custom hooks for data fetching and state management
- Server and client components following Next.js 15 patterns
- Error boundaries for graceful error handling