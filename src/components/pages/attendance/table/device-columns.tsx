'use client';

import { ColumnDef } from '@tanstack/react-table';
import {
  Edit,
  MoreHorizontal,
  Settings,
  Trash2,
  Wifi,
  WifiOff,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { BiometricDevice } from '@/types/attendance';

const StatusIndicator = ({ status }: { status: 'online' | 'offline' }) => (
  <div className="flex items-center gap-2">
    {status === 'online' ? (
      <Wifi size={16} className="text-primary-green-500" />
    ) : (
      <WifiOff size={16} className="text-alert-red-400" />
    )}
    <Badge
      variant="outline"
      className={
        status === 'online'
          ? 'bg-neutral-green-500/10 border-neutral-green-500 text-neutral-green-500 rounded-[35px] h-[30px]'
          : 'bg-alert-red-500/10 border-alert-red-500 text-alert-red-500 rounded-[35px] h-[30px]'
      }
    >
      {status}
    </Badge>
  </div>
);

const ActionsCell = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="h-8 w-8 p-0">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="shad-select-content">
      <DropdownMenuItem className="shad-select-item">
        <Settings className="h-4 w-4 mr-2" />
        Configure
      </DropdownMenuItem>
      <DropdownMenuItem className="shad-select-item">
        <Edit className="h-4 w-4 mr-2" />
        Edit Device
      </DropdownMenuItem>
      <DropdownMenuItem className="shad-select-item text-red-400">
        <Trash2 className="h-4 w-4 mr-2" />
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export const deviceColumns: ColumnDef<BiometricDevice>[] = [
  {
    accessorKey: 'name',
    header: 'Device Name',
    cell: ({ row }) => (
      <div className="w-[150px]">
        <div className="text-gray-900 dark:text-white font-medium">
          {row.getValue('name')}
        </div>
        <div className="text-xs text-gray-600 dark:text-primary-blue-200">
          {row.original.location}
        </div>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'ipAddress',
    header: 'IP Address',
    cell: ({ row }) => (
      <div className="min-w-[120px]">
        <span className="text-gray-600 dark:text-primary-blue-200 font-mono text-sm">
          {row.getValue('ipAddress')}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'port',
    header: 'Port',
    cell: ({ row }) => (
      <div className="min-w-[80px]">
        <span className="text-gray-900 dark:text-white">
          {row.getValue('port')}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <div className="min-w-[120px]">
        <StatusIndicator status={row.getValue('status')} />
      </div>
    ),
  },
  {
    accessorKey: 'lastSeen',
    header: 'Last Seen',
    cell: ({ row }) => {
      const lastSeen = new Date(row.getValue('lastSeen'));
      const now = new Date();
      const diffMinutes = Math.floor(
        (now.getTime() - lastSeen.getTime()) / (1000 * 60)
      );

      return (
        <div className="min-w-[120px]">
          <div className="text-gray-900 dark:text-white text-sm">
            {lastSeen.toLocaleTimeString()}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {diffMinutes < 1 ? 'Just now' : `${diffMinutes}m ago`}
          </div>
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: () => <ActionsCell />,
  },
];
