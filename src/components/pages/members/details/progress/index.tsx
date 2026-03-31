'use client';

import { useState } from 'react';

import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useSheet } from '@/hooks/use-sheet';
import { useProgressLogs } from '@/services/progress';
import type { ProgressLog } from '@/types/progress';

import { ProgressCharts } from './progress-charts';
import { ProgressLogForm } from './progress-log-form';
import { ProgressTimeline } from './progress-timeline';

interface ProgressSectionProps {
  memberId: number | string;
}

export function ProgressSection({ memberId }: ProgressSectionProps) {
  const { data: logs = [], isLoading } = useProgressLogs(memberId);
  const { isOpen, openSheet, closeSheet } = useSheet();
  const [editLog, setEditLog] = useState<ProgressLog | null>(null);

  const handleEdit = (log: ProgressLog) => {
    setEditLog(log);
    openSheet();
  };

  const handleAddNew = () => {
    setEditLog(null);
    openSheet();
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setEditLog(null);
      closeSheet();
    }
  };

  return (
    <>
      <div className="mt-6 space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base text-white font-normal">
              Progress Tracking
            </h3>
            {logs.length > 0 && (
              <p className="text-xs text-primary-blue-200 mt-0.5">
                {logs.length} log{logs.length !== 1 ? 's' : ''} recorded
              </p>
            )}
          </div>
          <Button size="sm" onClick={handleAddNew}>
            <Plus className="w-4 h-4 mr-1" />
            Add Log
          </Button>
        </div>

        {/* Trend Charts — only shown once there is data */}
        {logs.length > 0 && <ProgressCharts logs={logs} />}

        {/* Log Timeline */}
        <ProgressTimeline
          logs={logs}
          isLoading={isLoading}
          memberId={memberId}
          onEdit={handleEdit}
        />
      </div>

      {/* Add / Edit Sheet */}
      <ProgressLogForm
        open={isOpen}
        onOpenChange={handleClose}
        memberId={memberId}
        editLog={editLog}
      />
    </>
  );
}
