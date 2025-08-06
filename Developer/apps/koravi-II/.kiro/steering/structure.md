# Project Structure

## Directory Organization

```
src/
├── app/                    # Next.js 15 App Router
│   ├── layout.tsx         # Root layout with navigation
│   ├── page.tsx           # Dashboard/home page
│   └── clients/           # Client-related pages
│       ├── page.tsx       # Client list view
│       └── [id]/          # Dynamic client detail routes
│           └── page.tsx   # Client profile view
├── components/            # Reusable UI components
│   ├── navigation/        # Navigation components
│   │   ├── Sidebar.tsx    # Collapsible sidebar with liquid-glass
│   │   └── TopBar.tsx     # Top navigation with global search
│   ├── clients/           # Client-specific components
│   │   ├── ClientList.tsx # Client list with search/filter
│   │   ├── ClientCard.tsx # Individual client list item
│   │   ├── ClientProfile.tsx # Detailed client view
│   │   └── ClientForm.tsx # Add/edit client form
│   └── ui/                # Base UI components
│       ├── Button.tsx     # Styled button component
│       ├── Input.tsx      # Form input component
│       └── Modal.tsx      # Modal dialog component
├── lib/                   # Utility functions and configurations
│   ├── supabase.ts       # Supabase client configuration
│   ├── types.ts          # TypeScript type definitions
│   └── utils.ts          # Helper functions
└── styles/               # Global styles and Tailwind config
    └── globals.css       # Global CSS with custom properties
```

## Component Organization

### Navigation Components
- **Sidebar**: Persistent navigation with liquid-glass styling, collapsible
- **TopBar**: Global search and breadcrumbs with glassmorphism effects

### Client Components
- **ClientList**: Main client listing with search and filters
- **ClientCard**: Individual client display in list view
- **ClientProfile**: Detailed client view with inline editing
- **ClientForm**: Add/edit client form with validation

### UI Components
- Base components following consistent design system
- Reusable across different sections of the app
- Accessibility-compliant implementations

## File Naming Conventions
- **Components**: PascalCase (e.g., `ClientList.tsx`)
- **Pages**: lowercase with Next.js conventions (e.g., `page.tsx`, `[id]/page.tsx`)
- **Utilities**: camelCase (e.g., `supabase.ts`, `utils.ts`)
- **Types**: camelCase with descriptive names (e.g., `types.ts`)

## Import Organization
1. React and Next.js imports first
2. Third-party library imports
3. Internal component imports (relative paths)
4. Type imports last with `type` keyword

## State Management
- React hooks for local component state
- Custom hooks for data fetching and business logic
- Context providers only when necessary for global state
- Supabase real-time subscriptions for live data updates