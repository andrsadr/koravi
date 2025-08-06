'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import AppLayout from './AppLayout';
import { PageTransition } from '@/components/ui/PageTransition';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if we're on a client detail page
  const isClientDetailPage = pathname?.match(/^\/clients\/[^\/]+$/);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  if (isClientDetailPage) {
    // Return children without AppLayout for client detail pages, but with mobile-friendly header
    return (
      <div className="min-h-screen bg-background">
        {/* Mobile back button header */}
        {isMobile && (
          <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-foreground hover:text-primary transition-colors touch-target"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
          </div>
        )}
        
        <PageTransition>
          {children}
        </PageTransition>
      </div>
    );
  }
  
  // Return children wrapped in AppLayout for all other pages with page transitions
  return (
    <AppLayout>
      <PageTransition>
        {children}
      </PageTransition>
    </AppLayout>
  );
}