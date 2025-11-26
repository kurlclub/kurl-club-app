'use client';

import { useState } from 'react';

import { Plus, Wifi } from 'lucide-react';

import KDialog from '@/components/shared/form/k-dialog';
import { KInput } from '@/components/shared/form/k-input';
import { Button } from '@/components/ui/button';
import type { BiometricDevice } from '@/types/attendance';

import { DeviceTableView, deviceColumns } from '../table';

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

export default function DeviceManagement() {
  const [devices, setDevices] = useState(mockDevices);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDevice, setNewDevice] = useState({
    name: '',
    ipAddress: '',
    port: 4370,
    location: '',
  });

  const handleAddDevice = () => {
    const device: BiometricDevice = {
      id: `DEV${String(devices.length + 1).padStart(3, '0')}`,
      ...newDevice,
      status: 'offline',
      lastSeen: new Date().toISOString(),
    };
    setDevices([...devices, device]);
    setNewDevice({ name: '', ipAddress: '', port: 4370, location: '' });
    setIsAddDialogOpen(false);
  };

  const onlineDevices = devices.filter((d) => d.status === 'online').length;
  const offlineDevices = devices.filter((d) => d.status === 'offline').length;

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="absolute inset-0 bg-secondary-blue-500/30 backdrop-blur-[2px] rounded-lg z-50 flex items-center justify-center">
        <div className="bg-secondary-blue-500 border border-secondary-blue-400 rounded-lg p-8 max-w-md text-center">
          <div className="mb-4">
            <Wifi size={48} className="mx-auto text-primary-green-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Coming Soon!
          </h3>
          <p className="text-gray-400 text-sm">
            We&apos;re working on biometric device integration to make
            attendance tracking even easier. Stay tuned for this exciting
            feature!
          </p>
        </div>
      </div>
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
          onOpenChange={() => setIsAddDialogOpen(!isAddDialogOpen)}
          title="Add New Device"
          trigger={
            <Button className="bg-primary-green-500 text-black hover:bg-primary-green-600">
              <Plus size={16} className="mr-2" />
              Add Device
            </Button>
          }
          footer={
            <Button
              onClick={handleAddDevice}
              className="w-full bg-primary-green-500 text-black"
            >
              Add Device
            </Button>
          }
        >
          <div className="space-y-4">
            <KInput
              label="Device Name"
              value={newDevice.name}
              onChange={(e) =>
                setNewDevice({ ...newDevice, name: e.target.value })
              }
            />
            <KInput
              label="IP Address"
              value={newDevice.ipAddress}
              onChange={(e) =>
                setNewDevice({ ...newDevice, ipAddress: e.target.value })
              }
            />
            <KInput
              label="Port"
              type="number"
              value={newDevice.port.toString()}
              onChange={(e) =>
                setNewDevice({
                  ...newDevice,
                  port: parseInt(e.target.value) || 0,
                })
              }
            />
            <KInput
              label="Location"
              value={newDevice.location}
              onChange={(e) =>
                setNewDevice({ ...newDevice, location: e.target.value })
              }
            />
          </div>
        </KDialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:h-[74px]">
        <div className="bg-white dark:bg-secondary-blue-500 rounded-lg flex gap-4 items-center p-3">
          <span className="md:rounded-[18px] rounded-[12px] min-w-[40px] min-h-[40px] max-w-[40px] max-h-[40px] md:min-w-[48px] md:min-h-[48px] md:max-w-[48px] md:max-h-[48px] flex items-center justify-center bg-semantic-blue-500">
            <Wifi size={20} strokeWidth={1.75} color="#151821" />
          </span>
          <div className="flex flex-col gap-1">
            <h6 className="text-gray-900 dark:text-white font-normal text-[15px] leading-normal">
              Total Devices
            </h6>
            <h4 className="text-gray-900 dark:text-white font-bold text-xl leading-normal">
              {devices.length}
            </h4>
          </div>
        </div>
        <div className="bg-white dark:bg-secondary-blue-500 rounded-lg flex gap-4 items-center p-3">
          <span className="md:rounded-[18px] rounded-[12px] min-w-[40px] min-h-[40px] max-w-[40px] max-h-[40px] md:min-w-[48px] md:min-h-[48px] md:max-w-[48px] md:max-h-[48px] flex items-center justify-center bg-primary-green-500">
            <Wifi size={20} strokeWidth={1.75} color="#151821" />
          </span>
          <div className="flex flex-col gap-1">
            <h6 className="text-gray-900 dark:text-white font-normal text-[15px] leading-normal">
              Online
            </h6>
            <h4 className="text-gray-900 dark:text-white font-bold text-xl leading-normal">
              {onlineDevices}
            </h4>
          </div>
        </div>
        <div className="bg-white dark:bg-secondary-blue-500 rounded-lg flex gap-4 items-center p-3">
          <span className="md:rounded-[18px] rounded-[12px] min-w-[40px] min-h-[40px] max-w-[40px] max-h-[40px] md:min-w-[48px] md:min-h-[48px] md:max-w-[48px] md:max-h-[48px] flex items-center justify-center bg-alert-red-400">
            <Wifi size={20} strokeWidth={1.75} color="#151821" />
          </span>
          <div className="flex flex-col gap-1">
            <h6 className="text-gray-900 dark:text-white font-normal text-[15px] leading-normal">
              Offline
            </h6>
            <h4 className="text-gray-900 dark:text-white font-bold text-xl leading-normal">
              {offlineDevices}
            </h4>
          </div>
        </div>
      </div>

      <DeviceTableView devices={devices} columns={deviceColumns} />
    </div>
  );
}
