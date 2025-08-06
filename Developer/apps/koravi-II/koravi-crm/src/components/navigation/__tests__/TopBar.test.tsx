import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import TopBar from '../TopBar';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the search hook
jest.mock('../../../lib/hooks/useClients', () => ({
  useClients: () => ({
    clients: [
      { id: '1', first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
      { id: '2', first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com' },
    ],
    loading: false,
    error: null,
  }),
}));

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('TopBar', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    });
    mockPush.mockClear();
  });

  it('renders search input', () => {
    render(<TopBar isSidebarCollapsed={false} onSidebarToggle={jest.fn()} />);
    
    const searchInput = screen.getByPlaceholderText(/search clients/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('shows search results when typing', async () => {
    render(<TopBar isSidebarCollapsed={false} onSidebarToggle={jest.fn()} />);
    
    const searchInput = screen.getByPlaceholderText(/search clients/i);
    fireEvent.change(searchInput, { target: { value: 'John' } });
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('navigates to client when search result is clicked', async () => {
    render(<TopBar isSidebarCollapsed={false} onSidebarToggle={jest.fn()} />);
    
    const searchInput = screen.getByPlaceholderText(/search clients/i);
    fireEvent.change(searchInput, { target: { value: 'John' } });
    
    await waitFor(() => {
      const result = screen.getByText('John Doe');
      fireEvent.click(result);
    });
    
    expect(mockPush).toHaveBeenCalledWith('/clients/1');
  });

  it('clears search results when input is cleared', async () => {
    render(<TopBar isSidebarCollapsed={false} onSidebarToggle={jest.fn()} />);
    
    const searchInput = screen.getByPlaceholderText(/search clients/i);
    fireEvent.change(searchInput, { target: { value: 'John' } });
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    fireEvent.change(searchInput, { target: { value: '' } });
    
    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });

  it('has proper accessibility attributes', () => {
    render(<TopBar isSidebarCollapsed={false} onSidebarToggle={jest.fn()} />);
    
    const searchInput = screen.getByRole('searchbox');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('aria-label', 'Search clients');
  });

  it('applies glassmorphism styling', () => {
    render(<TopBar isSidebarCollapsed={false} onSidebarToggle={jest.fn()} />);
    
    const topBar = screen.getByRole('banner') || screen.getByTestId('topbar');
    expect(topBar).toHaveClass('glass-panel');
  });
});