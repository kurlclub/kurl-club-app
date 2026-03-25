'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { FingerprintPattern, Plus, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
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
import { useGymBranch } from '@/providers/gym-branch-provider';
import {
  type BiometricDeviceResponse,
  useBiometricDevices,
  useCreateBiometricDevice,
  useDeleteBiometricDevice,
  useUpdateBiometricDevice,
} from '@/services/attendance';
import type { BiometricDevice } from '@/types/attendance';

import { DeviceTableView } from '../table';
import { createDeviceColumns } from '../table/device-columns';

type DeviceWithMeta = BiometricDevice & {
  deviceProvider?: string;
  deviceSerialNumber?: string;
  direction?: 'IN' | 'OUT' | 'INOUT' | 'DEVICE';
  activationCode?: string;
};

const DEVICE_PROVIDER_OPTIONS = [
  { label: 'Hikvision', value: 'Hikvision' },
  { label: 'eSSL', value: 'eSSL' },
  { label: 'Matrix', value: 'Matrix' },
  { label: 'Realtime', value: 'Realtime' },
  { label: 'ZKTeco', value: 'ZKTeco' },
  { label: 'Suprema', value: 'Suprema' },
  { label: 'Anviz', value: 'Anviz' },
  { label: 'Virdi', value: 'Virdi' },
] as const;

const deviceFilters: FilterConfig[] = [
  {
    columnId: 'deviceProvider',
    title: 'Device Provider',
    options: [...DEVICE_PROVIDER_OPTIONS],
  },
  {
    columnId: 'direction',
    title: 'Direction',
    options: [
      { label: 'IN', value: 'IN' },
      { label: 'OUT', value: 'OUT' },
      { label: 'INOUT', value: 'INOUT' },
      { label: 'DEVICE', value: 'DEVICE' },
    ],
  },
];

const normalizeProviderValue = (value: string) => {
  const normalized = value.trim().toLowerCase();
  const matched = DEVICE_PROVIDER_OPTIONS.find(
    (option) => option.value.toLowerCase() === normalized
  );

  if (matched) return matched.value;

  const labelMatched = DEVICE_PROVIDER_OPTIONS.find(
    (option) => option.label.toLowerCase() === normalized
  );

  return labelMatched?.value || '';
};

const deviceSchema = z.object({
  deviceName: z
    .string()
    .trim()
    .min(1, 'Device name is required')
    .min(2, 'Device name must be at least 2 characters'),
  deviceProvider: z
    .string()
    .trim()
    .min(1, 'Device provider is required')
    .refine(
      (value) =>
        DEVICE_PROVIDER_OPTIONS.some((option) => option.value === value),
      {
        message: 'Select a valid device provider',
      }
    ),
  deviceSerialNumber: z
    .string()
    .trim()
    .min(1, 'Device serial number is required')
    .min(3, 'Device serial number must be at least 3 characters'),
  direction: z
    .string()
    .trim()
    .min(1, 'Direction is required')
    .refine((value) => ['IN', 'OUT', 'INOUT', 'DEVICE'].includes(value), {
      message: 'Select a valid direction',
    }),
  activationCode: z.string().trim().optional(),
});

type DeviceFormValues = z.infer<typeof deviceSchema>;

const normalizeDirection = (
  direction?: string
): DeviceWithMeta['direction'] => {
  const normalized = (direction || '').trim().toUpperCase();
  if (
    normalized === 'IN' ||
    normalized === 'OUT' ||
    normalized === 'INOUT' ||
    normalized === 'DEVICE'
  ) {
    return normalized;
  }

  return 'DEVICE';
};

const mapApiDeviceToViewModel = (
  device: BiometricDeviceResponse
): DeviceWithMeta => ({
  id: String(device.id),
  name: device.deviceName,
  deviceProvider: normalizeProviderValue(device.manufacturer),
  deviceSerialNumber: device.serialNumber,
  direction: normalizeDirection(device.direction),
  activationCode: device.activationCode || '',
  ipAddress: 'N/A',
  port: 0,
  status: 'online',
  lastSeen: device.modifiedAt || device.createdAt || new Date().toISOString(),
  location: device.manufacturer,
});

