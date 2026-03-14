'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Wifi } from 'lucide-react';
import { z } from 'zod/v4';

import InfoCard from '@/components/shared/cards/info-card';
import KDialog from '@/components/shared/form/k-dialog';
import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useAppDialog } from '@/hooks/use-app-dialog';
import { FilterConfig } from '@/lib/filters';
import type { BiometricDevice } from '@/types/attendance';

import { DeviceTableView } from '../table';
import { createDeviceColumns } from '../table/device-columns';

const mockDevices: BiometricDevice[] = [
  {
    id: 'DEV001',
    name: 'Main Entrance',
    ipAddress: '192.168.1.100',
    port: 4370,
    status: 'online',
    lastSeen: new Date().toISOString(),
    location: 'Reception Area',
  },
  {
    id: 'DEV002',
    name: 'Gym Floor',
    ipAddress: '192.168.1.101',
    port: 4370,
    status: 'offline',
    lastSeen: new Date(Date.now() - 300000).toISOString(),
    location: 'Main Gym Area',
  },
  {
    id: 'DEV003',
    name: 'Locker Room',
    ipAddress: '192.168.1.102',
    port: 4370,
    status: 'online',
    lastSeen: new Date(Date.now() - 60000).toISOString(),
    location: 'Changing Area',
  },
];

const deviceFilters: FilterConfig[] = [
  {
    columnId: 'status',
    title: 'Status',
    options: [
      { label: 'Online', value: 'online' },
      { label: 'Offline', value: 'offline' },
    ],
  },
];

const ipAddressRegex =
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

const deviceSchema = z.object({
  name: z.string().trim().min(2, 'Device name must be at least 2 characters'),
  ipAddress: z
    .string()
    .trim()
    .min(1, 'IP address is required')
    .regex(ipAddressRegex, 'Enter a valid IPv4 address'),
  port: z
    .string()
    .trim()
    .min(1, 'Port is required')
    .regex(/^\d+$/, 'Port must be a number')
    .refine((value) => {
      const port = Number(value);
      return port >= 1 && port <= 65535;
    }, 'Port must be between 1 and 65535'),
  location: z.string().trim().min(2, 'Location must be at least 2 characters'),
});

type DeviceFormValues = z.infer<typeof deviceSchema>;

export default function DeviceManagement() {
  const { showConfirm } = useAppDialog();
  const [devices, setDevices] = useState(mockDevices);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
  const form = useForm<DeviceFormValues>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      name: '',
      ipAddress: '',
      port: '',
      location: '',
    },
  });

  const defaultDeviceValues: DeviceFormValues = {
    name: '',
    ipAddress: '',
    port: '',
    location: '',
  };

  const handleDialogChange = () => {
    const nextOpenState = !isAddDialogOpen;
    setIsAddDialogOpen(nextOpenState);

    if (!nextOpenState) {
      setEditingDeviceId(null);
      form.reset(defaultDeviceValues);
    }
  };

  const handleSaveDevice = (values: DeviceFormValues) => {
    if (editingDeviceId) {
      setDevices((prev) =>
        prev.map((device) =>
          device.id === editingDeviceId
            ? {
                ...device,
                name: values.name.trim(),
                ipAddress: values.ipAddress.trim(),
                port: Number(values.port),
                location: values.location.trim(),
              }
            : device
        )
      );
    } else {
      const device: BiometricDevice = {
        id: `DEV${String(devices.length + 1).padStart(3, '0')}`,
        name: values.name.trim(),
        ipAddress: values.ipAddress.trim(),
        port: Number(values.port),
        location: values.location.trim(),
        status: 'offline',
        lastSeen: new Date().toISOString(),
      };
      setDevices([...devices, device]);
    }

    setEditingDeviceId(null);
    form.reset(defaultDeviceValues);
    setIsAddDialogOpen(false);
  };

  const handleEditDevice = (device: BiometricDevice) => {
    setEditingDeviceId(device.id);
    form.reset({
      name: device.name,
      ipAddress: device.ipAddress,
      port: String(device.port),
      location: device.location || '',
    });
    setIsAddDialogOpen(true);
  };

  const handleDeleteDevice = (device: BiometricDevice) => {
    showConfirm({
      title: 'Delete Device',
      description: `Are you sure you want to delete ${device.name}? This action cannot be undone.`,
      variant: 'destructive',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      onConfirm: () => {
        setDevices((prev) => prev.filter((d) => d.id !== device.id));
      },
    });
  };

  const columns = createDeviceColumns({
    onEdit: handleEditDevice,
    onDelete: handleDeleteDevice,
  });

  const onlineDevices = devices.filter((d) => d.status === 'online').length;
  const offlineDevices = devices.filter((d) => d.status === 'offline').length;
  const stats = [
    {
      id: 1,
      icon: <Wifi size={20} strokeWidth={1.75} color="#151821" />,
      color: 'semantic-blue-500',
      title: 'Total Devices',
      count: devices.length,
    },
    {
      id: 2,
      icon: <Wifi size={20} strokeWidth={1.75} color="#151821" />,
      color: 'primary-green-500',
      title: 'Online',
      count: onlineDevices,
    },
    {
      id: 3,
      icon: <Wifi size={20} strokeWidth={1.75} color="#151821" />,
      color: 'alert-red-400',
      title: 'Offline',
      count: offlineDevices,
    },
  ];

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="flex items-center justify-between flex-wrap gap-y-3">
        <div>
          <h3 className="text-gray-900 dark:text-white text-lg font-medium">
            Device Management
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Configure and monitor biometric devices
          </p>
        </div>
        <KDialog
          open={isAddDialogOpen}
          onOpenChange={handleDialogChange}
          title={editingDeviceId ? 'Edit Device' : 'Add New Device'}
          className="max-w-[500px]"
          trigger={
            <Button
              className="bg-primary-green-500 text-black hover:bg-primary-green-600"
              onClick={() => {
                setEditingDeviceId(null);
                form.reset(defaultDeviceValues);
              }}
            >
              <Plus size={16} className="mr-2" />
              Add Device
            </Button>
          }
          footer={
            <Button
              onClick={form.handleSubmit(handleSaveDevice)}
              className="w-full bg-primary-green-500 text-black mt-2"
            >
              {editingDeviceId ? 'Save Changes' : 'Add Device'}
            </Button>
          }
        >
          <Form {...form}>
            <form className="space-y-4">
              <KFormField
                fieldType={KFormFieldType.INPUT}
                control={form.control}
                name="name"
                label="Device Name"
              />
              <KFormField
                fieldType={KFormFieldType.INPUT}
                control={form.control}
                name="ipAddress"
                label="IP Address"
              />
              <KFormField
                fieldType={KFormFieldType.INPUT}
                control={form.control}
                name="port"
                label="Port"
                type="number"
              />
              <KFormField
                fieldType={KFormFieldType.INPUT}
                control={form.control}
                name="location"
                label="Location"
              />
            </form>
          </Form>
        </KDialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <InfoCard item={stat} key={stat.id} />
        ))}
      </div>

      <DeviceTableView
        devices={devices}
        columns={columns}
        filters={deviceFilters}
      />
    </div>
  );
}
