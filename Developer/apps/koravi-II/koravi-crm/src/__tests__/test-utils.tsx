import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Client } from '../lib/types';

// Mock Supabase client for all tests
export const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn(),
    then: jest.fn(),
  })),
  auth: {
    getUser: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
  },
};

// Mock client data for testing
export const mockClient: Client = {
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

export const mockClients: Client[] = [
  mockClient,
  {
    ...mockClient,
    id: '2',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@example.com',
    status: 'inactive',
    labels: ['New'],
  },
  {
    ...mockClient,
    id: '3',
    first_name: 'Bob',
    last_name: 'Johnson',
    email: 'bob.johnson@example.com',
    labels: [],
  },
];

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Helper functions for testing
export const createMockClient = (overrides: Partial<Client> = {}): Client => ({
  ...mockClient,
  ...overrides,
});

export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0));

// Mock implementations for common hooks
export const mockUseClients = {
  clients: mockClients,
  loading: false,
  error: null,
  refetch: jest.fn(),
  createClient: jest.fn(),
  updateClient: jest.fn(),
  deleteClient: jest.fn(),
};

export const mockUseToast = {
  toast: jest.fn(),
  dismiss: jest.fn(),
  toasts: [],
};