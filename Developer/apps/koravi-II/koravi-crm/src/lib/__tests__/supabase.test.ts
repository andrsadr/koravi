import { createClient } from '@supabase/supabase-js';
import { supabase } from '../supabase';

// Mock the Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

describe('Supabase Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates Supabase client with correct configuration', () => {
    const mockClient = {
      from: jest.fn(),
      auth: {
        signIn: jest.fn(),
        signOut: jest.fn(),
        getUser: jest.fn(),
      },
    };

    mockCreateClient.mockReturnValue(mockClient as any);

    // Re-import to trigger client creation
    jest.resetModules();
    require('../supabase');

    expect(mockCreateClient).toHaveBeenCalledWith(
      expect.any(String), // URL
      expect.any(String), // Anon key
      expect.objectContaining({
        auth: expect.objectContaining({
          persistSession: false,
        }),
      })
    );
  });

  it('exports the client instance', () => {
    expect(supabase).toBeDefined();
    expect(typeof supabase).toBe('object');
  });

  it('has required methods', () => {
    expect(supabase.from).toBeDefined();
    expect(typeof supabase.from).toBe('function');
  });
});