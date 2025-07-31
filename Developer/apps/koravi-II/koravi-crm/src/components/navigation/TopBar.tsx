'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, User, Menu } from 'lucide-react';
import Link from 'next/link';
import { ClientService } from '@/lib/database';
import { SearchResult, Client } from '@/lib/types';

interface TopBarProps {
  isSidebarCollapsed: boolean;
  onSidebarToggle: () => void;
}

export default function TopBar({ isSidebarCollapsed, onSidebarToggle }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  useEffect(() => {
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
  }, [searchQuery]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <>
      {/* Background content for glass effect - exact same height as TopBar */}
      <div className="fixed top-0 left-0 right-0 h-16 -z-10 bg-gradient-to-br from-primary via-primary/80 to-primary/60" />
      
      <header className="fixed top-0 left-0 right-0 z-40 h-16 glass-nav border-b border-border/20">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left: Hamburger and Logo grouped together */}
        <div className="flex items-center">
          <button
            onClick={onSidebarToggle}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-105 glass-button"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-primary-foreground drop-shadow-sm" />
          </button>
          
          <div className="text-xl font-bold text-primary-foreground ml-3 drop-shadow-lg font-sans">
            Koravi
          </div>
        </div>

        {/* Center: Search - Absolutely positioned to center */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-md px-4" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-foreground/70 z-10" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowResults(true)}
              className="w-full pl-10 pr-10 py-2 rounded-lg text-primary-foreground placeholder-primary-foreground/60 glass-input"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-primary-foreground/20 rounded transition-colors z-10"
              >
                <X className="w-3 h-3 text-primary-foreground/70" />
              </button>
            )}
          </div>

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
                        onClick={() => setShowResults(false)}
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

        {/* Right: Empty space to balance layout */}
        <div className="flex items-center">
          <div className="w-16"></div>
        </div>
      </div>
    </header>
    </>
  );
}