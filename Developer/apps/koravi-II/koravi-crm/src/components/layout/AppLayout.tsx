'use client';

import { useState } from 'react';
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen relative">
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
        isCollapsed={isSidebarCollapsed} 
        onToggle={handleSidebarToggle} 
      />
      
      <TopBar 
        isSidebarCollapsed={isSidebarCollapsed} 
        onSidebarToggle={handleSidebarToggle}
      />
      
      <main 
        className={`transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-16' : 'ml-64'
        } mt-16 p-6`}
      >
        {children}
      </main>
    </div>
  );
}