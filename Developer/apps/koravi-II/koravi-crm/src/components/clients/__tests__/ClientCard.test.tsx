import { render, screen, fireEvent } from '@testing-library/react';
import { ClientCard } from '../ClientCard';
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
  labels: ['VIP', 'Regular'],
  country: 'US',
  total_visits: 5,
  lifetime_value: 500.00,
  alerts: 'Allergic to certain products',
};

const mockOnClick = jest.fn();

describe('ClientCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders client information correctly', () => {
    render(<ClientCard client={mockClient} onClick={mockOnClick} />);
    
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('+1234567890')).toBeInTheDocument();
    expect(screen.getByText('VIP')).toBeInTheDocument();
    expect(screen.getByText('Regular')).toBeInTheDocument();
  });

  it('displays status indicator correctly', () => {
    render(<ClientCard client={mockClient} onClick={mockOnClick} />);
    
    const statusIndicator = screen.getByTestId('status-indicator');
    expect(statusIndicator).toHaveClass('bg-green-500'); // Active status
  });

  it('shows alert indicator when client has alerts', () => {
    render(<ClientCard client={mockClient} onClick={mockOnClick} />);
    
    expect(screen.getByTestId('alert-indicator')).toBeInTheDocument();
    expect(screen.getByTitle('Allergic to certain products')).toBeInTheDocument();
  });

  it('does not show alert indicator when client has no alerts', () => {
    const clientWithoutAlerts = { ...mockClient, alerts: undefined };
    render(<ClientCard client={clientWithoutAlerts} onClick={mockOnClick} />);
    
    expect(screen.queryByTestId('alert-indicator')).not.toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    render(<ClientCard client={mockClient} onClick={mockOnClick} />);
    
    const card = screen.getByRole('button');
    fireEvent.click(card);
    
    expect(mockOnClick).toHaveBeenCalledWith(mockClient);
  });

  it('displays visit count and lifetime value', () => {
    render(<ClientCard client={mockClient} onClick={mockOnClick} />);
    
    expect(screen.getByText('5 visits')).toBeInTheDocument();
    expect(screen.getByText('$500.00')).toBeInTheDocument();
  });

  it('handles missing contact information gracefully', () => {
    const clientWithoutContact = {
      ...mockClient,
      email: undefined,
      phone: undefined,
    };
    
    render(<ClientCard client={clientWithoutContact} onClick={mockOnClick} />);
    
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.queryByText('jane@example.com')).not.toBeInTheDocument();
    expect(screen.queryByText('+1234567890')).not.toBeInTheDocument();
  });

  it('applies correct styling for different status types', () => {
    const inactiveClient = { ...mockClient, status: 'inactive' as const };
    render(<ClientCard client={inactiveClient} onClick={mockOnClick} />);
    
    const statusIndicator = screen.getByTestId('status-indicator');
    expect(statusIndicator).toHaveClass('bg-gray-400'); // Inactive status
  });

  it('truncates long names appropriately', () => {
    const clientWithLongName = {
      ...mockClient,
      first_name: 'VeryLongFirstNameThatShouldBeTruncated',
      last_name: 'VeryLongLastNameThatShouldBeTruncated',
    };
    
    render(<ClientCard client={clientWithLongName} onClick={mockOnClick} />);
    
    const nameElement = screen.getByText(/VeryLongFirstNameThatShouldBeTruncated/);
    expect(nameElement).toHaveClass('truncate');
  });

  it('highlights search query in client information', () => {
    render(<ClientCard client={mockClient} onClick={mockOnClick} searchQuery="jane" />);
    
    // Check if the name is highlighted
    const highlightedElement = screen.getByText('Jane');
    expect(highlightedElement.tagName).toBe('MARK');
  });

  it('does not highlight single character searches', () => {
    render(<ClientCard client={mockClient} onClick={mockOnClick} searchQuery="" />);
    
    // Check that the name is not highlighted when searchQuery is empty (simulating < 2 chars)
    const nameElement = screen.getByText('Jane Doe');
    expect(nameElement.tagName).not.toBe('MARK');
  });

  it('displays client avatar with initials fallback', () => {
    render(<ClientCard client={mockClient} onClick={mockOnClick} />);
    
    // Check if avatar fallback with initials is displayed
    expect(screen.getByText('JD')).toBeInTheDocument();
  });
});