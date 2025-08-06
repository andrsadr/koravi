'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Users, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SidebarProps {
  id?: string;
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Home,
  },
  {
    name: 'Clients',
    href: '/clients',
    icon: Users,
  },
];

export default function Sidebar({ id, isCollapsed, onToggle, isMobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    if (isMobile && isMobileOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        const sidebar = document.getElementById('mobile-sidebar');
        const target = event.target as Node;
        if (sidebar && !sidebar.contains(target) && onMobileClose) {
          onMobileClose();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobile, isMobileOpen, onMobileClose]);

  // Mobile overlay
  if (isMobile) {
    return (
      <>
        {/* Mobile backdrop */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={onMobileClose}
            />
          )}
        </AnimatePresence>

        {/* Mobile sidebar */}
        <motion.nav
          id="mobile-sidebar"
          className={`fixed left-0 top-0 h-full w-64 z-50 bg-sidebar border-r border-sidebar-border shadow-xl md:hidden ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          initial={false}
          animate={{
            x: isMobileOpen ? 0 : -256,
          }}
          transition={{
            duration: 0.3,
            ease: 'easeInOut',
          }}
        >
          <div className="h-full p-4">
            {/* Mobile header with close button */}
            <div className="flex items-center justify-between mb-6 pt-4">
              <div className="text-xl font-bold text-sidebar-foreground">
                Koravi
              </div>
              <button
                onClick={onMobileClose}
                className="p-2 rounded-lg transition-all duration-200 hover:bg-sidebar-accent"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5 text-sidebar-foreground" />
              </button>
            </div>

            {/* Navigation items */}
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <motion.div
                    key={item.name}
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <Link
                      href={item.href}
                      onClick={onMobileClose}
                      className={`flex items-center p-3 rounded-lg transition-all duration-200 group relative overflow-hidden ${
                        isActive
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }`}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          className="absolute left-0 top-0 bottom-0 w-1 bg-sidebar-primary-foreground"
                          layoutId="mobileActiveIndicator"
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        />
                      )}
                      
                      <motion.div
                        animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                      </motion.div>
                      
                      <span className="ml-3 font-medium">
                        {item.name}
                      </span>
                      
                      {/* Hover effect */}
                      <motion.div
                        className="absolute inset-0 bg-sidebar-accent opacity-0 group-hover:opacity-10 rounded-lg"
                        initial={false}
                        animate={{ opacity: 0 }}
                        whileHover={{ opacity: 0.1 }}
                        transition={{ duration: 0.2 }}
                      />
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </div>
        </motion.nav>
      </>
    );
  }

  // Desktop sidebar
  return (
    <motion.nav
      id={id}
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 transition-all duration-300 bg-sidebar border-r border-sidebar-border shadow-lg hidden md:block ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      animate={{
        width: isCollapsed ? 64 : 256,
      }}
      transition={{
        duration: 0.3,
        ease: 'easeInOut',
      }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className={`h-full ${isCollapsed ? 'p-2' : 'p-4'}`}>
        {/* Navigation items */}
        {/* Navigation items */}
        <nav className="space-y-2 mt-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <motion.div
                key={item.name}
                whileHover={{ scale: 1.02, x: 2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Link
                  href={item.href}
                  className={`flex items-center rounded-lg transition-all duration-200 group relative overflow-hidden ${
                    isCollapsed ? 'justify-center p-2.5' : 'p-3'
                  } ${
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-0 bottom-0 w-1 bg-sidebar-primary-foreground"
                      layoutId="desktopActiveIndicator"
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    />
                  )}
                  
                  <motion.div
                    animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0`} />
                  </motion.div>
                  
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="ml-3 font-medium"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  
                  {/* Hover effect */}
                  <motion.div
                    className="absolute inset-0 bg-sidebar-accent opacity-0 group-hover:opacity-10 rounded-lg"
                    initial={false}
                    animate={{ opacity: 0 }}
                    whileHover={{ opacity: 0.1 }}
                    transition={{ duration: 0.2 }}
                  />
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>
    </motion.nav>
  );
}