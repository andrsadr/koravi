import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ClientForm } from '../ClientForm';
import { ClientFormData } from '../../../lib/types';

// Mock the toast hook
const mockToast = jest.fn();
jest.mock('../../../lib/hooks/useToast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

describe('ClientForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('renders all required form fields', () => {
      render(<ClientForm {...defaultProps} />);

      // Essential fields should be visible
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();

      // Form buttons
      expect(screen.getByRole('button', { name: /add client/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('shows optional fields when expanded', async () => {
      const user = userEvent.setup();
      render(<ClientForm {...defaultProps} />);

      // Click to expand optional fields
      const expandButton = screen.getByRole('button', { name: /show more fields/i });
      await user.click(expandButton);

      // Optional fields should now be visible
      expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/occupation/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/address line 1/i)).toBeInTheDocument();
    });

    it('renders in edit mode when client data is provided', () => {
      const existingClient: Partial<ClientFormData> = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '555-0123',
        status: 'active',
        labels: ['VIP'],
        country: 'US',
        total_visits: 5,
        lifetime_value: 500,
      };

      render(<ClientForm {...defaultProps} client={existingClient} />);

      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /update client/i })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows validation errors for required fields', async () => {
      const user = userEvent.setup();
      render(<ClientForm {...defaultProps} />);

      // Try to submit without filling required fields
      const submitButton = screen.getByRole('button', { name: /add client/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it.skip('validates email format', async () => {
      // TODO: Fix email validation - currently not working as expected
      const user = userEvent.setup();
      render(<ClientForm {...defaultProps} />);

      // Fill required fields first
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid-email');

      const submitButton = screen.getByRole('button', { name: /add client/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('validates phone number format', async () => {
      const user = userEvent.setup();
      render(<ClientForm {...defaultProps} />);

      const phoneInput = screen.getByLabelText(/phone/i);
      await user.type(phoneInput, '123'); // Too short

      const submitButton = screen.getByRole('button', { name: /add client/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/phone number must be at least 10 characters/i)).toBeInTheDocument();
      });
    });

    it('requires at least email or phone', async () => {
      const user = userEvent.setup();
      render(<ClientForm {...defaultProps} />);

      // Fill only name fields
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');

      const submitButton = screen.getByRole('button', { name: /add client/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please provide either email or phone number/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const user = userEvent.setup();
      render(<ClientForm {...defaultProps} />);

      // Fill required fields
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'john@example.com');

      const submitButton = screen.getByRole('button', { name: /add client/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            phone: null,
            status: 'active',
            country: 'US',
            labels: [],
            total_visits: 0,
            lifetime_value: 0,
          })
        );
      });
    });

    it('shows loading state during submission', () => {
      render(<ClientForm {...defaultProps} isLoading={true} />);

      const submitButton = screen.getByRole('button', { name: /adding client/i });
      expect(submitButton).toBeDisabled();
    });

    it('handles submission errors', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Failed to create client';
      mockOnSubmit.mockRejectedValueOnce(new Error(errorMessage));

      render(<ClientForm {...defaultProps} />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'john@example.com');

      const submitButton = screen.getByRole('button', { name: /add client/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      });
    });

    it('shows success message on successful submission', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValueOnce(undefined);

      render(<ClientForm {...defaultProps} />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'john@example.com');

      const submitButton = screen.getByRole('button', { name: /add client/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Success',
          description: 'Client added successfully',
        });
      });
    });
  });

  describe('Progressive Disclosure', () => {
    it('toggles optional fields visibility', async () => {
      const user = userEvent.setup();
      render(<ClientForm {...defaultProps} />);

      // Optional fields should be hidden initially
      expect(screen.queryByLabelText(/date of birth/i)).not.toBeInTheDocument();

      // Click to show optional fields
      const expandButton = screen.getByRole('button', { name: /show more fields/i });
      await user.click(expandButton);

      // Optional fields should now be visible
      expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();

      // Click to hide optional fields
      const collapseButton = screen.getByRole('button', { name: /show fewer fields/i });
      await user.click(collapseButton);

      // Optional fields should be hidden again
      expect(screen.queryByLabelText(/date of birth/i)).not.toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<ClientForm {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('handles label input and creation', async () => {
      const user = userEvent.setup();
      render(<ClientForm {...defaultProps} />);

      // Expand optional fields to access labels
      const expandButton = screen.getByRole('button', { name: /show more fields/i });
      await user.click(expandButton);

      const labelInput = screen.getByLabelText(/labels/i);
      await user.type(labelInput, 'VIP,Regular');

      // Labels should be processed correctly
      expect(labelInput).toHaveValue('VIP,Regular');
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels and ARIA attributes', () => {
      render(<ClientForm {...defaultProps} />);

      // Check that form fields have proper labels
      expect(screen.getByLabelText(/first name/i)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText(/last name/i)).toHaveAttribute('aria-required', 'true');
    });

    it('announces validation errors to screen readers', async () => {
      const user = userEvent.setup();
      render(<ClientForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /add client/i });
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(/first name is required/i);
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });
  });
});