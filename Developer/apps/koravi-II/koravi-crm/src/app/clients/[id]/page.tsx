'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ClientProfile } from '@/components/clients/ClientProfile';
import { Client, SearchResult } from '@/lib/types';
import { getClient, updateClient, deleteClient, ClientService } from '@/lib/database';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Search, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search functionality state
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const clientId = params.id as string;

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setIsLoading(true);
        const clientData = await getClient(clientId);
        if (clientData) {
          setClient(clientData);
        } else {
          setError('Client not found');
        }
      } catch (err) {
        console.error('Error fetching client:', err);
        setError('Failed to load client data');
      } finally {
        setIsLoading(false);
      }
    };

    if (clientId) {
      fetchClient();
    }
  }, [clientId]);

  const handleUpdate = async (updates: Partial<Client>) => {
    if (!client) return;

    try {
      const updatedClient = await updateClient(client.id, updates);
      if (updatedClient) {
        setClient(updatedClient);
      }
    } catch (err) {
      console.error('Error updating client:', err);
      setError('Failed to update client');
    }
  };

  const handleDelete = async () => {
    if (!client) return;

    try {
      await deleteClient(client.id);
      router.push('/clients');
    } catch (err) {
      console.error('Error deleting client:', err);
      setError('Failed to delete client');
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Search functionality
  const handleNameClick = () => {
    setIsSearchMode(true);
    setSearchQuery(`${client?.first_name} ${client?.last_name}` || '');
    setTimeout(() => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    }, 0);
  };

  const handleSearchCancel = () => {
    setIsSearchMode(false);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  // Debounced search function
  useEffect(() => {
    if (!isSearchMode) return;
    
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const clients = await ClientService.searchClients(searchQuery, 5);
          const results: SearchResult[] = clients.map((client: Client) => ({
            id: client.id,
            type: 'client' as const,
            title: `${client.first_name} ${client.last_name}`,
            subtitle: client.email || client.phone || 'No contact info',
            href: `/clients/${client.id}`,
          }));
          setSearchResults(results);
          setShowResults(true);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, isSearchMode]);

  // Close search results and exit search mode when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        if (isSearchMode) {
          handleSearchCancel();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchMode]);

  // Handle escape key to exit search mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSearchMode) {
        handleSearchCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchMode]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Floating Glass Top Bar - Loading State */}
        <div className="fixed top-0 left-0 right-0 z-50 h-[4.75rem] glass-nav-enhanced-edge border-b-2 border-border/40 flex items-center px-6">
          <button
            onClick={() => router.push('/clients')}
            className="flex items-center space-x-2 text-foreground/90 hover:text-foreground transition-colors glass-button-enhanced rounded-lg p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-3 ml-6">
            <motion.div 
              className="h-8 w-8 rounded-full bg-primary/20"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div 
              className="h-5 w-32 bg-foreground/20 rounded"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
            />
          </div>
        </div>
        
        <div className="pt-[4.75rem] flex items-center justify-center min-h-screen">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div 
              className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <motion.p 
              className="mt-2 text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Loading client...
            </motion.p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-background">
        {/* Floating Glass Top Bar - Error State */}
        <div className="fixed top-0 left-0 right-0 z-50 h-[4.75rem] glass-nav-enhanced-edge border-b-2 border-border/40 flex items-center px-6">
          <button
            onClick={() => router.push('/clients')}
            className="flex items-center space-x-2 text-foreground/90 hover:text-foreground transition-colors glass-button-enhanced rounded-lg p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-3 ml-6">
            <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center">
              <span className="text-red-400 text-sm">!</span>
            </div>
            <h1 className="text-lg font-semibold text-foreground drop-shadow-md">
              Client Not Found
            </h1>
          </div>
        </div>
        
        <div className="pt-[4.75rem] flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Client Not Found</h1>
            <p className="text-muted-foreground mb-4">{error || 'The requested client could not be found.'}</p>
            <button
              onClick={() => router.push('/clients')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Back to Clients
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Floating Glass Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[4.75rem] glass-nav-enhanced-edge border-b-2 border-border/40 flex items-center px-6">
        <button
          onClick={() => router.push('/clients')}
          className="flex items-center space-x-2 text-foreground/90 hover:text-foreground transition-colors glass-button-enhanced rounded-lg p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        
        <div className="flex items-center space-x-3 ml-6 relative" ref={searchRef}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={client.avatar_url || undefined} />
            <AvatarFallback className="text-sm">
              {getInitials(client.first_name, client.last_name)}
            </AvatarFallback>
          </Avatar>
          
          {isSearchMode ? (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-foreground/70 z-10" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowResults(true)}
                className="pl-10 pr-10 py-2 rounded-lg text-primary-foreground placeholder-primary-foreground/60 glass-input min-w-[300px]"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') handleSearchCancel();
                }}
              />
              <button
                onClick={handleSearchCancel}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-primary-foreground/20 rounded transition-colors z-10"
              >
                <X className="w-3 h-3 text-primary-foreground/70" />
              </button>
              
              {/* Search Results Dropdown */}
              <AnimatePresence>
                {showResults && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full mt-2 w-full rounded-lg overflow-hidden z-[200] bg-popover border border-border shadow-lg"
                  >
                    {isSearching ? (
                      <div className="p-4 text-center text-muted-foreground">
                        <div className="animate-spin w-4 h-4 border-2 border-muted border-t-primary rounded-full mx-auto"></div>
                        <p className="mt-2 text-sm">Searching...</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="max-h-80 overflow-y-auto">
                        {searchResults.map((result) => (
                          <Link
                            key={result.id}
                            href={result.href}
                            onClick={() => {
                              setShowResults(false);
                              setIsSearchMode(false);
                            }}
                            className="block p-3 hover:bg-accent transition-colors border-b border-border last:border-b-0"
                          >
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                                <User className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {result.title}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {result.subtitle}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : searchQuery ? (
                      <div className="p-4 text-center text-muted-foreground">
                        <p className="text-sm">No clients found for &ldquo;{searchQuery}&rdquo;</p>
                      </div>
                    ) : null}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={handleNameClick}
              className="text-lg font-semibold text-foreground drop-shadow-md hover:text-primary transition-colors cursor-pointer"
            >
              {client.first_name} {client.last_name}
            </button>
          )}
        </div>
      </div>

      {/* Main Content with top padding to account for fixed header */}
      <div className="pt-[4.75rem]">
        <ClientProfile
          client={client}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          isEditing={isEditing}
          onEditToggle={handleEditToggle}
        />
      </div>
    </div>
  );
}