'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import ConnectionStatus from '@/components/ui/ConnectionStatus';
import { SkipLink } from '@/components/ui/SkipLink';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
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

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleMobileToggle = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const handleMobileClose = () => {
    setIsMobileOpen(false);
  };

  return (
    <div className="min-h-screen relative">
      {/* Skip links for accessibility */}
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <SkipLink href="#navigation">Skip to navigation</SkipLink>
      
      {/* Background using theme colors */}
      <div className="fixed inset-0 -z-10 bg-background" />
      
      {/* Additional background pattern for visual interest */}
      <div 
        className="fixed inset-0 -z-5 opacity-50"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, hsl(var(--primary) / 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, hsl(var(--primary) / 0.05) 0%, transparent 50%)
          `
        }}
      />
      <Sidebar 
        id="navigation"
        isCollapsed={isSidebarCollapsed} 
        onToggle={handleSidebarToggle}
        isMobileOpen={isMobileOpen}
        onMobileClose={handleMobileClose}
      />
      
      <TopBar 
        isSidebarCollapsed={isSidebarCollapsed} 
        onSidebarToggle={handleSidebarToggle}
        isMobileOpen={isMobileOpen}
        onMobileToggle={handleMobileToggle}
      />
      
      <main 
        id="main-content"
        className={`transition-all duration-300 ${
          isMobile ? 'ml-0' : isSidebarCollapsed ? 'ml-16' : 'ml-64'
        } mt-16 p-2 sm:p-4`}
        role="main"
        aria-label="Main content"
      >
        {/* Connection status alert */}
        <div className="mb-4">
          <ConnectionStatus showAlert={true} />
        </div>
        
        {children}
      </main>
    </div>
  );
}