'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { BiometricDevice } from '@/types/attendance';

type DeviceActionHandlers = {
  onEdit?: (device: BiometricDevice) => void;
  onDelete?: (device: BiometricDevice) => void;
};

const ActionsCell = ({
  device,
  onEdit,
  onDelete,
}: {
  device: BiometricDevice;
  onEdit?: (device: BiometricDevice) => void;
  onDelete?: (device: BiometricDevice) => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="h-8 w-8 p-0">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="shad-select-content">
      <DropdownMenuItem
        className="shad-select-item"
        onClick={() => onEdit?.(device)}
      >
        <Edit className="h-4 w-4 mr-2" />
        Edit Device
      </DropdownMenuItem>
      <DropdownMenuItem
        className="shad-select-item text-red-400"
        onClick={() => onDelete?.(device)}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export const createDeviceColumns = (
  handlers?: DeviceActionHandlers
): ColumnDef<BiometricDevice>[] => [
  {
    accessorKey: 'name',
    header: 'Device Name',
    cell: ({ row }) => <span>{row.original.name || '--'}</span>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'deviceProvider',
    header: 'Device Provider',
    cell: ({ row }) => <span>{row.original.deviceProvider || '--'}</span>,
  },
  {
    accessorKey: 'deviceSerialNumber',
    header: 'Device Serial Number',
    cell: ({ row }) => <span>{row.original.deviceSerialNumber || '--'}</span>,
  },
  {
    accessorKey: 'direction',
    header: 'Direction',
    cell: ({ row }) => <span>{row.original.direction || '--'}</span>,
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <ActionsCell
        device={row.original}
        onEdit={handlers?.onEdit}
        onDelete={handlers?.onDelete}
      />
    ),
  },
];

export const deviceColumns: ColumnDef<BiometricDevice>[] =
  createDeviceColumns();
