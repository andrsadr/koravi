import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ClientProfile } from '../ClientProfile';
import { Client } from '../../../lib/types';
import { useToast } from '../../../lib/hooks/useToast';

// Mock the useToast hook
jest.mock('../../../lib/hooks/useToast');
const mockToast = jest.fn();
(useToast as jest.Mock).mockReturnValue({ toast: mockToast });

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock dnd-kit
jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: any) => children,
  closestCenter: jest.fn(),
  KeyboardSensor: jest.fn(),
  PointerSensor: jest.fn(),
  useSensor: jest.fn(),
  useSensors: jest.fn(() => []),
}));

jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: any) => children,
  sortableKeyboardCoordinates: jest.fn(),
  verticalListSortingStrategy: jest.fn(),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  arrayMove: jest.fn(),
}));

jest.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: jest.fn(() => ''),
    },
  },
}));

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
  alerts: 'No known allergies',
  last_visit: '2024-01-01',
  total_visits: 5,
  lifetime_value: 500.00,
  client_id: 1001,
  avatar_url: null,
};

describe('ClientProfile Delete Functionality', () => {
  const mockOnUpdate = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnEditToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders three-dots menu button', () => {
    render(
      <ClientProfile
        client={mockClient}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        isEditing={false}
        onEditToggle={mockOnEditToggle}
      />
    );

    // Look for the three-dots menu trigger button by finding the button with MoreVertical icon
    const menuButtons = screen.getAllByRole('button');
    const menuButton = menuButtons.find(button => 
      button.querySelector('svg.lucide-ellipsis-vertical')
    );
    expect(menuButton).toBeInTheDocument();
  });

  it('shows dropdown menu when three-dots button is clicked', async () => {
    render(
      <ClientProfile
        client={mockClient}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        isEditing={false}
        onEditToggle={mockOnEditToggle}
      />
    );

    // Find and click the three-dots menu button
    const menuButtons = screen.getAllByRole('button');
    const menuButton = menuButtons.find(button => 
      button.querySelector('svg.lucide-ellipsis-vertical')
    );
    fireEvent.click(menuButton!);

    await waitFor(() => {
      expect(screen.getByText('Merge')).toBeInTheDocument();
      expect(screen.getByText('Delete Client')).toBeInTheDocument();
    });
  });

  it('calls onDelete when confirmation is accepted', async () => {
    mockOnDelete.mockResolvedValue(undefined);

    render(
      <ClientProfile
        client={mockClient}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        isEditing={false}
        onEditToggle={mockOnEditToggle}
      />
    );

    // Click three-dots menu button
    const menuButtons = screen.getAllByRole('button');
    const menuButton = menuButtons.find(button => 
      button.querySelector('svg.lucide-ellipsis-vertical')
    );
    fireEvent.click(menuButton!);

    // Wait for menu to appear and click delete
    await waitFor(() => {
      expect(screen.getByText('Delete Client')).toBeInTheDocument();
    });

    const deleteMenuItem = screen.getByText('Delete Client');
    fireEvent.click(deleteMenuItem);

    // Wait for confirmation dialog and click confirm
    await waitFor(() => {
      expect(screen.getByText(/Delete John Doe/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /delete$/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
  });

  it('shows success toast when deletion succeeds', async () => {
    mockOnDelete.mockResolvedValue(undefined);

    render(
      <ClientProfile
        client={mockClient}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        isEditing={false}
        onEditToggle={mockOnEditToggle}
      />
    );

    // Click three-dots menu button
    const menuButtons = screen.getAllByRole('button');
    const menuButton = menuButtons.find(button => 
      button.querySelector('svg.lucide-ellipsis-vertical')
    );
    fireEvent.click(menuButton!);

    // Wait for menu to appear and click delete
    await waitFor(() => {
      expect(screen.getByText('Delete Client')).toBeInTheDocument();
    });

    const deleteMenuItem = screen.getByText('Delete Client');
    fireEvent.click(deleteMenuItem);

    // Wait for confirmation dialog and click confirm
    await waitFor(() => {
      expect(screen.getByText(/Delete John Doe/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /delete$/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Client deleted",
        description: "John Doe has been successfully deleted.",
        variant: "default",
      });
    });
  });

  it('shows error toast when deletion fails', async () => {
    const error = new Error('Delete failed');
    mockOnDelete.mockRejectedValue(error);

    render(
      <ClientProfile
        client={mockClient}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        isEditing={false}
        onEditToggle={mockOnEditToggle}
      />
    );

    // Click three-dots menu button
    const menuButtons = screen.getAllByRole('button');
    const menuButton = menuButtons.find(button => 
      button.querySelector('svg.lucide-ellipsis-vertical')
    );
    fireEvent.click(menuButton!);

    // Wait for menu to appear and click delete
    await waitFor(() => {
      expect(screen.getByText('Delete Client')).toBeInTheDocument();
    });

    const deleteMenuItem = screen.getByText('Delete Client');
    fireEvent.click(deleteMenuItem);

    // Wait for confirmation dialog and click confirm
    await waitFor(() => {
      expect(screen.getByText(/Delete John Doe/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /delete$/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "Failed to delete client. Please try again.",
        variant: "destructive",
      });
    });
  });

  it('does not call onDelete when dialog is cancelled', async () => {
    render(
      <ClientProfile
        client={mockClient}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        isEditing={false}
        onEditToggle={mockOnEditToggle}
      />
    );

    // Click three-dots menu button
    const menuButtons = screen.getAllByRole('button');
    const menuButton = menuButtons.find(button => 
      button.querySelector('svg.lucide-ellipsis-vertical')
    );
    fireEvent.click(menuButton!);

    // Wait for menu to appear and click delete
    await waitFor(() => {
      expect(screen.getByText('Delete Client')).toBeInTheDocument();
    });

    const deleteMenuItem = screen.getByText('Delete Client');
    fireEvent.click(deleteMenuItem);

    // Wait for confirmation dialog and click cancel
    await waitFor(() => {
      expect(screen.getByText(/Delete John Doe/i)).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnDelete).not.toHaveBeenCalled();
  });
});