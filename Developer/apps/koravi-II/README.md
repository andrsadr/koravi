# Koravi CRM

A modern, minimal CRM designed specifically for solo beauty professionals to manage client records efficiently.

## Features

- **Clean, Apple-inspired UI** with glassmorphism navigation elements
- **Complete client management** with comprehensive profiles and search
- **Real-time search** across all client data
- **Responsive design** with mobile-first approach
- **Accessibility compliant** interface
- **Smooth animations** and professional user experience

## Tech Stack

- **Next.js 15** with App Router pattern
- **React 18** with hooks and modern patterns
- **TypeScript** for type safety
- **Supabase** for PostgreSQL database and real-time features
- **Tailwind CSS** for utility-first styling
- **Liquid Glass React** for glassmorphism navigation
- **Framer Motion** for animations and transitions

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended package manager)
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/andrsadr/koravi.git
cd koravi
```

2. Navigate to the project directory:
```bash
cd koravi-crm
```

3. Install dependencies:
```bash
pnpm install
```

4. Set up environment variables:
```bash
cp .env.example .env.local
```

5. Configure your Supabase credentials in `.env.local`

6. Set up the database:
```bash
node setup-database.js
```

7. Start the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

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

## Project Structure

```
src/
├── app/                    # Next.js 15 App Router
├── components/            # Reusable UI components
│   ├── navigation/        # Navigation components
│   ├── clients/           # Client-specific components
│   └── ui/                # Base UI components
├── lib/                   # Utility functions and configurations
└── styles/               # Global styles and Tailwind config
```

## Target Users

Solo beauty professionals who need efficient client record management without complex enterprise features.

## Design Philosophy

- Minimalism over feature bloat
- Smooth, fluid interactions with micro-animations
- Glassmorphism design system focused on navigation
- Mobile-first responsive design
- Accessibility-compliant interface

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.