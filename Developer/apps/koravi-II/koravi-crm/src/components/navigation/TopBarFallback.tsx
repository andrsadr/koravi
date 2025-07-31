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

export default function TopBarFallback({ isSidebarCollapsed, onSidebarToggle }: TopBarProps) {
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
    <header className="fixed top-0 left-0 right-0 z-[100] h-16 nav-enhanced liquid-glass-fallback">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Far Left: Hamburger */}
        <button
          onClick={onSidebarToggle}
          className="p-2 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 transition-all duration-200 backdrop-blur-sm"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-white drop-shadow-sm" />
        </button>
        
        {/* Left: Logo next to hamburger */}
        <div className="text-xl font-bold text-white ml-3 drop-shadow-lg">
          Koravi
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-md mx-8" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70 z-10" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowResults(true)}
              className="w-full pl-10 pr-10 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all backdrop-blur-sm"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/20 rounded transition-colors z-10"
              >
                <X className="w-3 h-3 text-white/70" />
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
                className="absolute top-full mt-2 w-full bg-white/15 backdrop-blur-md border border-white/25 rounded-lg shadow-xl overflow-hidden z-[200]"
              >
                {isSearching ? (
                  <div className="p-4 text-center text-white/70">
                    <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full mx-auto"></div>
                    <p className="mt-2 text-sm">Searching...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto">
                    {searchResults.map((result) => (
                      <Link
                        key={result.id}
                        href={result.href}
                        onClick={() => setShowResults(false)}
                        className="block p-3 hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0"
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {result.title}
                            </p>
                            <p className="text-xs text-white/60 truncate">
                              {result.subtitle}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="p-4 text-center text-white/70">
                    <p className="text-sm">No clients found for &ldquo;{searchQuery}&rdquo;</p>
                  </div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Empty space */}
        <div className="w-16"></div>
      </div>
    </header>
  );
}