export default function DeviceManagement() {
  const { gymBranch } = useGymBranch();
  const { showConfirm } = useAppDialog();
  const { data: biometricDevicesResponse } = useBiometricDevices(
    gymBranch?.gymId
  );
  const createBiometricDeviceMutation = useCreateBiometricDevice();
  const deleteBiometricDeviceMutation = useDeleteBiometricDevice();
  const updateBiometricDeviceMutation = useUpdateBiometricDevice();
  // const [devices, setDevices] = useState<DeviceWithMeta[]>([]);
  const devices = useMemo(() => {
    const apiDevices = biometricDevicesResponse?.data || [];
    return apiDevices.map(mapApiDeviceToViewModel);
  }, [biometricDevicesResponse?.data]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
  const form = useForm<DeviceFormValues>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      deviceName: '',
      deviceProvider: '',
      deviceSerialNumber: '',
      direction: '',
      activationCode: '',
    },
  });

  const defaultDeviceValues: DeviceFormValues = {
    deviceName: '',
    deviceProvider: '',
    deviceSerialNumber: '',
    direction: '',
    activationCode: '',
  };

  const handleDialogChange = () => {
    const nextOpenState = !isAddDialogOpen;
    setIsAddDialogOpen(nextOpenState);

    if (!nextOpenState) {
      setEditingDeviceId(null);
      form.reset(defaultDeviceValues);
    }
  };

  const handleSaveDevice = async (values: DeviceFormValues) => {
    if (editingDeviceId) {
      if (!gymBranch?.gymId) {
        toast.error('Gym not selected. Please select a gym and try again.');
        return;
      }

      const parsedDeviceId = Number(editingDeviceId);
      if (!Number.isFinite(parsedDeviceId)) {
        toast.error('Invalid device id. Please refresh and try again.');
        return;
      }

      try {
        const result = await updateBiometricDeviceMutation.mutateAsync({
          gymId: gymBranch.gymId,
          deviceId: parsedDeviceId,
          payload: {
            deviceName: values.deviceName.trim(),
            serialNumber: values.deviceSerialNumber.trim(),
            direction: values.direction.trim().toLowerCase(),
            activationCode: values.activationCode?.trim() || '',
            manufacturer: values.deviceProvider.trim().toLowerCase(),
          },
        });
        toast.success(result.message || 'Device updated successfully');
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to update device'
        );
        return;
      }
    } else {
      if (!gymBranch?.gymId) {
        toast.error('Gym not selected. Please select a gym and try again.');
        return;
      }

      try {
        const result = await createBiometricDeviceMutation.mutateAsync({
          gymId: gymBranch.gymId,
          deviceName: values.deviceName.trim(),
          serialNumber: values.deviceSerialNumber.trim(),
          direction: values.direction.trim().toLowerCase(),
          activationCode: values.activationCode?.trim() || '',
          manufacturer: values.deviceProvider.trim().toLowerCase(),
        });
        toast.success(result.message || 'Device added successfully');
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to add device'
        );
        return;
      }
    }

    setEditingDeviceId(null);
    form.reset(defaultDeviceValues);
    setIsAddDialogOpen(false);
  };

  const handleEditDevice = (device: BiometricDevice) => {
    const selectedDevice = device as DeviceWithMeta;
    setEditingDeviceId(device.id);
    const normalizedProvider = normalizeProviderValue(
      selectedDevice.deviceProvider || device.location || ''
    );
    form.reset({
      deviceName: device.name,
      deviceProvider: normalizedProvider,
      deviceSerialNumber: selectedDevice.deviceSerialNumber || device.name,
      direction: selectedDevice.direction || '',
      activationCode: selectedDevice.activationCode || '',
    });
    setIsAddDialogOpen(true);
  };

  const handleDeleteDevice = (device: BiometricDevice) => {
    const deviceId = Number(device.id);

    if (!Number.isFinite(deviceId)) {
      toast.error('Invalid device id. Please refresh and try again.');
      return;
    }

    showConfirm({
      title: 'Delete Device',
      description: `Are you sure you want to delete ${device.name}? This action cannot be undone.`,
      variant: 'destructive',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        if (!gymBranch?.gymId) {
          toast.error('Gym not selected. Please select a gym and try again.');
          return;
        }

        try {
          const result = await deleteBiometricDeviceMutation.mutateAsync({
            gymId: gymBranch.gymId,
            deviceId,
          });
          toast.success(result.message || 'Device deleted successfully');
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : 'Failed to delete device'
          );
        }
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
      icon: <FingerprintPattern size={20} strokeWidth={1.75} color="#151821" />,
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
      icon: <WifiOff size={20} strokeWidth={1.75} color="#151821" />,
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
          className="max-w-125"
          trigger={
            <Button
              disabled={devices.length >= 1}
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
              disabled={
                createBiometricDeviceMutation.isPending ||
                updateBiometricDeviceMutation.isPending
              }
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
                name="deviceName"
                label="Device Name"
              />
              <KFormField
                fieldType={KFormFieldType.SELECT}
                control={form.control}
                name="deviceProvider"
                label="Device Provider"
                options={[...DEVICE_PROVIDER_OPTIONS]}
              />
              <KFormField
                fieldType={KFormFieldType.INPUT}
                control={form.control}
                name="deviceSerialNumber"
                label="Device Serial Number"
              />
              <KFormField
                fieldType={KFormFieldType.SELECT}
                control={form.control}
                name="direction"
                label="Direction"
                options={[
                  { label: 'IN', value: 'IN' },
                  { label: 'OUT', value: 'OUT' },
                  { label: 'INOUT', value: 'INOUT' },
                  { label: 'DEVICE', value: 'DEVICE' },
                ]}
              />
              <KFormField
                fieldType={KFormFieldType.INPUT}
                control={form.control}
                name="activationCode"
                label="Activation Code"
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
