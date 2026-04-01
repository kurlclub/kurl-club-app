'use client';

import Link from 'next/link';
import { useState } from 'react';

import { ClipboardList, User } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime } from '@/lib/utils';
import type { TrainerActivityLog } from '@/types/trainer-activity';

interface ActivityTimelineProps {
  logs: TrainerActivityLog[];
  isLoading: boolean;
}

function LogRow({ log }: { log: TrainerActivityLog }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-primary-blue-400 last:border-0">
      {/* Icon */}
      <div className="flex-shrink-0 h-7 w-7 rounded-full bg-primary-green-500/15 flex items-center justify-center mt-0.5">
        <ClipboardList className="w-3.5 h-3.5 text-primary-green-500" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-white">Progress log added for</span>
          <Link
            href={`/members/${log.memberId}`}
            className="text-xs text-primary-green-500 hover:underline font-medium truncate"
          >
            {log.memberName}
          </Link>
          <span className="text-[10px] text-primary-blue-200">
            #{log.memberIdentifier}
          </span>
        </div>
        <p className="text-[10px] text-primary-blue-200 mt-0.5">
          {formatDateTime(log.activityDate, 'date')}
        </p>
      </div>

      {/* Member link icon */}
      <User className="flex-shrink-0 w-3.5 h-3.5 text-primary-blue-200 mt-1" />
    </div>
  );
}

export function ActivityTimeline({ logs, isLoading }: ActivityTimelineProps) {
  const [visibleCount, setVisibleCount] = useState(10);

  if (isLoading) {
    return (
      <div className="space-y-3 mt-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-full rounded" />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-primary-blue-400 p-8 text-center mt-2">
        <ClipboardList className="w-7 h-7 text-primary-blue-200 mx-auto mb-2" />
        <p className="text-sm text-primary-blue-200">
          No activity recorded yet.
        </p>
      </div>
    );
  }

  const sorted = [...logs].sort(
    (a, b) =>
      new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime()
  );
  const visible = sorted.slice(0, visibleCount);

  return (
    <div className="rounded-lg border border-primary-blue-400 bg-secondary-blue-500 px-4 mt-2">
      {visible.map((log) => (
        <LogRow key={log.activityId} log={log} />
      ))}

      {visibleCount < sorted.length && (
        <button
          onClick={() => setVisibleCount((prev) => prev + 10)}
          className="w-full text-xs text-primary-blue-200 hover:text-white py-3 transition-colors"
        >
          Show more ({sorted.length - visibleCount} remaining)
        </button>
      )}
    </div>
  );
}
