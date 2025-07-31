'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Users, Menu, X } from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
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

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <motion.nav
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 transition-all duration-300 bg-sidebar border-r border-sidebar-border shadow-lg ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      animate={{
        width: isCollapsed ? 64 : 256,
      }}
      transition={{
        duration: 0.3,
        ease: 'easeInOut',
      }}
    >
      <div className={`h-full ${isCollapsed ? 'p-2' : 'p-4'}`}>
        {/* Navigation items */}
        <nav className="space-y-2 mt-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center rounded-lg transition-all duration-200 group ${
                  isCollapsed ? 'justify-center p-2.5' : 'p-3'
                } ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isCollapsed ? '' : ''}`} />
                
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
              </Link>
            );
          })}
        </nav>
      </div>
    </motion.nav>
  );
}