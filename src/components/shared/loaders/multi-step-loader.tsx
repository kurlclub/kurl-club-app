'use client';

import { useEffect, useState } from 'react';

import { CheckCircle, Circle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { cn } from '@/lib/utils';

type LoadingState = {
  text: string;
};

const LoaderCore = ({
  loadingStates,
  value = 0,
}: {
  loadingStates: LoadingState[];
  value?: number;
}) => {
  return (
    <div
      className="flex relative justify-start max-w-xl mx-auto flex-col mt-40"
      role="status"
      aria-live="polite"
    >
      {loadingStates.map((loadingState, index) => {
        const distance = Math.abs(index - value);
        const opacity = Math.max(1 - distance * 0.2, 0);

        return (
          <motion.div
            key={index}
            className={cn('text-left flex gap-2 mb-4')}
            initial={{ opacity: 0, y: -(value * 40) }}
            animate={{ opacity, y: -(value * 40) }}
            transition={{ duration: 0.5 }}
          >
            <div>
              {index > value ? (
                <Circle className="w-6 h-6 text-black dark:text-white" />
              ) : (
                <CheckCircle
                  className={cn(
                    'w-6 h-6 text-black dark:text-white',
                    value === index &&
                      'text-black dark:text-primary-green-500 opacity-100'
                  )}
                />
              )}
            </div>
            <span
              className={cn(
                'text-black dark:text-white',
                value === index &&
                  'text-black dark:text-primary-green-500 opacity-100'
              )}
            >
              {loadingState.text}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};

export const MultiStepLoader = ({
  loadingStates,
  loading,
  duration = 2000,
  loop = true,
}: {
  loadingStates: LoadingState[];
  loading?: boolean;
  duration?: number;
  loop?: boolean;
}) => {
  const [currentState, setCurrentState] = useState(0);
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (!loading) return;

    setShowLoader(true);
    setCurrentState(0);

    const totalDuration = loadingStates.length * duration;
    const timer = setTimeout(() => setShowLoader(false), totalDuration);

    return () => clearTimeout(timer);
  }, [loading, loadingStates.length, duration]);

  useEffect(() => {
    if (!showLoader) return;

    const interval = setInterval(() => {
      setCurrentState((prev) => {
        if (loop) {
          return (prev + 1) % loadingStates.length;
        }
        return Math.min(prev + 1, loadingStates.length - 1);
      });
    }, duration);

    return () => clearInterval(interval);
  }, [showLoader, duration, loop, loadingStates.length]);

  return (
    <AnimatePresence mode="wait">
      {showLoader && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full h-full fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-black/20" />

          <div className="h-96 relative z-10">
            <LoaderCore value={currentState} loadingStates={loadingStates} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
