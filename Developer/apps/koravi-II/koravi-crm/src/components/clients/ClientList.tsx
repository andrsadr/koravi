'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ClientCard } from './ClientCard';
import { ClientListItem } from './ClientListItem';
import { ClientTable } from './ClientTable';
import { useClients } from '@/lib/hooks/useClients';
import { Client } from '@/lib/types';
import { Search, Plus, Users, List, Grid3X3, Filter, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { ClientTableSkeleton, ClientCardSkeleton } from '@/components/ui/Skeleton';
import { StaggeredContainer, StaggeredItem } from '@/components/ui/StaggeredContainer';
import { motion } from 'framer-motion';
import { useFirstVisit } from '@/lib/hooks/useFirstVisit';
import { DatabaseFallback, EmptyStateFallback, LoadingFallback } from '@/components/ui/FallbackUI';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Button } from '@/components/ui/button';

type ViewMode = 'list' | 'grid';

export function ClientList() {
  const router = useRouter();
  const { clients, loading, error, refetch } = useClients();
  const isFirstVisit = useFirstVisit('/clients');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [statusFilters, setStatusFilters] = useState<string[]>(['active', 'inactive', 'archived']);
  const [labelFilters, setLabelFilters] = useState<string[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  
  // Debounce search query to prevent excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Get all unique labels from clients
  const availableLabels = useMemo(() => {
    const labelSet = new Set<string>();
    clients.forEach(client => {
      client.labels?.forEach(label => labelSet.add(label));
    });
    return Array.from(labelSet).sort();
  }, [clients]);

  // Filter clients based on search, status, and labels (minimum 2 characters for search)
  const filteredClients = useMemo(() => {
    let filtered = clients;

    // Apply status filter
    if (statusFilters.length > 0 && statusFilters.length < 3) {
      filtered = filtered.filter(client => statusFilters.includes(client.status));
    }

    // Apply label filter
    if (labelFilters.length > 0) {
      filtered = filtered.filter(client => 
        client.labels?.some(label => labelFilters.includes(label))
      );
    }

    // Apply search filter only if query has at least 2 characters
    if (debouncedSearchQuery && debouncedSearchQuery.length >= 2) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(client => 
        client.first_name.toLowerCase().includes(query) ||
        client.last_name.toLowerCase().includes(query) ||
        client.email?.toLowerCase().includes(query) ||
        client.phone?.includes(query) ||
        client.labels?.some(label => label.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [clients, debouncedSearchQuery, statusFilters, labelFilters]);

  // Only pass search query for highlighting if it has at least 2 characters
  const highlightQuery = searchQuery.length >= 2 ? searchQuery : '';

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (status: string, checked: boolean) => {
    if (checked) {
      setStatusFilters(prev => [...prev, status]);
    } else {
      setStatusFilters(prev => prev.filter(s => s !== status));
    }
  };

  // Handle label filter change
  const handleLabelFilterChange = (label: string, checked: boolean) => {
    if (checked) {
      setLabelFilters(prev => [...prev, label]);
    } else {
      setLabelFilters(prev => prev.filter(l => l !== label));
    }
  };



  // Handle client card click
  const handleClientClick = (client: Client) => {
    router.push(`/clients/${client.id}`);
  };

  // Handle add client click
  const handleAddClient = () => {
    router.push('/clients/new');
  };

  // Handle client selection
  const handleClientSelect = (clientId: string, selected: boolean) => {
    if (selected) {
      setSelectedClients(prev => [...prev, clientId]);
    } else {
      setSelectedClients(prev => prev.filter(id => id !== clientId));
    }
  };

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedClients(filteredClients.map(client => client.id));
    } else {
      setSelectedClients([]);
    }
  };

  // Loading state with skeleton
  if (loading) {
    return (
      <LoadingFallback message="Loading your clients..." />
    );
  }

  // Error state
  if (error) {
    return (
      <DatabaseFallback 
        onRetry={refetch}
        isRetrying={loading}
      />
    );
  }

  // Empty state
  if (clients.length === 0) {
    return (
      <EmptyStateFallback
        title="No clients found"
        message="Add your first client to get started with managing your client relationships."
        action={
          <Button onClick={handleAddClient} className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Add First Client
          </Button>
        }
      />
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
      {/* Responsive Header */}
      <div className="space-y-4">
        {/* Mobile: Stacked layout */}
        <div className="block md:hidden space-y-3">
          {/* Title and Add Button */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              Clients
            </h2>
            <button
              onClick={handleAddClient}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {/* Search Bar - Full width on mobile */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            {/* Client Count */}
            <span className="text-sm text-muted-foreground">
              {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'}
            </span>

            {/* Filter and View Toggle */}
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="inline-flex items-center gap-1 px-2 py-1.5 text-sm border border-border rounded-md hover:bg-accent transition-colors">
                    <Filter className="w-4 h-4" />
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64" align="end">
                  <div className="space-y-4">
                    {/* Status Filters */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">Status</h4>
                      <div className="space-y-2">
                        {['active', 'inactive', 'archived'].map((status) => (
                          <div key={status} className="flex items-center space-x-2">
                            <Checkbox
                              id={`status-${status}`}
                              checked={statusFilters.includes(status)}
                              onCheckedChange={(checked) => 
                                handleStatusFilterChange(status, checked as boolean)
                              }
                            />
                            <label
                              htmlFor={`status-${status}`}
                              className="text-sm capitalize cursor-pointer"
                            >
                              {status}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Label Filters */}
                    {availableLabels.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Labels</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {availableLabels.map((label) => (
                            <div key={label} className="flex items-center space-x-2">
                              <Checkbox
                                id={`label-${label}`}
                                checked={labelFilters.includes(label)}
                                onCheckedChange={(checked) => 
                                  handleLabelFilterChange(label, checked as boolean)
                                }
                              />
                              <label
                                htmlFor={`label-${label}`}
                                className="text-sm cursor-pointer"
                              >
                                {label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              <button
                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                className="p-1.5 border border-border rounded-md hover:bg-accent transition-colors"
                title={viewMode === 'list' ? 'Switch to grid view' : 'Switch to list view'}
              >
                {viewMode === 'list' ? (
                  <Grid3X3 className="w-4 h-4" />
                ) : (
                  <List className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop: Single Row Header */}
        <div className="hidden md:flex items-center justify-between">
          {/* Left side - Title */}
          <h2 className="text-2xl font-semibold text-foreground">
            Clients
          </h2>

          {/* Right side - All controls in order */}
          <div className="flex items-center gap-4">
            {/* 1. Client Count */}
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'}
              {highlightQuery && ` matching "${highlightQuery}"`}
            </span>

            {/* 2. Filter By Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-md hover:bg-accent transition-colors">
                  <Filter className="w-4 h-4" />
                  Filter by
                  <ChevronDown className="w-3 h-3" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="end">
                <div className="space-y-4">
                  {/* Status Filters */}
                  <div>
                    <h4 className="font-medium text-sm mb-2">Status</h4>
                    <div className="space-y-2">
                      {['active', 'inactive', 'archived'].map((status) => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox
                            id={`status-${status}`}
                            checked={statusFilters.includes(status)}
                            onCheckedChange={(checked) => 
                              handleStatusFilterChange(status, checked as boolean)
                            }
                          />
                          <label
                            htmlFor={`status-${status}`}
                            className="text-sm capitalize cursor-pointer"
                          >
                            {status}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Label Filters */}
                  {availableLabels.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Labels</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {availableLabels.map((label) => (
                          <div key={label} className="flex items-center space-x-2">
                            <Checkbox
                              id={`label-${label}`}
                              checked={labelFilters.includes(label)}
                              onCheckedChange={(checked) => 
                                handleLabelFilterChange(label, checked as boolean)
                              }
                            />
                            <label
                              htmlFor={`label-${label}`}
                              className="text-sm cursor-pointer"
                            >
                              {label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* 3. Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            {/* 4. View Toggle */}
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              className="p-2 border border-border rounded-md hover:bg-accent transition-colors"
              title={viewMode === 'list' ? 'Switch to grid view' : 'Switch to list view'}
            >
              {viewMode === 'list' ? (
                <Grid3X3 className="w-4 h-4" />
              ) : (
                <List className="w-4 h-4" />
              )}
            </button>

            {/* 5. Create Client Button */}
            <button
              onClick={handleAddClient}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Client
            </button>
          </div>
        </div>
      </div>

      {/* Client Display */}
      {filteredClients.length > 0 ? (
        <>
          {viewMode === 'list' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <ClientTable
                clients={filteredClients}
                searchQuery={highlightQuery}
                onClientClick={handleClientClick}
                selectedClients={selectedClients}
                onClientSelect={handleClientSelect}
                onSelectAll={handleSelectAll}
                onClientsDeleted={() => {
                  // Clear selection after deletion
                  setSelectedClients([]);
                  // Refresh the client list
                  refetch();
                }}
              />
            </motion.div>
          ) : isFirstVisit ? (
            <StaggeredContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filteredClients.map((client, index) => (
                <StaggeredItem key={client.id}>
                  <ClientCard
                    client={client}
                    onClick={handleClientClick}
                    searchQuery={highlightQuery}
                  />
                </StaggeredItem>
              ))}
            </StaggeredContainer>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filteredClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onClick={handleClientClick}
                  searchQuery={highlightQuery}
                />
              ))}
            </div>
          )}
          

        </>
      ) : (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          {searchQuery.length > 0 && searchQuery.length < 2 ? (
            <>
              <h3 className="text-lg font-semibold mb-2">Type at least 2 characters to search</h3>
              <p className="text-muted-foreground mb-4">
                Enter more characters to filter your clients.
              </p>
            </>
          ) : searchQuery.length >= 2 ? (
            <>
              <h3 className="text-lg font-semibold mb-2">No matching clients</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filter criteria.
              </p>
              <div className="flex gap-2 justify-center">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-primary hover:underline"
                  >
                    Clear search
                  </button>
                )}
                {(statusFilters.length < 3 || labelFilters.length > 0) && (
                  <button
                    onClick={() => {
                      setStatusFilters(['active', 'inactive', 'archived']);
                      setLabelFilters([]);
                    }}
                    className="text-primary hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold mb-2">No clients found</h3>
              <p className="text-muted-foreground mb-6">
                Add your first client to get started with managing your client relationships.
              </p>
              <button
                onClick={handleAddClient}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add First Client
              </button>
            </>
          )}
        </div>
      )}
      </div>
    </ErrorBoundary>
  );
}