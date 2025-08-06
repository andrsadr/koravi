import { ClientService, DatabaseError } from '../database';
import { supabase } from '../supabase';
import { Client, ClientFormData } from '../types';

// Mock Supabase
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
  withRetry: jest.fn((fn) => fn()),
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('ClientService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getClients', () => {
    const mockClients: Client[] = [
      {
        id: '1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        date_of_birth: '1990-01-01',
        gender: 'male',
        occupation: 'Engineer',
        address_line1: '123 Main St',
        address_line2: null,
        city: 'New York',
        state: 'NY',
        postal_code: '10001',
        country: 'US',
        status: 'active',
        labels: ['vip', 'regular'],
        notes: 'Great client',
        alerts: null,
        last_visit: '2024-01-15',
        total_visits: 5,
        lifetime_value: 500.00,
      },
    ];

    it('should fetch all clients successfully', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        textSearch: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        overlaps: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ data: mockClients, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await ClientService.getClients();

      expect(mockSupabase.from).toHaveBeenCalledWith('clients');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.order).toHaveBeenCalledWith('updated_at', { ascending: false });
      expect(result).toEqual(mockClients);
    });

    it('should apply search filter when provided', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        textSearch: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        overlaps: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ data: mockClients, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await ClientService.getClients({ search: 'John' });

      expect(mockQuery.textSearch).toHaveBeenCalledWith('search_vector', 'John');
    });

    it('should apply status filter when provided', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        textSearch: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        overlaps: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ data: mockClients, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await ClientService.getClients({ status: 'active' });

      expect(mockQuery.eq).toHaveBeenCalledWith('status', 'active');
    });

    it('should apply labels filter when provided', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        textSearch: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        overlaps: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ data: mockClients, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await ClientService.getClients({ labels: ['vip'] });

      expect(mockQuery.overlaps).toHaveBeenCalledWith('labels', ['vip']);
    });

    it('should throw DatabaseError when query fails', async () => {
      const mockError = { message: 'Connection failed', code: 'CONNECTION_ERROR' };
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        textSearch: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        overlaps: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await expect(ClientService.getClients()).rejects.toThrow(DatabaseError);
    });
  });

  describe('getClient', () => {
    const mockClient: Client = {
      id: '1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      date_of_birth: '1990-01-01',
      gender: 'male',
      occupation: 'Engineer',
      address_line1: '123 Main St',
      address_line2: null,
      city: 'New York',
      state: 'NY',
      postal_code: '10001',
      country: 'US',
      status: 'active',
      labels: ['vip', 'regular'],
      notes: 'Great client',
      alerts: null,
      last_visit: '2024-01-15',
      total_visits: 5,
      lifetime_value: 500.00,
    };

    it('should fetch a single client successfully', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockClient, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await ClientService.getClient('1');

      expect(mockSupabase.from).toHaveBeenCalledWith('clients');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1');
      expect(result).toEqual(mockClient);
    });

    it('should return null when client not found', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { code: 'PGRST116', message: 'No rows found' } 
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await ClientService.getClient('nonexistent');

      expect(result).toBeNull();
    });

    it('should throw DatabaseError for other errors', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { code: 'CONNECTION_ERROR', message: 'Connection failed' } 
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await expect(ClientService.getClient('1')).rejects.toThrow(DatabaseError);
    });
  });

  describe('createClient', () => {
    const mockClientData: ClientFormData = {
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@example.com',
      phone: '+1987654321',
      date_of_birth: '1985-05-15',
      gender: 'female',
      occupation: 'Designer',
      address_line1: '456 Oak Ave',
      address_line2: null,
      city: 'Los Angeles',
      state: 'CA',
      postal_code: '90210',
      country: 'US',
      status: 'active',
      labels: ['new'],
      notes: 'New client',
      alerts: null,
      last_visit: null,
      total_visits: 0,
      lifetime_value: 0,
    };

    const mockCreatedClient: Client = {
      id: '2',
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
      ...mockClientData,
    };

    it('should create a new client successfully', async () => {
      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCreatedClient, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await ClientService.createClient(mockClientData);

      expect(mockSupabase.from).toHaveBeenCalledWith('clients');
      expect(mockQuery.insert).toHaveBeenCalledWith({
        ...mockClientData,
        labels: mockClientData.labels || [],
        total_visits: mockClientData.total_visits || 0,
        lifetime_value: mockClientData.lifetime_value || 0,
      });
      expect(result).toEqual(mockCreatedClient);
    });

    it('should throw DatabaseError when creation fails', async () => {
      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { code: 'UNIQUE_VIOLATION', message: 'Email already exists' } 
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await expect(ClientService.createClient(mockClientData)).rejects.toThrow(DatabaseError);
    });
  });

  describe('updateClient', () => {
    const mockUpdates = { first_name: 'Updated Name' };
    const mockUpdatedClient: Client = {
      id: '1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
      first_name: 'Updated Name',
      last_name: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      date_of_birth: '1990-01-01',
      gender: 'male',
      occupation: 'Engineer',
      address_line1: '123 Main St',
      address_line2: null,
      city: 'New York',
      state: 'NY',
      postal_code: '10001',
      country: 'US',
      status: 'active',
      labels: ['vip', 'regular'],
      notes: 'Great client',
      alerts: null,
      last_visit: '2024-01-15',
      total_visits: 5,
      lifetime_value: 500.00,
    };

    it('should update a client successfully', async () => {
      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockUpdatedClient, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await ClientService.updateClient('1', mockUpdates);

      expect(mockSupabase.from).toHaveBeenCalledWith('clients');
      expect(mockQuery.update).toHaveBeenCalledWith({
        ...mockUpdates,
        updated_at: expect.any(String),
      });
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1');
      expect(result).toEqual(mockUpdatedClient);
    });

    it('should throw DatabaseError when update fails', async () => {
      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { code: 'NOT_FOUND', message: 'Client not found' } 
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await expect(ClientService.updateClient('nonexistent', mockUpdates)).rejects.toThrow(DatabaseError);
    });
  });

  describe('deleteClient', () => {
    it('should delete a client successfully', async () => {
      const mockQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await ClientService.deleteClient('1');

      expect(mockSupabase.from).toHaveBeenCalledWith('clients');
      expect(mockQuery.delete).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1');
    });

    it('should throw DatabaseError when deletion fails', async () => {
      const mockQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ 
          error: { code: 'NOT_FOUND', message: 'Client not found' } 
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await expect(ClientService.deleteClient('nonexistent')).rejects.toThrow(DatabaseError);
    });
  });

  describe('searchClients', () => {
    const mockClients: Client[] = [
      {
        id: '1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        date_of_birth: '1990-01-01',
        gender: 'male',
        occupation: 'Engineer',
        address_line1: '123 Main St',
        address_line2: null,
        city: 'New York',
        state: 'NY',
        postal_code: '10001',
        country: 'US',
        status: 'active',
        labels: ['vip', 'regular'],
        notes: 'Great client',
        alerts: null,
        last_visit: '2024-01-15',
        total_visits: 5,
        lifetime_value: 500.00,
      },
    ];

    it('should search clients successfully', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        textSearch: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockClients, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await ClientService.searchClients('John');

      expect(mockSupabase.from).toHaveBeenCalledWith('clients');
      expect(mockQuery.textSearch).toHaveBeenCalledWith('search_vector', 'John');
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockClients);
    });

    it('should use custom limit when provided', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        textSearch: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockClients, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await ClientService.searchClients('John', 5);

      expect(mockQuery.limit).toHaveBeenCalledWith(5);
    });

    it('should throw DatabaseError when search fails', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        textSearch: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { code: 'SEARCH_ERROR', message: 'Search failed' } 
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await expect(ClientService.searchClients('John')).rejects.toThrow(DatabaseError);
    });
  });

  describe('getClientStats', () => {
    const mockClientsData = [
      { status: 'active' },
      { status: 'active' },
      { status: 'inactive' },
      { status: 'archived' },
    ];

    it('should calculate client statistics correctly', async () => {
      const mockQuery = {
        select: jest.fn().mockResolvedValue({ data: mockClientsData, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await ClientService.getClientStats();

      expect(mockSupabase.from).toHaveBeenCalledWith('clients');
      expect(mockQuery.select).toHaveBeenCalledWith('status');
      expect(result).toEqual({
        total: 4,
        active: 2,
        inactive: 1,
        archived: 1,
      });
    });

    it('should handle empty data', async () => {
      const mockQuery = {
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await ClientService.getClientStats();

      expect(result).toEqual({
        total: 0,
        active: 0,
        inactive: 0,
        archived: 0,
      });
    });

    it('should throw DatabaseError when stats query fails', async () => {
      const mockQuery = {
        select: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { code: 'STATS_ERROR', message: 'Stats query failed' } 
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await expect(ClientService.getClientStats()).rejects.toThrow(DatabaseError);
    });
  });
});