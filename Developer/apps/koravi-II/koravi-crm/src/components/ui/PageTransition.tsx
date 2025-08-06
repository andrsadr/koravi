'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { useFirstVisit } from '@/lib/hooks/useFirstVisit';

interface PageTransitionProps {
  children: ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 0.98,
  },
};

const noAnimationVariants = {
  initial: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  out: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
};

const noTransition = {
  duration: 0,
};

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const isFirstVisit = useFirstVisit(pathname);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={isFirstVisit ? pageVariants : noAnimationVariants}
        transition={isFirstVisit ? pageTransition : noTransition}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}