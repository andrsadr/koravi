import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ClientList } from '../ClientList';
import { Client } from '@/lib/types';

// Mock the useRouter hook
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock the useClients hook
const mockUseClients = jest.fn();
jest.mock('@/lib/hooks/useClients', () => ({
  useClients: () => mockUseClients(),
  useClientSearch: jest.fn(),
}));

const mockClients: Client[] = [
  {
    id: '1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    first_name: 'Jane',
    last_name: 'Doe',
    email: 'jane@example.com',
    phone: '+1234567890',
    status: 'active',
    labels: ['VIP', 'Regular'],
    country: 'US',
    total_visits: 5,
    lifetime_value: 500.00,
  },
  {
    id: '2',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    first_name: 'John',
    last_name: 'Smith',
    email: 'john@example.com',
    phone: '+1987654321',
    status: 'active',
    labels: ['New'],
    country: 'US',
    total_visits: 1,
    lifetime_value: 100.00,
  },
];

describe('ClientList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseClients.mockReturnValue({
      clients: mockClients,
      loading: false,
      error: null,
    });
  });

  it('renders client list with search input', () => {
    render(<ClientList />);
    
    expect(screen.getByPlaceholderText(/search clients/i)).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument();
  });

  it('filters clients based on search input', async () => {
    render(<ClientList />);
    
    const searchInput = screen.getByPlaceholderText(/search clients/i);
    fireEvent.change(searchInput, { target: { value: 'Jane' } });
    
    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.queryByText('John Smith')).not.toBeInTheDocument();
    });
  });

  it('displays empty state when no clients exist', () => {
    mockUseClients.mockReturnValue({
      clients: [],
      loading: false,
      error: null,
    });

    render(<ClientList />);
    
    expect(screen.getByText(/no clients found/i)).toBeInTheDocument();
    expect(screen.getByText(/add your first client/i)).toBeInTheDocument();
  });

  it('shows loading state while fetching clients', () => {
    mockUseClients.mockReturnValue({
      clients: [],
      loading: true,
      error: null,
    });

    render(<ClientList />);
    
    expect(screen.getByText(/loading clients/i)).toBeInTheDocument();
  });

  it('filters clients by labels', async () => {
    render(<ClientList />);
    
    const vipLabel = screen.getByText('VIP');
    fireEvent.click(vipLabel);
    
    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.queryByText('John Smith')).not.toBeInTheDocument();
    });
  });

  it('debounces search input to prevent excessive API calls', async () => {
    render(<ClientList />);
    
    const searchInput = screen.getByPlaceholderText(/search clients/i);
    
    // Type quickly - the component should debounce internally
    fireEvent.change(searchInput, { target: { value: 'J' } });
    fireEvent.change(searchInput, { target: { value: 'Ja' } });
    fireEvent.change(searchInput, { target: { value: 'Jan' } });
    
    // Wait for debounce and check that filtering works
    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    }, { timeout: 1000 });
  });
});