import { renderHook, act } from '@testing-library/react';
import { useErrorHandler, useSuccessHandler } from '../useErrorHandler';

// Mock the database module to avoid Supabase import issues
jest.mock('../../database', () => ({
  DatabaseError: class DatabaseError extends Error {
    constructor(message: string, public code?: string, public details?: unknown) {
      super(message);
      this.name = 'DatabaseError';
    }
  }
}));

// Mock the useToast hook
const mockToast = jest.fn();
jest.mock('../useToast', () => ({
  useToast: jest.fn(() => ({
    toast: mockToast,
  })),
}));

describe('useErrorHandler', () => {
  beforeEach(() => {
    mockToast.mockClear();
  });

  describe('handleError', () => {
    it('handles DatabaseError correctly', () => {
      const { result } = renderHook(() => useErrorHandler());
      const { DatabaseError } = require('../../database');
      const error = new DatabaseError('Database connection failed', 'DB001');

      act(() => {
        result.current.handleError(error);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Database connection failed',
        variant: 'destructive',
      });
    });

    it('handles generic Error correctly', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new Error('Something went wrong');

      act(() => {
        result.current.handleError(error);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    });

    it('handles string errors correctly', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = 'String error message';

      act(() => {
        result.current.handleError(error);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'String error message',
        variant: 'destructive',
      });
    });

    it('uses fallback message for unknown errors', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = { unknown: 'object' };

      act(() => {
        result.current.handleError(error);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    });

    it('respects custom options', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new Error('Test error');
      const onError = jest.fn();

      act(() => {
        result.current.handleError(error, {
          toastTitle: 'Custom Title',
          fallbackMessage: 'Custom fallback',
          onError,
        });
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Custom Title',
        description: 'Test error',
        variant: 'destructive',
      });
      expect(onError).toHaveBeenCalledWith(error);
    });

    it('can disable toast notifications', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new Error('Test error');

      act(() => {
        result.current.handleError(error, { showToast: false });
      });

      expect(mockToast).not.toHaveBeenCalled();
    });
  });

  describe('specific error handlers', () => {
    it('handleDatabaseError uses correct title', () => {
      const { result } = renderHook(() => useErrorHandler());
      const { DatabaseError } = require('../../database');
      const error = new DatabaseError('Connection failed');

      act(() => {
        result.current.handleDatabaseError(error);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Database Error',
        description: 'Connection failed',
        variant: 'destructive',
      });
    });

    it('handleFormError uses correct title', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new Error('Validation failed');

      act(() => {
        result.current.handleFormError(error);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Form Error',
        description: 'Validation failed',
        variant: 'destructive',
      });
    });

    it('handleNetworkError uses correct title', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new Error('Network timeout');

      act(() => {
        result.current.handleNetworkError(error);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Network Error',
        description: 'Network timeout',
        variant: 'destructive',
      });
    });

    it('handleValidationError does not show toast by default', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new Error('Invalid input');

      act(() => {
        result.current.handleValidationError(error);
      });

      expect(mockToast).not.toHaveBeenCalled();
    });
  });
});

describe('useSuccessHandler', () => {
  beforeEach(() => {
    mockToast.mockClear();
  });

  it('shows success message with default title', () => {
    const { result } = renderHook(() => useSuccessHandler());

    act(() => {
      result.current.showSuccess('Operation completed');
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'Operation completed',
      variant: 'default',
    });
  });

  it('shows success message with custom title', () => {
    const { result } = renderHook(() => useSuccessHandler());

    act(() => {
      result.current.showSuccess('Client saved', 'Client Updated');
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Client Updated',
      description: 'Client saved',
      variant: 'default',
    });
  });
});