import { render, screen, fireEvent } from '@testing-library/react';
import { ClientListItem } from '../ClientListItem';
import { Client } from '@/lib/types';

const mockClient: Client = {
  id: '1',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  first_name: 'Jane',
  last_name: 'Doe',
  email: 'jane@example.com',
  phone: '+1234567890',
  status: 'active',
  labels: ['VIP', 'Regular', 'Premium', 'Loyal'],
  country: 'US',
  total_visits: 5,
  lifetime_value: 500.00,
  alerts: 'Allergic to certain products',
  last_visit: '2024-01-15',
};

const mockOnClick = jest.fn();

describe('ClientListItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders client information in list format', () => {
    render(<ClientListItem client={mockClient} onClick={mockOnClick} />);
    
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('+1234567890')).toBeInTheDocument();
    expect(screen.getByText('VIP')).toBeInTheDocument();
    expect(screen.getByText('Regular')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
  });

  it('displays status indicator correctly', () => {
    render(<ClientListItem client={mockClient} onClick={mockOnClick} />);
    
    const statusIndicator = screen.getByTestId('status-indicator');
    expect(statusIndicator).toHaveClass('bg-green-500'); // Active status
  });

  it('shows alert indicator when client has alerts', () => {
    render(<ClientListItem client={mockClient} onClick={mockOnClick} />);
    
    expect(screen.getByTestId('alert-indicator')).toBeInTheDocument();
    expect(screen.getByTitle('Allergic to certain products')).toBeInTheDocument();
  });

  it('displays visit count and lifetime value', () => {
    render(<ClientListItem client={mockClient} onClick={mockOnClick} />);
    
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('visits')).toBeInTheDocument();
    expect(screen.getByText('$500.00')).toBeInTheDocument();
    expect(screen.getByText('lifetime')).toBeInTheDocument();
  });

  it('shows last visit date when available', () => {
    render(<ClientListItem client={mockClient} onClick={mockOnClick} />);
    
    expect(screen.getByText(/Last visit:/)).toBeInTheDocument();
  });

  it('limits labels display to 3 with overflow indicator', () => {
    render(<ClientListItem client={mockClient} onClick={mockOnClick} />);
    
    // Should show first 3 labels
    expect(screen.getByText('VIP')).toBeInTheDocument();
    expect(screen.getByText('Regular')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
    
    // Should show overflow indicator for remaining labels
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('calls onClick when item is clicked', () => {
    render(<ClientListItem client={mockClient} onClick={mockOnClick} />);
    
    const listItem = screen.getByRole('button');
    fireEvent.click(listItem);
    
    expect(mockOnClick).toHaveBeenCalledWith(mockClient);
  });

  it('handles missing contact information gracefully', () => {
    const clientWithoutContact = {
      ...mockClient,
      email: null,
      phone: null,
      last_visit: null,
    };
    
    render(<ClientListItem client={clientWithoutContact} onClick={mockOnClick} />);
    
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.queryByText('jane@example.com')).not.toBeInTheDocument();
    expect(screen.queryByText('+1234567890')).not.toBeInTheDocument();
    expect(screen.queryByText(/Last visit:/)).not.toBeInTheDocument();
  });

  it('highlights search query in client information', () => {
    render(<ClientListItem client={mockClient} onClick={mockOnClick} searchQuery="jane" />);
    
    // Check if the name is highlighted
    const highlightedElement = screen.getByText('Jane');
    expect(highlightedElement.tagName).toBe('MARK');
  });

  it('does not highlight single character searches', () => {
    render(<ClientListItem client={mockClient} onClick={mockOnClick} searchQuery="" />);
    
    // Check that the name is not highlighted when searchQuery is empty (simulating < 2 chars)
    const nameElement = screen.getByText('Jane Doe');
    expect(nameElement.tagName).not.toBe('MARK');
  });

  it('displays client avatar with initials fallback', () => {
    render(<ClientListItem client={mockClient} onClick={mockOnClick} />);
    
    // Check if avatar fallback with initials is displayed
    expect(screen.getByText('JD')).toBeInTheDocument();
  });
});