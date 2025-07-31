import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found. Using placeholder values for development.');
}

// Create Supabase client with proper typing
export const supabase: SupabaseClient<Database> = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: false, // No auth in initial version
    },
    db: {
      schema: 'public',
    },
  }
);

// Connection status interface
export interface ConnectionStatus {
  connected: boolean;
  error?: unknown;
  message?: string;
}

// Enhanced database connection status check
export const checkConnection = async (): Promise<ConnectionStatus> => {
  try {
    // Try to perform a simple query to test connection
    const { error } = await supabase
      .from('clients')
      .select('count')
      .limit(1)
      .single();

    if (error) {
      // Check if it's a table not found error (expected in fresh setup)
      if (error.code === 'PGRST116' || error.message.includes('relation "clients" does not exist')) {
        return {
          connected: true,
          error: null,
          message: 'Connected to Supabase, but clients table not yet created'
        };
      }
      
      return {
        connected: false,
        error,
        message: `Database error: ${error.message}`
      };
    }

    return {
      connected: true,
      error: null,
      message: 'Successfully connected to Supabase'
    };
  } catch (error) {
    return {
      connected: false,
      error,
      message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// Retry logic for database operations
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }
  
  throw lastError;
};

// Health check function
export const healthCheck = async (): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  details: ConnectionStatus;
}> => {
  const connectionStatus = await checkConnection();
  
  if (connectionStatus.connected) {
    return {
      status: 'healthy',
      details: connectionStatus
    };
  }
  
  // Check if it's just missing tables (degraded but recoverable)
  if (connectionStatus.message?.includes('table not yet created')) {
    return {
      status: 'degraded',
      details: connectionStatus
    };
  }
  
  return {
    status: 'unhealthy',
    details: connectionStatus
  };
};