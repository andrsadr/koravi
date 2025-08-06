# Design Document

## Overview

Koravi CRM is a Next.js 15 application using the App Router pattern, designed as a single-page application with client-side navigation. The architecture emphasizes modern React patterns, Supabase integration for data persistence, and a glassmorphism design system focused on the navigation elements. The application follows a component-based architecture with clear separation of concerns between UI components, data management, and business logic.

## Architecture

### Application Structure
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

### Technology Stack Integration
- **Next.js 15 App Router**: Provides file-based routing, server components, and optimized performance
- **React 18**: Component-based UI with hooks for state management
- **Supabase**: PostgreSQL database with real-time subscriptions and REST API
- **Tailwind CSS**: Utility-first styling with custom glassmorphism classes
- **Framer Motion**: Declarative animations for page transitions and micro-interactions
- **Liquid Glass React** (https://github.com/rdev/liquid-glass-react): Specialized glassmorphism effects for navigation elements

## Components and Interfaces

### Navigation System

#### Sidebar Component
```typescript
interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  currentPath: string;
}
```
- Implements liquid-glass styling using the liquid-glass-react library (https://github.com/rdev/liquid-glass-react)
- Collapsible functionality with smooth animations
- Navigation items: Dashboard, Clients, Settings
- Persistent across all routes using Next.js layout system

#### TopBar Component
```typescript
interface TopBarProps {
  onSearch: (query: string) => void;
  searchResults: SearchResult[];
  isSearching: boolean;
}

interface SearchResult {
  id: string;
  type: 'client';
  title: string;
  subtitle: string;
  href: string;
}
```
- Global search functionality with real-time results
- Liquid-glass styling consistent with sidebar
- Breadcrumb navigation for current page context

### Client Management Components

#### ClientList Component
```typescript
interface ClientListProps {
  clients: Client[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedLabels: string[];
  onLabelFilter: (labels: string[]) => void;
}
```
- Virtualized list for performance with large client databases
- Real-time search and filtering capabilities
- Label-based filtering system
- Empty state handling for new users

#### ClientProfile Component
```typescript
interface ClientProfileProps {
  client: Client;
  onUpdate: (updates: Partial<Client>) => Promise<void>;
  onDelete: () => Promise<void>;
  isEditing: boolean;
  onEditToggle: () => void;
}
```
- Inline editing capabilities for all client fields
- Tabbed interface for different data sections (Details, Appointments, History)
- Alert system for important client information
- Appointment history timeline with visual indicators

#### ClientForm Component
```typescript
interface ClientFormProps {
  client?: Partial<Client>;
  onSubmit: (client: ClientFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}
```
- Form validation using React Hook Form
- Progressive disclosure for optional fields
- Auto-save functionality for draft data
- Accessibility-compliant form controls

## Data Models

### Client Schema (Supabase)
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Basic Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  
  -- Profile Information
  date_of_birth DATE,
  gender VARCHAR(20),
  occupation VARCHAR(100),
  
  -- Contact Information
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  postal_code VARCHAR(20),
  country VARCHAR(50) DEFAULT 'US',
  
  -- Business Information
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  labels TEXT[], -- Array of string labels
  notes TEXT,
  alerts TEXT, -- Important alerts or warnings
  
  -- Metadata
  last_visit DATE,
  total_visits INTEGER DEFAULT 0,
  lifetime_value DECIMAL(10,2) DEFAULT 0.00,
  
  -- Search optimization
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', 
      COALESCE(first_name, '') || ' ' || 
      COALESCE(last_name, '') || ' ' || 
      COALESCE(email, '') || ' ' || 
      COALESCE(phone, '')
    )
  ) STORED
);

-- Indexes for performance
CREATE INDEX idx_clients_search ON clients USING GIN(search_vector);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_labels ON clients USING GIN(labels);
CREATE INDEX idx_clients_updated_at ON clients(updated_at DESC);
```

### TypeScript Interfaces
```typescript
interface Client {
  id: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  occupation?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country: string;
  status: 'active' | 'inactive' | 'archived';
  labels: string[];
  notes?: string;
  alerts?: string;
  last_visit?: string;
  total_visits: number;
  lifetime_value: number;
}

interface ClientFormData extends Omit<Client, 'id' | 'created_at' | 'updated_at'> {}
```

## Error Handling

### Database Error Handling
- Connection retry logic with exponential backoff
- Graceful degradation when Supabase is unavailable
- User-friendly error messages for common database errors
- Offline state detection and appropriate UI feedback

### Form Validation
- Client-side validation using Zod schemas
- Real-time validation feedback during form input
- Server-side validation as backup for data integrity
- Clear error messaging with specific field guidance

### Search Error Handling
- Debounced search to prevent excessive API calls
- Fallback to client-side filtering if search service fails
- Loading states and error boundaries for search components
- Graceful handling of malformed search queries

## Testing Strategy

### Unit Testing
- Jest and React Testing Library for component testing
- Mock Supabase client for isolated component tests
- Test coverage for all utility functions and custom hooks
- Snapshot testing for UI components to catch unintended changes

### Integration Testing
- End-to-end testing with Playwright for critical user journeys
- Database integration tests using Supabase test environment
- API endpoint testing for all CRUD operations
- Cross-browser testing for glassmorphism effects compatibility

### Performance Testing
- Lighthouse audits for Core Web Vitals optimization
- Bundle size monitoring to prevent bloat
- Database query performance testing with large datasets
- Animation performance testing across different devices

### Accessibility Testing
- Automated accessibility testing with axe-core
- Keyboard navigation testing for all interactive elements
- Screen reader compatibility testing
- Color contrast validation for glassmorphism elements

## Animation and Interaction Design

### Framer Motion Implementation
- Page transitions using `AnimatePresence` for route changes
- Staggered animations for client list items on load
- Micro-interactions for button hovers and form focus states
- Smooth sidebar collapse/expand with spring animations

### Glassmorphism Design System
- Liquid Glass React components (https://github.com/rdev/liquid-glass-react) for navigation elements
- Custom Tailwind classes for consistent glass effects throughout the app
- CSS custom properties for dynamic glass opacity and blur effects
- Backdrop blur effects optimized for performance
- Responsive glass effects that adapt to different screen sizes

### Performance Considerations
- Animation performance optimization using `transform` and `opacity`
- Reduced motion preferences support for accessibility
- GPU acceleration for smooth 60fps animations
- Lazy loading of heavy animation components