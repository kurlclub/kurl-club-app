import { useState } from 'react';

import { AnimatePresence, motion } from 'motion/react';

import { KCalender } from '@/components/shared/icons';
import { Badge } from '@/components/ui/badge';
import { useSupportTicketDetail } from '@/hooks/use-support';
import { SupportTicket } from '@/services/support';

interface RequestsProps {
  data: SupportTicket[];
  gymId?: number;
}

interface ListCardProps {
  data: SupportTicket;
  isActive?: boolean;
  onClick: () => void;
}

interface TimelineItem {
  id?: string | number;
  type: string;
  message: string;
  user: string;
  role: string;
  updatedAt: string;
}

interface RequestItem {
  id: string | number;
  subject: string;
  description: string;
  status: string;
  dueAt: string;
  timeline: TimelineItem[];
}

const BadgeComp = ({
  text,
  isDot = true,
}: {
  text: string;
  isDot?: boolean;
}) => {
  const status = text.toLowerCase();
  return (
    <Badge
      className={`py-1.25 px-2 rounded-full flex items-center gap-1.5 ${status === 'open' ? 'bg-open-badge-color/10 border-open-badge-color' : status === 'closed' ? 'bg-primary-blue-200/10 border-primary-blue-200' : 'border-primary-blue-300 rounded-sm bg-transparent'}`}
    >
      {isDot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${status === 'open' ? 'bg-open-badge-color' : 'bg-primary-blue-200'}`}
        />
      )}{' '}
      {text}
    </Badge>
  );
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
};

const convertTicketToRequestItem = (ticket: SupportTicket): RequestItem => {
  const timeline: TimelineItem[] =
    ticket.activities?.map((activity) => ({
      id: activity.id,
      type: activity.activityType,
      message: activity.message,
      user: activity.createdByUserName || 'Unknown',
      role: activity.createdByRole || 'user',
      updatedAt: activity.createdAt,
    })) || [];

  return {
    id: ticket.id,
    subject: ticket.subject,
    description: ticket.description,
    status: ticket.status,
    dueAt: ticket.dueAt,
    timeline,
  };
};

const ListCard = ({ data, isActive, onClick }: ListCardProps) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={`group relative overflow-hidden p-3 rounded-lg flex flex-col gap-3 text-left bg-secondary-blue-650 border-l-2 border-transparent cursor-pointer transition-colors duration-200 ${isActive ? ' border-l-primary-green-50 bg-secondary-blue-700 shadow-[0_18px_40px_rgba(4,14,33,0.24)]' : ''}`}
    >
      <div className="flex items-center gap-2 justify-between">
        <BadgeComp text={data.status} />
        <span
          className={`flex items-center gap-1 text-xs font-medium transition-colors duration-200 ${isActive ? 'text-secondary-blue-50' : 'text-secondary-blue-200 group-hover:text-secondary-blue-50'}`}
        >
          <KCalender />
          Due: {formatDate(data.dueAt)}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        <span
          className={`font-medium text-[20px] leading-normal max-w-65 truncate transition-colors duration-200 ${isActive ? 'text-secondary-blue-50' : 'text-secondary-blue-50/90 group-hover:text-secondary-blue-50'}`}
        >
          {data.subject}
        </span>
        <p
          className={`text-sm transition-colors duration-200 ${isActive ? 'text-secondary-blue-50/85' : 'text-secondary-blue-100 group-hover:text-secondary-blue-50/85'}`}
        >
          {data.description}
        </p>
      </div>
    </motion.button>
  );
};

const Timeline = ({ timelineData }: { timelineData: TimelineItem[] }) => {
  return (
    <div className="flex flex-col gap-2 mt-6">
      {timelineData.map((item, index) => {
        return (
          <div
            key={item.id ?? index}
            className="group flex items-start gap-3 rounded-xl border border-white/10 bg-secondary-blue-700 p-4 transition-all"
          >
            {/* Content */}
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex justify-between items-start gap-2">
                <p className="text-sm font-semibold text-white capitalize">
                  {item.type}
                </p>

                <span className="text-[11px] text-secondary-blue-200 whitespace-nowrap">
                  {item.updatedAt}
                </span>
              </div>

              <p className="text-sm text-gray-300">{item.message}</p>

              <p className="text-[11px] text-secondary-blue-300 flex items-center gap-1.5">
                <span className="truncate max-w-[150px]">{item.user}</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DetailsCard = ({
  ticketId,
  gymId,
}: {
  ticketId?: number | string;
  gymId?: number;
}) => {
  const {
    data: ticket,
    isLoading,
    error,
  } = useSupportTicketDetail(
    gymId,
    typeof ticketId === 'string' ? parseInt(ticketId, 10) : ticketId
  );

  if (isLoading) {
    return (
      <motion.div
        className="bg-secondary-blue-650 rounded-lg px-4 py-5 w-full border border-white/40 flex items-center justify-center h-96"
        initial={{ opacity: 0, x: 20, scale: 0.98 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -12, scale: 0.98 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        <p className="text-secondary-blue-200">Loading ticket details...</p>
      </motion.div>
    );
  }

  if (error || !ticket) return null;

  const data = convertTicketToRequestItem(ticket);
  const lastTimelineItem = data.timeline[data.timeline.length - 1];

  return (
    <motion.div
      key={data.id}
      initial={{ opacity: 0, x: 20, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -12, scale: 0.98 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="bg-secondary-blue-650 rounded-lg px-4 py-5 w-full border border-white/40"
    >
      <div className="flex items-center gap-3 justify-between">
        <BadgeComp text={data.status} />
        <BadgeComp
          text={`Last updated ${formatDate(lastTimelineItem?.updatedAt ?? data.dueAt)}`}
          isDot={false}
        />
      </div>
      <span className="mt-5 block text-[20px] font-medium leading-normal">
        {data.subject}
      </span>
      <p className="text-secondary-blue-100 text-sm leading-normal mt-3">
        {data.description}
      </p>
      <span className="flex items-center gap-1 text-xs font-medium mt-4.5">
        <KCalender />
        Due: {formatDate(data.dueAt)}
      </span>
      <Timeline timelineData={data.timeline} />
    </motion.div>
  );
};

function Requests({ data, gymId }: RequestsProps) {
  const [selectedTicketId, setSelectedTicketId] = useState<string | number>(
    data[0]?.id ?? ''
  );

  const selectedTicket = data.find((item) => item.id === selectedTicketId);

  return (
    <div className="flex gap-3 mt-5">
      <div className="flex flex-col gap-3 max-w-104.25 w-full">
        {data.map((item) => (
          <ListCard
            key={item.id}
            data={item}
            isActive={item.id === selectedTicket?.id}
            onClick={() => setSelectedTicketId(item.id)}
          />
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <DetailsCard ticketId={selectedTicketId} gymId={gymId} />
      </AnimatePresence>
    </div>
  );
}

export default Requests;
