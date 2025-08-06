import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '../Sidebar';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('Sidebar', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    });
    mockUsePathname.mockReturnValue('/');
    mockPush.mockClear();
  });

  it('renders sidebar with navigation items', () => {
    render(<Sidebar isCollapsed={false} onToggle={jest.fn()} />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Clients')).toBeInTheDocument();
  });

  it('shows active state for current route', () => {
    mockUsePathname.mockReturnValue('/clients');
    render(<Sidebar isCollapsed={false} onToggle={jest.fn()} />);
    
    const clientsLink = screen.getByText('Clients').closest('a');
    expect(clientsLink).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('navigates to dashboard when dashboard item is clicked', () => {
    render(<Sidebar isCollapsed={false} onToggle={jest.fn()} />);
    
    const dashboardLink = screen.getByText('Dashboard');
    fireEvent.click(dashboardLink);
    
    // Since we're using Next.js Link, we check the href attribute instead
    expect(dashboardLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('navigates to clients when clients item is clicked', () => {
    render(<Sidebar isCollapsed={false} onToggle={jest.fn()} />);
    
    const clientsLink = screen.getByText('Clients');
    fireEvent.click(clientsLink);
    
    // Since we're using Next.js Link, we check the href attribute instead
    expect(clientsLink.closest('a')).toHaveAttribute('href', '/clients');
  });

  it('has proper accessibility attributes', () => {
    render(<Sidebar isCollapsed={false} onToggle={jest.fn()} />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    const clientsLink = screen.getByRole('link', { name: /clients/i });
    
    expect(dashboardLink).toBeInTheDocument();
    expect(clientsLink).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    render(<Sidebar isCollapsed={false} onToggle={jest.fn()} />);
    
    const sidebar = screen.getByRole('navigation').parentElement;
    expect(sidebar).toHaveClass('glass-panel');
  });
});