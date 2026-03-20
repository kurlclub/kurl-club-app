import { useState } from 'react';

import { CalendarRange } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { Badge } from '@/components/ui/badge';

interface RequestsProps {
  data: RequestItem[];
}
interface ListCardProps {
  data: RequestItem;
  isActive?: boolean;
  onClick: () => void;
}
interface TimelineItem {
  id?: string;
  type: string;
  message: string;
  user: string;
  role: string;
  updatedAt: string;
}

interface RequestItem {
  id: string;
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

const ListCard = ({ data, isActive, onClick }: ListCardProps) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={`group relative overflow-hidden p-3 rounded-lg flex flex-col gap-3 text-left bg-secondary-blue-650 border border-white/5 border-l-2 transition-colors duration-200 ${isActive ? 'border-primary-green-50 bg-secondary-blue-700 shadow-[0_18px_40px_rgba(4,14,33,0.24)]' : 'border-transparent hover:border-primary-blue-300/60 hover:bg-secondary-blue-700/80'}`}
    >
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_55%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      />
      <div className="flex items-center gap-2 justify-between">
        <BadgeComp text={data.status} />
        <span
          className={`flex items-center gap-1 text-xs font-medium transition-colors duration-200 ${isActive ? 'text-secondary-blue-50' : 'text-secondary-blue-200 group-hover:text-secondary-blue-50'}`}
        >
          <CalendarRange className="text-secondary-blue-200" size={20} />
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
    <div className="relative pl-5 mt-6 flex flex-col gap-3.5">
      {/* Vertical line */}
      <div className="absolute left-1 top-12.5 h-[71%] w-px my-auto bg-primary-blue-300" />

      {timelineData.map((item, index) => (
        <div
          key={item.id ?? index}
          className="bg-secondary-blue-700 rounded-lg p-3 flex justify-between gap-4 relative"
        >
          {/* Dot */}
          <span className="absolute -left-5 top-[50%] transform -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-primary-blue-300" />

          <div className="flex flex-col gap-2">
            <p className="text-[15px] font-bold text-secondary-blue-50">
              {item.type}
            </p>
            <p className="text-sm text-gray-300">{item.message}</p>
            <p className="text-[11px] text-secondary-blue-200 flex items-center gap-1">
              <span>{item.user}</span>
              <span className="w-1 h-1 rounded-full bg-secondary-blue-200 inline-block" />
              <span>{item.role}</span>
            </p>
          </div>
          <p className="text-[11px] text-secondary-blue-200 whitespace-nowrap">
            {item.updatedAt}
          </p>
        </div>
      ))}
    </div>
  );
};

const DetailsCard = ({ data }: { data?: RequestItem }) => {
  if (!data) return null;

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
        <CalendarRange className="text-secondary-blue-200" size={20} />
        Due: {formatDate(data.dueAt)}
      </span>
      <Timeline timelineData={data.timeline} />
    </motion.div>
  );
};

function Requests({ data }: RequestsProps) {
  const [selectedRequestId, setSelectedRequestId] = useState(data[0]?.id ?? '');

  const selectedRequest =
    data.find((item) => item.id === selectedRequestId) ?? data[0];

  return (
    <div className="flex gap-3 mt-5">
      <div className="flex flex-col gap-3 max-w-104.25 w-full">
        {data.map((item) => (
          <ListCard
            key={item.id}
            data={item}
            isActive={item.id === selectedRequest?.id}
            onClick={() => setSelectedRequestId(item.id)}
          />
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <DetailsCard data={selectedRequest} />
      </AnimatePresence>
    </div>
  );
}

export default Requests;
