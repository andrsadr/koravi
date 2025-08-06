import { renderHook, act } from '@testing-library/react';
import { useClientForm } from '../useClientForm';
import { Client } from '../../types';

// Mock the database functions
jest.mock('../../database', () => ({
  createClient: jest.fn(),
  updateClient: jest.fn(),
}));

const mockClient: Client = {
  id: '1',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  phone: '555-0123',
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
  labels: ['vip'],
  notes: 'Test notes',
  alerts: '',
  last_visit: '2024-01-01',
  total_visits: 5,
  lifetime_value: 500.00,
};

describe('useClientForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with empty form data when no client provided', () => {
    const { result } = renderHook(() => useClientForm());
    
    expect(result.current.formData.first_name).toBe('');
    expect(result.current.formData.last_name).toBe('');
    expect(result.current.formData.email).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('initializes with client data when client provided', () => {
    const { result } = renderHook(() => useClientForm(mockClient));
    
    expect(result.current.formData.first_name).toBe('John');
    expect(result.current.formData.last_name).toBe('Doe');
    expect(result.current.formData.email).toBe('john@example.com');
  });

  it('updates form data when updateField is called', () => {
    const { result } = renderHook(() => useClientForm());
    
    act(() => {
      result.current.updateField('first_name', 'Jane');
    });
    
    expect(result.current.formData.first_name).toBe('Jane');
  });

  it('validates required fields', () => {
    const { result } = renderHook(() => useClientForm());
    
    act(() => {
      result.current.validateForm();
    });
    
    expect(result.current.errors.first_name).toBe('First name is required');
    expect(result.current.errors.last_name).toBe('Last name is required');
  });

  it('validates email format', () => {
    const { result } = renderHook(() => useClientForm());
    
    act(() => {
      result.current.updateField('email', 'invalid-email');
      result.current.validateForm();
    });
    
    expect(result.current.errors.email).toBe('Please enter a valid email address');
  });

  it('validates phone format', () => {
    const { result } = renderHook(() => useClientForm());
    
    act(() => {
      result.current.updateField('phone', '123');
      result.current.validateForm();
    });
    
    expect(result.current.errors.phone).toBe('Please enter a valid phone number');
  });

  it('submits form successfully for new client', async () => {
    const { createClient } = require('../../database');
    createClient.mockResolvedValue({ id: '2', ...mockClient });
    
    const onSuccess = jest.fn();
    const { result } = renderHook(() => useClientForm(undefined, onSuccess));
    
    act(() => {
      result.current.updateField('first_name', 'Jane');
      result.current.updateField('last_name', 'Smith');
      result.current.updateField('email', 'jane@example.com');
    });
    
    await act(async () => {
      await result.current.submitForm();
    });
    
    expect(createClient).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it('submits form successfully for existing client', async () => {
    const { updateClient } = require('../../database');
    updateClient.mockResolvedValue(mockClient);
    
    const onSuccess = jest.fn();
    const { result } = renderHook(() => useClientForm(mockClient, onSuccess));
    
    act(() => {
      result.current.updateField('first_name', 'Johnny');
    });
    
    await act(async () => {
      await result.current.submitForm();
    });
    
    expect(updateClient).toHaveBeenCalledWith('1', expect.objectContaining({
      first_name: 'Johnny',
    }));
    expect(onSuccess).toHaveBeenCalled();
  });

  it('handles form submission errors', async () => {
    const { createClient } = require('../../database');
    createClient.mockRejectedValue(new Error('Database error'));
    
    const { result } = renderHook(() => useClientForm());
    
    act(() => {
      result.current.updateField('first_name', 'Jane');
      result.current.updateField('last_name', 'Smith');
    });
    
    await act(async () => {
      await result.current.submitForm();
    });
    
    expect(result.current.error).toBe('Database error');
    expect(result.current.isLoading).toBe(false);
  });

  it('resets form data', () => {
    const { result } = renderHook(() => useClientForm());
    
    act(() => {
      result.current.updateField('first_name', 'Jane');
      result.current.updateField('last_name', 'Smith');
    });
    
    expect(result.current.formData.first_name).toBe('Jane');
    
    act(() => {
      result.current.resetForm();
    });
    
    expect(result.current.formData.first_name).toBe('');
    expect(result.current.formData.last_name).toBe('');
  });
});