'use client';

import * as React from "react";
import { motion, MotionProps } from "framer-motion";
import { Button, buttonVariants } from "./button";
import { cn } from "@/lib/utils";
import { VariantProps } from "class-variance-authority";

interface AnimatedButtonProps 
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  success?: boolean;
  motionProps?: MotionProps;
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, variant, size, asChild = false, loading, success, motionProps, children, ...props }, ref) => {
    const [isPressed, setIsPressed] = React.useState(false);

    const defaultMotionProps: MotionProps = {
      whileHover: { 
        scale: 1.02,
        transition: { type: 'spring', stiffness: 400, damping: 17 }
      },
      whileTap: { 
        scale: 0.98,
        transition: { type: 'spring', stiffness: 400, damping: 17 }
      },
      onTapStart: () => setIsPressed(true),
      onTap: () => setIsPressed(false),
      onTapCancel: () => setIsPressed(false),
      ...motionProps,
    };

    const buttonContent = (
      <>
        {loading && (
          <motion.div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        )}
        {success && (
          <motion.svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <path d="M20 6L9 17l-5-5" />
          </motion.svg>
        )}
        <motion.span
          animate={loading || success ? { opacity: 0.7 } : { opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.span>
      </>
    );

    if (asChild) {
      return (
        <motion.div {...defaultMotionProps}>
          {children}
        </motion.div>
      );
    }

    return (
      <motion.button
        ref={ref}
        className={cn(
          buttonVariants({ variant, size }),
          'relative overflow-hidden',
          className
        )}
        disabled={loading || props.disabled}
        {...defaultMotionProps}
        {...props}
      >
        {/* Ripple effect */}
        {isPressed && (
          <motion.div
            className="absolute inset-0 bg-white/20 rounded-md"
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
        {buttonContent}
      </motion.button>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";

export { AnimatedButton };