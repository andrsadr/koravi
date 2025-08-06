"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClientForm } from '@/components/clients/ClientForm';
import { ClientFormData } from '@/lib/types';
import { createClient } from '@/lib/database';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useFirstVisit } from '@/lib/hooks/useFirstVisit';

export default function NewClientPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isFirstVisit = useFirstVisit('/clients/new');

  const handleSubmit = async (data: ClientFormData) => {
    setIsLoading(true);
    try {
      await createClient(data);
      // Navigate back to clients list after successful creation
      router.push('/clients');
    } catch (error) {
      console.error('Error creating client:', error);
      throw error; // Let the form handle the error display
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/clients');
  };

  const handleCreateFromTopBar = () => {
    // Trigger form submission from the top bar
    const form = document.getElementById('client-form');
    if (form) {
      form.requestSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Floating Glass Top Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 z-50 h-[4.75rem] glass-nav-enhanced-edge border-b-2 border-border/40 flex items-center justify-between px-6"
        initial={isFirstVisit ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={() => router.push('/clients')}
            className="flex items-center space-x-2 text-foreground/90 hover:text-foreground transition-colors glass-button-enhanced rounded-lg p-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
          
          <motion.h1 
            className="text-lg font-semibold text-foreground drop-shadow-md"
            initial={isFirstVisit ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            New Client
          </motion.h1>
        </div>

        <motion.div
          initial={isFirstVisit ? { opacity: 0, x: 20 } : { opacity: 1, x: 0 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Button
            onClick={handleCreateFromTopBar}
            disabled={isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
          >
            {isLoading ? 'Creating...' : 'Create'}
          </Button>
        </motion.div>
      </motion.div>

      {/* Main Content with top padding to account for fixed header */}
      <div className="pt-[4.75rem]">
        <ClientForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          animate={isFirstVisit}
        />
      </div>
    </div>
  );
}