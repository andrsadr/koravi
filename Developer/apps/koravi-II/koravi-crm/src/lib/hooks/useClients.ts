'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ClientService, DatabaseError } from '../database';
import { Client, ClientFormData } from '../types';
import { useErrorHandler, useSuccessHandler } from './useErrorHandler';

// Hook for fetching and managing multiple clients
export function useClients(options?: {
  search?: string;
  status?: string;
  labels?: string[];
  limit?: number;
  offset?: number;
}) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ClientService.getClients(options);
      setClients(data);
    } catch (err) {
      const errorMessage = err instanceof DatabaseError 
        ? err.message 
        : 'Failed to fetch clients';
      setError(errorMessage);
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients, refetchTrigger]);

  const refetch = useCallback(() => {
    setRefetchTrigger(prev => prev + 1);
  }, []);

  return {
    clients,
    loading,
    error,
    refetch,
  };
}

// Hook for fetching a single client
export function useClient(id: string | null) {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setClient(null);
      setLoading(false);
      return;
    }

    const fetchClient = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ClientService.getClient(id);
        setClient(data);
      } catch (err) {
        const errorMessage = err instanceof DatabaseError 
          ? err.message 
          : 'Failed to fetch client';
        setError(errorMessage);
        console.error('Error fetching client:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id]);

  return {
    client,
    loading,
    error,
  };
}

// Hook for creating clients
export function useCreateClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleDatabaseError } = useErrorHandler();
  const { showSuccess } = useSuccessHandler();

  const createClient = useCallback(async (clientData: ClientFormData): Promise<Client | null> => {
    try {
      setLoading(true);
      setError(null);
      const newClient = await ClientService.createClient(clientData);
      showSuccess(`Client ${newClient.first_name} ${newClient.last_name} created successfully`);
      return newClient;
    } catch (err) {
      const errorResult = handleDatabaseError(err);
      setError(errorResult.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleDatabaseError, showSuccess]);

  return {
    createClient,
    loading,
    error,
  };
}

// Hook for updating clients
export function useUpdateClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleDatabaseError } = useErrorHandler();
  const { showSuccess } = useSuccessHandler();

  const updateClient = useCallback(async (
    id: string, 
    updates: Partial<ClientFormData>
  ): Promise<Client | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedClient = await ClientService.updateClient(id, updates);
      showSuccess(`Client ${updatedClient.first_name} ${updatedClient.last_name} updated successfully`);
      return updatedClient;
    } catch (err) {
      const errorResult = handleDatabaseError(err);
      setError(errorResult.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleDatabaseError, showSuccess]);

  return {
    updateClient,
    loading,
    error,
  };
}

// Hook for deleting clients
export function useDeleteClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleDatabaseError } = useErrorHandler();
  const { showSuccess } = useSuccessHandler();

  const deleteClient = useCallback(async (id: string, clientName?: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await ClientService.deleteClient(id);
      showSuccess(`Client ${clientName || ''} deleted successfully`);
      return true;
    } catch (err) {
      const errorResult = handleDatabaseError(err);
      setError(errorResult.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleDatabaseError, showSuccess]);

  return {
    deleteClient,
    loading,
    error,
  };
}

// Hook for searching clients with debouncing
export function useClientSearch(initialQuery: string = '', debounceMs: number = 300) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [results, setResults] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const searchClients = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ClientService.searchClients(debouncedQuery);
        setResults(data);
      } catch (err) {
        const errorMessage = err instanceof DatabaseError 
          ? err.message 
          : 'Search failed';
        setError(errorMessage);
        console.error('Error searching clients:', err);
      } finally {
        setLoading(false);
      }
    };

    searchClients();
  }, [debouncedQuery]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    hasQuery: debouncedQuery.trim().length > 0,
  };
}

// Hook for client statistics
export function useClientStats() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    archived: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ClientService.getClientStats();
        setStats(data);
      } catch (err) {
        const errorMessage = err instanceof DatabaseError 
          ? err.message 
          : 'Failed to fetch statistics';
        setError(errorMessage);
        console.error('Error fetching client stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
  };
}

// Combined hook for client management operations
export function useClientManager() {
  const { createClient, loading: creating, error: createError } = useCreateClient();
  const { updateClient, loading: updating, error: updateError } = useUpdateClient();
  const { deleteClient, loading: deleting, error: deleteError } = useDeleteClient();

  const isLoading = creating || updating || deleting;
  const error = createError || updateError || deleteError;

  return {
    createClient,
    updateClient,
    deleteClient,
    loading: isLoading,
    error,
  };
}