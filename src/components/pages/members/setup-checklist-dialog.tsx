'use client';

import Link from 'next/link';

import { Check, Dumbbell, ExternalLink, Package, Users } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import KDialog from '@/components/shared/form/k-dialog';
import { Button } from '@/components/ui/button';
import { FormOptionsResponse } from '@/hooks/use-gymform-options';

interface SetupChecklistDialogProps {
  isOpen: boolean;
  onClose: () => void;
  formOptions: FormOptionsResponse | null;
  onProceed: () => void;
}

export const SetupChecklistDialog = ({
  isOpen,
  onClose,
  formOptions,
  onProceed,
}: SetupChecklistDialogProps) => {
  const hasPackages = (formOptions?.membershipPlans?.length ?? 0) > 0;
  const hasTrainers = (formOptions?.trainers?.length ?? 0) > 0;
  const hasWorkoutPlans = (formOptions?.workoutPlans?.length ?? 0) > 0;

  const completionCount = [hasPackages, hasTrainers, hasWorkoutPlans].filter(
    Boolean
  ).length;
  const allComplete = hasPackages && hasTrainers && hasWorkoutPlans;

  const ChecklistItem = ({
    completed,
    title,
    description,
    href,
    icon: Icon,
    delay = 0,
  }: {
    completed: boolean;
    title: string;
    description: string;
    href: string;
    icon: React.ElementType;
    delay?: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className={`group relative overflow-hidden rounded-lg border transition-all duration-200 hover:scale-[1.02] ${
        completed
          ? 'border-primary-green-500/30 bg-primary-green-500/5'
          : 'border-secondary-blue-400 bg-secondary-blue-600 hover:border-neutral-ochre-500/50'
      }`}
    >
      <div className="flex items-start gap-4 p-4">
        <div className="relative">
          <motion.div
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              completed ? 'bg-primary-green-600' : 'bg-secondary-blue-500'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={completed ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <AnimatePresence mode="wait">
              {completed ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                >
                  <Check
                    className="h-5 w-5 text-black font-bold"
                    strokeWidth={3}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="icon"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Icon className="h-5 w-5 text-primary-blue-100" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          {completed && (
            <motion.div
              className="absolute -inset-1 rounded-full bg-primary-green-500/20"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <motion.h4
            className={`font-semibold transition-colors ${
              completed
                ? 'text-primary-green-700'
                : 'text-white group-hover:text-neutral-ochre-400'
            }`}
            layout
          >
            {title}
          </motion.h4>
          <p className="text-sm text-primary-blue-100 mt-1 leading-relaxed">
            {description}
          </p>

          {!completed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: delay + 0.1 }}
              className="relative z-10"
            >
              <Link
                href={
                  href.includes('?')
                    ? `${href}&return=/members&setup=true`
                    : `${href}?return=/members&setup=true`
                }
                onClick={onClose}
                className="relative inline-flex items-center gap-2 text-sm text-neutral-ochre-500 hover:text-neutral-ochre-400 transition-colors mt-3 group/link cursor-pointer z-20"
              >
                <span>Set up now</span>
                <ExternalLink className="h-3 w-3 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
              </Link>
            </motion.div>
          )}
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-ochre-500/0 via-neutral-ochre-500/5 to-neutral-ochre-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );

  const footer = allComplete ? null : (
    <div className="flex justify-end gap-3">
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button onClick={onProceed} disabled={!allComplete}>
        Complete Setup First
      </Button>
    </div>
  );

  return (
    <KDialog
      open={isOpen}
      onOpenChange={onClose}
      title={allComplete ? undefined : 'Setup Required'}
      footer={footer}
      className="max-w-md"
      closable={!allComplete}
    >
      <div className="space-y-4">
        {allComplete ? (
          // Show only completion celebration when all setup is complete
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="relative overflow-hidden rounded-lg border border-primary-green-700/30 bg-gradient-to-br from-secondary-blue-600/20 via-primary-green-500/10 to-neutral-ochre-500/10 p-6"
          >
            <div className="relative flex flex-col items-center text-center gap-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-neutral-green-600 to-neutral-green-500 shadow-lg"
              >
                <Check className="h-8 w-8 text-white" strokeWidth={3} />
              </motion.div>
              <div>
                <p className="text-white font-bold text-lg mb-2">
                  🎉 All setup complete!
                </p>
                <p className="text-primary-blue-100 text-sm mb-4">
                  Your gym is ready! You can now add members and start managing
                  your fitness business.
                </p>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex gap-3 justify-center"
                >
                  <Button
                    variant="secondary"
                    onClick={onClose}
                    className="bg-secondary-blue-500 hover:bg-secondary-blue-400 text-white border-secondary-blue-400"
                  >
                    Close
                  </Button>
                  <Button onClick={onProceed}>Add Member</Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ) : (
          // Show progress and checklist when setup is incomplete
          <>
            <p className="text-primary-blue-100 text-sm">
              Before adding members, please complete the following setup:
            </p>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">
                  Setup Progress
                </span>
                <span className="text-sm text-primary-blue-100">
                  {completionCount}/3
                </span>
              </div>
              <div className="h-2 bg-secondary-blue-600 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-neutral-green-400 to-neutral-green-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(completionCount / 3) * 100}%`,
                  }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <ChecklistItem
                completed={hasPackages}
                title="Membership Plans"
                description="Add at least one membership package"
                href="/plans-and-workouts?tab=membership-plans"
                icon={Package}
                delay={0}
              />

              <ChecklistItem
                completed={hasTrainers}
                title="Trainers"
                description="Add trainers to assign to members"
                href="/staff-management"
                icon={Users}
                delay={0.1}
              />

              <ChecklistItem
                completed={hasWorkoutPlans}
                title="Workout Plans"
                description="Create workout plans for members"
                href="/plans-and-workouts?tab=workout-plans"
                icon={Dumbbell}
                delay={0.2}
              />
            </div>
          </>
        )}
      </div>
    </KDialog>
  );
};
