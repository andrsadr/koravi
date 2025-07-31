import { supabase, withRetry } from './supabase';
import { Client, ClientFormData } from './types';
import { Database } from './database.types';

// Type aliases for cleaner code
type ClientInsert = Database['public']['Tables']['clients']['Insert'];
type ClientUpdate = Database['public']['Tables']['clients']['Update'];

// Database error types
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Client service functions with error handling
export class ClientService {
  // Get all clients with optional filtering
  static async getClients(options?: {
    search?: string;
    status?: string;
    labels?: string[];
    limit?: number;
    offset?: number;
  }): Promise<Client[]> {
    try {
      return await withRetry(async () => {
        let query = supabase
          .from('clients')
          .select('*')
          .order('updated_at', { ascending: false });

        // Apply filters
        if (options?.search) {
          query = query.textSearch('search_vector', options.search);
        }

        if (options?.status && ['active', 'inactive', 'archived'].includes(options.status)) {
          query = query.eq('status', options.status as 'active' | 'inactive' | 'archived');
        }

        if (options?.labels && options.labels.length > 0) {
          query = query.overlaps('labels', options.labels);
        }

        if (options?.limit) {
          query = query.limit(options.limit);
        }

        if (options?.offset) {
          query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
        }

        const { data, error } = await query;

        if (error) {
          throw new DatabaseError(
            `Failed to fetch clients: ${error.message}`,
            error.code,
            error
          );
        }

        return data || [];
      });
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        `Unexpected error fetching clients: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Get a single client by ID
  static async getClient(id: string): Promise<Client | null> {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return null; // Client not found
          }
          throw new DatabaseError(
            `Failed to fetch client: ${error.message}`,
            error.code,
            error
          );
        }

        return data;
      });
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        `Unexpected error fetching client: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Create a new client
  static async createClient(clientData: ClientFormData): Promise<Client> {
    try {
      return await withRetry(async () => {
        const insertData: ClientInsert = {
          ...clientData,
          labels: clientData.labels || [],
          total_visits: clientData.total_visits || 0,
          lifetime_value: clientData.lifetime_value || 0,
        };

        const { data, error } = await supabase
          .from('clients')
          .insert(insertData)
          .select()
          .single();

        if (error) {
          throw new DatabaseError(
            `Failed to create client: ${error.message}`,
            error.code,
            error
          );
        }

        return data;
      });
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        `Unexpected error creating client: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Update an existing client
  static async updateClient(id: string, updates: Partial<ClientFormData>): Promise<Client> {
    try {
      return await withRetry(async () => {
        const updateData: ClientUpdate = {
          ...updates,
          updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from('clients')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          throw new DatabaseError(
            `Failed to update client: ${error.message}`,
            error.code,
            error
          );
        }

        return data;
      });
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        `Unexpected error updating client: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Delete a client
  static async deleteClient(id: string): Promise<void> {
    try {
      return await withRetry(async () => {
        const { error } = await supabase
          .from('clients')
          .delete()
          .eq('id', id);

        if (error) {
          throw new DatabaseError(
            `Failed to delete client: ${error.message}`,
            error.code,
            error
          );
        }
      });
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        `Unexpected error deleting client: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Search clients with full-text search
  static async searchClients(query: string, limit: number = 10): Promise<Client[]> {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .textSearch('search_vector', query)
          .limit(limit)
          .order('updated_at', { ascending: false });

        if (error) {
          throw new DatabaseError(
            `Failed to search clients: ${error.message}`,
            error.code,
            error
          );
        }

        return data || [];
      });
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        `Unexpected error searching clients: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Get client statistics
  static async getClientStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    archived: number;
  }> {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('clients')
          .select('status');

        if (error) {
          throw new DatabaseError(
            `Failed to fetch client statistics: ${error.message}`,
            error.code,
            error
          );
        }

        const stats = {
          total: data?.length || 0,
          active: 0,
          inactive: 0,
          archived: 0,
        };

        data?.forEach(client => {
          stats[client.status as keyof typeof stats]++;
        });

        return stats;
      });
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        `Unexpected error fetching statistics: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}