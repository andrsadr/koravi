'use client';

import ConnectionStatus from '@/components/ui/ConnectionStatus';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useFirstVisit } from '@/lib/hooks/useFirstVisit';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const noAnimationVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};

const noItemAnimation = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
};

export default function Home() {
  const router = useRouter();
  const isFirstVisit = useFirstVisit('/');

  return (
    <motion.div 
      className="max-w-4xl mx-auto"
      variants={isFirstVisit ? containerVariants : noAnimationVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="text-center">
        <motion.h1 
          className="text-5xl font-bold text-foreground mb-6"
          variants={isFirstVisit ? itemVariants : noItemAnimation}
        >
          Dashboard
        </motion.h1>
        <motion.p 
          className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          variants={isFirstVisit ? itemVariants : noItemAnimation}
        >
          Welcome to Koravi CRM - your modern client management system
        </motion.p>
        
        {/* Database Connection Status */}
        <motion.div 
          className="mb-8 flex justify-center"
          variants={isFirstVisit ? itemVariants : noItemAnimation}
        >
          <ConnectionStatus />
        </motion.div>
        
        <motion.div 
          className="bg-card border border-border rounded-2xl p-8 max-w-md mx-auto shadow-lg"
          variants={isFirstVisit ? itemVariants : noItemAnimation}
          whileHover={{ 
            scale: 1.02,
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            transition: { type: 'spring', stiffness: 300, damping: 20 }
          }}
        >
          <h2 className="text-2xl font-semibold text-card-foreground mb-4">
            Quick Actions
          </h2>
          <p className="text-muted-foreground mb-6">
            Get started with your client management
          </p>
          <div className="space-y-4">
            <motion.button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg p-3 text-center transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/clients')}
            >
              View All Clients
            </motion.button>
            <motion.button 
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-lg p-3 text-center transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/clients/new')}
            >
              Add New Client
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}