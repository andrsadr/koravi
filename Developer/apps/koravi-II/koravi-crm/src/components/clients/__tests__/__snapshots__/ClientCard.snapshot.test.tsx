import React from 'react';
import { render } from '@testing-library/react';
import { ClientCard } from '../ClientCard';
import { Client } from '../../../lib/types';

const mockClient: Client = {
  id: '1',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  date_of_birth: '1990-01-01',
  gender: 'male',
  occupation: 'Engineer',
  address_line1: '123 Main St',
  address_line2: '',
  city: 'Anytown',
  state: 'CA',
  postal_code: '12345',
  country: 'US',
  status: 'active',
  labels: ['VIP', 'Regular'],
  notes: 'Test notes',
  alerts: '',
  last_visit: '2024-01-01',
  total_visits: 5,
  lifetime_value: 500.00,
};

describe('ClientCard Snapshots', () => {
  it('renders correctly with all client data', () => {
    const { container } = render(
      <ClientCard 
        client={mockClient} 
        onClick={jest.fn()}
        searchQuery=""
      />
    );
    
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders correctly with search highlighting', () => {
    const { container } = render(
      <ClientCard 
        client={mockClient} 
        onClick={jest.fn()}
        searchQuery="John"
      />
    );
    
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders correctly with inactive status', () => {
    const inactiveClient = { ...mockClient, status: 'inactive' as const };
    const { container } = render(
      <ClientCard 
        client={inactiveClient} 
        onClick={jest.fn()}
        searchQuery=""
      />
    );
    
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders correctly with minimal data', () => {
    const minimalClient: Client = {
      ...mockClient,
      email: undefined,
      phone: undefined,
      labels: [],
      notes: undefined,
    };
    
    const { container } = render(
      <ClientCard 
        client={minimalClient} 
        onClick={jest.fn()}
        searchQuery=""
      />
    );
    
    expect(container.firstChild).toMatchSnapshot();
  });
});