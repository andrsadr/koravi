"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClientService } from '@/lib/database';
import { ClientFormData, Client } from '@/lib/types';

interface UseClientFormOptions {
  client?: Client;
  onSuccess?: (client: Client) => void;
  redirectTo?: string;
}

export function useClientForm({ client, onSuccess, redirectTo }: UseClientFormOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (data: ClientFormData): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      let result: Client;

      if (client) {
        // Update existing client
        result = await ClientService.updateClient(client.id, data);
      } else {
        // Create new client
        result = await ClientService.createClient(data);
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result);
      }

      // Redirect if specified
      if (redirectTo) {
        router.push(redirectTo);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (redirectTo) {
      router.push(redirectTo);
    } else {
      router.back();
    }
  };

  return {
    handleSubmit,
    handleCancel,
    isLoading,
    error,
    isEditMode: !!client,
  };
}