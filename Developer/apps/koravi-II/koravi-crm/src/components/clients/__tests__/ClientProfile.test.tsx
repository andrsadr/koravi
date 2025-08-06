import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClientProfile } from '../ClientProfile';
import { Client } from '@/lib/types';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
  Edit: () => <div data-testid="edit-icon" />,
  MapPin: () => <div data-testid="map-pin-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  Phone: () => <div data-testid="phone-icon" />,
  Mail: () => <div data-testid="mail-icon" />,
  User: () => <div data-testid="user-icon" />,
  DollarSign: () => <div data-testid="dollar-sign-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  FileText: () => <div data-testid="file-text-icon" />,
  Activity: () => <div data-testid="activity-icon" />,
  Gift: () => <div data-testid="gift-icon" />,
}));

const mockClient: Client = {
  id: '1',
  client_id: 1,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  avatar_url: null,
  date_of_birth: '1990-01-01',
  gender: 'male',
  occupation: 'Software Engineer',
  address_line1: '123 Main St',
  address_line2: 'Apt 4B',
  city: 'New York',
  state: 'NY',
  postal_code: '10001',
  country: 'US',
  status: 'active',
  labels: ['VIP', 'Regular'],
  notes: 'Prefers morning appointments',
  alerts: 'Allergic to certain products',
  last_visit: '2024-01-15',
  total_visits: 5,
  lifetime_value: 500.00,
};

const mockProps = {
  client: mockClient,
  onUpdate: jest.fn(),
  onDelete: jest.fn(),
  isEditing: false,
  onEditToggle: jest.fn(),
};

describe('ClientProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders client profile with basic information', () => {
    render(<ClientProfile {...mockProps} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('+1234567890')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Client ID
  });

  it('displays client alerts when present', () => {
    render(<ClientProfile {...mockProps} />);
    
    expect(screen.getByText('Allergic to certain products')).toBeInTheDocument();
  });

  it('does not display alert when no alerts are present', () => {
    const clientWithoutAlerts = { ...mockClient, alerts: null };
    render(<ClientProfile {...mockProps} client={clientWithoutAlerts} />);
    
    expect(screen.queryByText('Allergic to certain products')).not.toBeInTheDocument();
  });

  it('renders navigation tabs with correct options', () => {
    render(<ClientProfile {...mockProps} />);
    
    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(screen.getByText('Appointments')).toBeInTheDocument();
    expect(screen.getByText('Financials')).toBeInTheDocument();
  });

  it('displays client details in the left panel', () => {
    render(<ClientProfile {...mockProps} />);
    
    expect(screen.getByText(/123 Main St/)).toBeInTheDocument();
    expect(screen.getByText('January 1, 1990')).toBeInTheDocument();
    expect(screen.getByText('Client ID')).toBeInTheDocument();
    expect(screen.getByText('DOB')).toBeInTheDocument();
  });

  it('displays financial information when financials tab is clicked', async () => {
    const user = userEvent.setup();
    render(<ClientProfile {...mockProps} />);
    
    // Click on Financials tab
    const financialsTab = screen.getByText('Financials');
    await user.click(financialsTab);
    
    await waitFor(() => {
      expect(screen.getByText('Lifetime Value')).toBeInTheDocument();
      expect(screen.getByText('Total Visits')).toBeInTheDocument();
    });
  });

  it('shows summary content by default', () => {
    render(<ClientProfile {...mockProps} />);
    
    expect(screen.getByText('Alerts & Allergies')).toBeInTheDocument();
    expect(screen.getByText('Next appointments')).toBeInTheDocument();
  });

  it('switches between tabs correctly', async () => {
    const user = userEvent.setup();
    render(<ClientProfile {...mockProps} />);
    
    // Click on Appointments tab
    const appointmentsTab = screen.getByText('Appointments');
    await user.click(appointmentsTab);
    
    await waitFor(() => {
      expect(screen.getByText('Schedule Appointment')).toBeInTheDocument();
    });
  });

  it('displays client labels as badges', () => {
    render(<ClientProfile {...mockProps} />);
    
    expect(screen.getByText('VIP')).toBeInTheDocument();
    expect(screen.getByText('Regular')).toBeInTheDocument();
  });

  it('handles client with minimal information', () => {
    const minimalClient: Client = {
      ...mockClient,
      email: null,
      phone: null,
      date_of_birth: null,
      occupation: null,
      address_line1: null,
      city: null,
      state: null,
      postal_code: null,
      notes: null,
      alerts: null,
      labels: [],
    };

    render(<ClientProfile {...mockProps} client={minimalClient} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Allergic to certain products')).not.toBeInTheDocument();
  });
});