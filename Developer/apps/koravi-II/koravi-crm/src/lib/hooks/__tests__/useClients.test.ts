import { renderHook, act, waitFor } from '@testing-library/react';
import { 
  useClients, 
  useClient, 
  useCreateClient, 
  useUpdateClient, 
  useDeleteClient,
  useClientSearch,
  useClientStats,
  useClientManager
} from '../useClients';
import { ClientService, DatabaseError } from '../../database';
import { Client, ClientFormData } from '../../types';

// Mock the ClientService
jest.mock('../../database', () => ({
  ClientService: {
    getClients: jest.fn(),
    getClient: jest.fn(),
    createClient: jest.fn(),
    updateClient: jest.fn(),
    deleteClient: jest.fn(),
    searchClients: jest.fn(),
    getClientStats: jest.fn(),
  },
  DatabaseError: class DatabaseError extends Error {
    constructor(message: string, public code?: string) {
      super(message);
      this.name = 'DatabaseError';
    }
  },
}));

const mockClientService = ClientService as jest.Mocked<typeof ClientService>;

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

const mockClients: Client[] = [mockClient];

describe('useClients', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch clients successfully', async () => {
    mockClientService.getClients.mockResolvedValue(mockClients);

    const { result } = renderHook(() => useClients());

    expect(result.current.loading).toBe(true);
    expect(result.current.clients).toEqual([]);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.clients).toEqual(mockClients);
    expect(result.current.error).toBeNull();
    expect(mockClientService.getClients).toHaveBeenCalledWith(undefined);
  });

  it('should pass options to getClients', async () => {
    mockClientService.getClients.mockResolvedValue(mockClients);
    const options = { search: 'John', status: 'active' };

    renderHook(() => useClients(options));

    await waitFor(() => {
      expect(mockClientService.getClients).toHaveBeenCalledWith(options);
    });
  });

  it('should handle errors', async () => {
    const error = new DatabaseError('Failed to fetch clients');
    mockClientService.getClients.mockRejectedValue(error);

    const { result } = renderHook(() => useClients());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch clients');
    expect(result.current.clients).toEqual([]);
  });

  it('should refetch clients when refetch is called', async () => {
    mockClientService.getClients.mockResolvedValue(mockClients);

    const { result } = renderHook(() => useClients());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockClientService.getClients).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(mockClientService.getClients).toHaveBeenCalledTimes(2);
    });
  });
});

describe('useClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch a single client successfully', async () => {
    mockClientService.getClient.mockResolvedValue(mockClient);

    const { result } = renderHook(() => useClient('1'));

    expect(result.current.loading).toBe(true);
    expect(result.current.client).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.client).toEqual(mockClient);
    expect(result.current.error).toBeNull();
    expect(mockClientService.getClient).toHaveBeenCalledWith('1');
  });

  it('should handle null id', () => {
    const { result } = renderHook(() => useClient(null));

    expect(result.current.loading).toBe(false);
    expect(result.current.client).toBeNull();
    expect(result.current.error).toBeNull();
    expect(mockClientService.getClient).not.toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    const error = new DatabaseError('Client not found');
    mockClientService.getClient.mockRejectedValue(error);

    const { result } = renderHook(() => useClient('1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Client not found');
    expect(result.current.client).toBeNull();
  });
});

describe('useCreateClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a client successfully', async () => {
    const clientData: ClientFormData = {
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

    const createdClient: Client = {
      id: '2',
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
      ...clientData,
    };

    mockClientService.createClient.mockResolvedValue(createdClient);

    const { result } = renderHook(() => useCreateClient());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();

    let createdResult: Client | null = null;
    await act(async () => {
      createdResult = await result.current.createClient(clientData);
    });

    expect(createdResult).toEqual(createdClient);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockClientService.createClient).toHaveBeenCalledWith(clientData);
  });

  it('should handle creation errors', async () => {
    const clientData: ClientFormData = {
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

    const error = new DatabaseError('Email already exists');
    mockClientService.createClient.mockRejectedValue(error);

    const { result } = renderHook(() => useCreateClient());

    let createdResult: Client | null = null;
    await act(async () => {
      createdResult = await result.current.createClient(clientData);
    });

    expect(createdResult).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Email already exists');
  });
});

