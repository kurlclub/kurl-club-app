'use client';

import { useState } from 'react';

import { Dumbbell, Pencil, Trash2, User, Zap } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppDialog } from '@/hooks/use-app-dialog';
import { formatDateTime } from '@/lib/utils';
import { useDeleteProgressLog } from '@/services/progress';
import type { ProgressLog } from '@/types/progress';

const energyLabels: Record<number, string> = {
  1: 'Very Low',
  2: 'Low',
  3: 'Moderate',
  4: 'High',
  5: 'Very High',
};

const energyColors: Record<number, string> = {
  1: 'bg-alert-red-400/20 text-alert-red-300',
  2: 'bg-neutral-ochre-400/20 text-neutral-ochre-200',
  3: 'bg-primary-blue-400/30 text-primary-blue-100',
  4: 'bg-primary-green-500/20 text-primary-green-300',
  5: 'bg-primary-green-500/30 text-primary-green-200',
};

interface ProgressTimelineProps {
  logs: ProgressLog[];
  isLoading: boolean;
  memberId: number | string;
  onEdit: (log: ProgressLog) => void;
}

function MetricChip({
  label,
  value,
  unit,
}: {
  label: string;
  value?: number | null;
  unit: string;
}) {
  if (value == null) return null;
  return (
    <div className="flex flex-col items-center bg-primary-blue-500/30 rounded px-2 py-1 min-w-[56px]">
      <span className="text-[10px] text-primary-blue-200 leading-tight">
        {label}
      </span>
      <span className="text-xs text-white font-medium">
        {value}
        <span className="text-[10px] text-primary-blue-200 ml-0.5">{unit}</span>
      </span>
    </div>
  );
}

function LogCard({
  log,
  memberId,
  onEdit,
}: {
  log: ProgressLog;
  memberId: number | string;
  onEdit: (log: ProgressLog) => void;
}) {
  const { showConfirm } = useAppDialog();
  const { mutate: deleteLog } = useDeleteProgressLog(memberId);

  const hasBodyMetrics = Object.values(log.bodyMetrics).some((v) => v != null);
  const hasExercises = log.performanceEntries.length > 0;

  const handleDelete = () => {
    showConfirm({
      title: 'Delete Progress Log',
      description: `Delete the log for ${formatDateTime(log.logDate, 'date')}? This cannot be undone.`,
      variant: 'destructive',
      confirmLabel: 'Delete',
      onConfirm: () => deleteLog(log.logId),
    });
  };

  return (
    <div className="rounded-lg border border-primary-blue-400 bg-secondary-blue-500 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm text-white font-medium">
            {formatDateTime(log.logDate, 'date')}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <User className="w-3 h-3 text-primary-blue-200" />
            <span className="text-xs text-primary-blue-200">
              {log.trainerName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {log.energyLevel != null && (
            <Badge
              className={`text-[10px] px-2 py-0.5 ${energyColors[log.energyLevel] ?? ''}`}
            >
              <Zap className="w-3 h-3 mr-1" />
              {energyLabels[log.energyLevel]}
            </Badge>
          )}
          {log.goalProgressPercent != null && (
            <Badge className="bg-primary-green-500/20 text-primary-green-300 text-[10px] px-2 py-0.5">
              {log.goalProgressPercent}% goal
            </Badge>
          )}
          <button
            onClick={() => onEdit(log)}
            className="text-primary-blue-200 hover:text-white transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="text-primary-blue-200 hover:text-alert-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body Metrics */}
      {hasBodyMetrics && (
        <div className="flex flex-wrap gap-1.5">
          <MetricChip label="Weight" value={log.bodyMetrics.weight} unit="kg" />
          <MetricChip
            label="Body Fat"
            value={log.bodyMetrics.bodyFatPercent}
            unit="%"
          />
          <MetricChip label="Chest" value={log.bodyMetrics.chestCm} unit="cm" />
          <MetricChip label="Waist" value={log.bodyMetrics.waistCm} unit="cm" />
          <MetricChip label="Hips" value={log.bodyMetrics.hipsCm} unit="cm" />
          <MetricChip label="Arms" value={log.bodyMetrics.armsCm} unit="cm" />
          <MetricChip
            label="Thighs"
            value={log.bodyMetrics.thighsCm}
            unit="cm"
          />
        </div>
      )}

      {/* Exercises */}
      {hasExercises && (
        <div className="space-y-1">
          <div className="flex items-center gap-1 mb-1.5">
            <Dumbbell className="w-3 h-3 text-primary-blue-200" />
            <span className="text-[11px] text-primary-blue-200 uppercase tracking-wide">
              Exercises
            </span>
          </div>
          {log.performanceEntries.map((entry, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-xs bg-primary-blue-500/20 rounded px-2 py-1.5"
            >
              <span className="text-white">{entry.exerciseName}</span>
              <span className="text-primary-blue-200">
                {entry.sets} × {entry.reps}
                {entry.weightKg != null ? ` @ ${entry.weightKg}kg` : ''}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Session Notes */}
      {log.sessionNotes && (
        <p className="text-xs text-primary-blue-200 italic border-t border-primary-blue-400 pt-2">
          {log.sessionNotes}
        </p>
      )}
    </div>
  );
}

export function ProgressTimeline({
  logs,
  isLoading,
  memberId,
  onEdit,
}: ProgressTimelineProps) {
  const [visibleCount, setVisibleCount] = useState(5);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-primary-blue-400 p-8 text-center">
        <Dumbbell className="w-8 h-8 text-primary-blue-200 mx-auto mb-2" />
        <p className="text-sm text-primary-blue-200">No progress logs yet.</p>
        <p className="text-xs text-primary-blue-200 mt-1">
          Add the first log to start tracking this member&apos;s progress.
        </p>
      </div>
    );
  }

  const sorted = [...logs].sort(
    (a, b) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime()
  );
  const visible = sorted.slice(0, visibleCount);

  return (
    <div className="space-y-3">
      {visible.map((log) => (
        <LogCard
          key={log.logId}
          log={log}
          memberId={memberId}
          onEdit={onEdit}
        />
      ))}
      {visibleCount < sorted.length && (
        <button
          onClick={() => setVisibleCount((prev) => prev + 5)}
          className="w-full text-xs text-primary-blue-200 hover:text-white py-2 transition-colors"
        >
          Show more ({sorted.length - visibleCount} remaining)
        </button>
      )}
    </div>
  );
}
