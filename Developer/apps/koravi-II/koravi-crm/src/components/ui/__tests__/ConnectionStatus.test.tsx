import React from 'react';
import { render, screen } from '@testing-library/react';
import { ConnectionStatus } from '../ConnectionStatus';

// Mock the database connection hook
jest.mock('../../lib/hooks/useClients', () => ({
  useClients: jest.fn(),
}));

describe('ConnectionStatus', () => {
  beforeEach(() => {
    const { useClients } = require('../../lib/hooks/useClients');
    useClients.mockReturnValue({
      clients: [],
      loading: false,
      error: null,
    });
  });

  it('shows connected status when database is accessible', () => {
    render(<ConnectionStatus />);
    
    expect(screen.getByText(/connected/i)).toBeInTheDocument();
    expect(screen.getByTestId('connection-indicator')).toHaveClass('bg-green-500');
  });

  it('shows disconnected status when there is an error', () => {
    const { useClients } = require('../../lib/hooks/useClients');
    useClients.mockReturnValue({
      clients: [],
      loading: false,
      error: new Error('Connection failed'),
    });

    render(<ConnectionStatus />);
    
    expect(screen.getByText(/disconnected/i)).toBeInTheDocument();
    expect(screen.getByTestId('connection-indicator')).toHaveClass('bg-red-500');
  });

  it('shows connecting status when loading', () => {
    const { useClients } = require('../../lib/hooks/useClients');
    useClients.mockReturnValue({
      clients: [],
      loading: true,
      error: null,
    });

    render(<ConnectionStatus />);
    
    expect(screen.getByText(/connecting/i)).toBeInTheDocument();
    expect(screen.getByTestId('connection-indicator')).toHaveClass('bg-yellow-500');
  });

  it('has proper accessibility attributes', () => {
    render(<ConnectionStatus />);
    
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('displays tooltip on hover', () => {
    render(<ConnectionStatus />);
    
    const indicator = screen.getByTestId('connection-indicator');
    expect(indicator).toHaveAttribute('title');
  });
});