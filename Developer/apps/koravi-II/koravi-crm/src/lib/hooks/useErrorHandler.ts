"use client"

import { useCallback } from 'react';
import { useToast } from './useToast';
import { DatabaseError } from '../database';

export interface ErrorHandlerOptions {
  showToast?: boolean;
  toastTitle?: string;
  fallbackMessage?: string;
  onError?: (error: Error) => void;
}

export function useErrorHandler() {
  const { toast } = useToast();

  const handleError = useCallback((
    error: unknown, 
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      toastTitle = 'Error',
      fallbackMessage = 'An unexpected error occurred',
      onError
    } = options;

    let errorMessage = fallbackMessage;
    let errorCode: string | undefined;

    // Parse different error types
    if (error instanceof DatabaseError) {
      errorMessage = error.message;
      errorCode = error.code;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    // Log error for debugging
    console.error('Error handled:', error);

    // Show toast notification
    if (showToast) {
      toast({
        title: toastTitle,
        description: errorMessage,
        variant: 'destructive',
      });
    }

    // Call custom error handler
    if (onError && error instanceof Error) {
      onError(error);
    }

    return {
      message: errorMessage,
      code: errorCode,
      originalError: error
    };
  }, [toast]);

  // Specific handlers for common error scenarios
  const handleDatabaseError = useCallback((error: unknown) => {
    return handleError(error, {
      toastTitle: 'Database Error',
      fallbackMessage: 'Failed to connect to database. Please try again.',
    });
  }, [handleError]);

  const handleFormError = useCallback((error: unknown) => {
    return handleError(error, {
      toastTitle: 'Form Error',
      fallbackMessage: 'Please check your input and try again.',
    });
  }, [handleError]);

  const handleNetworkError = useCallback((error: unknown) => {
    return handleError(error, {
      toastTitle: 'Network Error',
      fallbackMessage: 'Please check your internet connection and try again.',
    });
  }, [handleError]);

  const handleValidationError = useCallback((error: unknown) => {
    return handleError(error, {
      toastTitle: 'Validation Error',
      fallbackMessage: 'Please correct the highlighted fields.',
      showToast: false, // Usually handled by form validation
    });
  }, [handleError]);

  return {
    handleError,
    handleDatabaseError,
    handleFormError,
    handleNetworkError,
    handleValidationError,
  };
}

// Success handler for positive feedback
export function useSuccessHandler() {
  const { toast } = useToast();

  const showSuccess = useCallback((
    message: string,
    title: string = 'Success'
  ) => {
    toast({
      title,
      description: message,
      variant: 'default',
    });
  }, [toast]);

  return { showSuccess };
}

// Loading state handler
export function useLoadingHandler() {
  const { toast } = useToast();

  const showLoading = useCallback((message: string = 'Loading...') => {
    return toast({
      title: message,
      description: 'Please wait...',
      variant: 'default',
    });
  }, [toast]);

  return { showLoading };
}