describe('useUpdateClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update a client successfully', async () => {
    const updates = { first_name: 'Updated Name' };
    const updatedClient: Client = { ...mockClient, ...updates };

    mockClientService.updateClient.mockResolvedValue(updatedClient);

    const { result } = renderHook(() => useUpdateClient());

    let updateResult: Client | null = null;
    await act(async () => {
      updateResult = await result.current.updateClient('1', updates);
    });

    expect(updateResult).toEqual(updatedClient);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockClientService.updateClient).toHaveBeenCalledWith('1', updates);
  });

  it('should handle update errors', async () => {
    const updates = { first_name: 'Updated Name' };
    const error = new DatabaseError('Client not found');
    mockClientService.updateClient.mockRejectedValue(error);

    const { result } = renderHook(() => useUpdateClient());

    let updateResult: Client | null = null;
    await act(async () => {
      updateResult = await result.current.updateClient('1', updates);
    });

    expect(updateResult).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Client not found');
  });
});

describe('useDeleteClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a client successfully', async () => {
    mockClientService.deleteClient.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteClient());

    let deleteResult: boolean = false;
    await act(async () => {
      deleteResult = await result.current.deleteClient('1');
    });

    expect(deleteResult).toBe(true);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockClientService.deleteClient).toHaveBeenCalledWith('1');
  });

  it('should handle deletion errors', async () => {
    const error = new DatabaseError('Client not found');
    mockClientService.deleteClient.mockRejectedValue(error);

    const { result } = renderHook(() => useDeleteClient());

    let deleteResult: boolean = true;
    await act(async () => {
      deleteResult = await result.current.deleteClient('1');
    });

    expect(deleteResult).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Client not found');
  });
});

describe('useClientSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should search clients with debouncing', async () => {
    mockClientService.searchClients.mockResolvedValue(mockClients);

    const { result } = renderHook(() => useClientSearch('', 300));

    expect(result.current.query).toBe('');
    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);

    act(() => {
      result.current.setQuery('John');
    });

    expect(result.current.query).toBe('John');
    expect(mockClientService.searchClients).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockClientService.searchClients).toHaveBeenCalledWith('John');
    });

    await waitFor(() => {
      expect(result.current.results).toEqual(mockClients);
    });
  });

  it('should not search for empty queries', async () => {
    const { result } = renderHook(() => useClientSearch('', 300));

    act(() => {
      result.current.setQuery('   ');
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockClientService.searchClients).not.toHaveBeenCalled();
    expect(result.current.results).toEqual([]);
  });

  it('should handle search errors', async () => {
    const error = new DatabaseError('Search failed');
    mockClientService.searchClients.mockRejectedValue(error);

    const { result } = renderHook(() => useClientSearch('', 300));

    act(() => {
      result.current.setQuery('John');
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Search failed');
    });
  });
});

describe('useClientStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch client statistics successfully', async () => {
    const mockStats = {
      total: 10,
      active: 7,
      inactive: 2,
      archived: 1,
    };

    mockClientService.getClientStats.mockResolvedValue(mockStats);

    const { result } = renderHook(() => useClientStats());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats).toEqual(mockStats);
    expect(result.current.error).toBeNull();
    expect(mockClientService.getClientStats).toHaveBeenCalled();
  });

  it('should handle stats errors', async () => {
    const error = new DatabaseError('Failed to fetch statistics');
    mockClientService.getClientStats.mockRejectedValue(error);

    const { result } = renderHook(() => useClientStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch statistics');
    expect(result.current.stats).toEqual({
      total: 0,
      active: 0,
      inactive: 0,
      archived: 0,
    });
  });
});

describe('useClientManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should combine all client management operations', () => {
    const { result } = renderHook(() => useClientManager());

    expect(typeof result.current.createClient).toBe('function');
    expect(typeof result.current.updateClient).toBe('function');
    expect(typeof result.current.deleteClient).toBe('function');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should aggregate loading states', async () => {
    mockClientService.createClient.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockClient), 100))
    );

    const { result } = renderHook(() => useClientManager());

    const clientData: ClientFormData = {
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

    act(() => {
      result.current.createClient(clientData);
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });
});