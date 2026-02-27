import Image from 'next/image';
import { useState } from 'react';

import { KSwitch } from '@/components/shared/form/k-switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function Permissions() {
  const permissions = [
    { name: 'View all member details', id: '1' },
    { name: 'Update all member details', id: '2' },
    { name: 'View workout plans', id: '3' },
    { name: 'Edit workout plans', id: '4' },
    { name: 'Create workout plans', id: '5' },
    { name: 'Edit diet plans', id: '6' },
    { name: 'Create diet plans', id: '7' },
    { name: 'View payment history', id: '8' },
    { name: 'View outstanding payments', id: '9' },
    { name: 'Edit packages', id: '10' },
    { name: 'Create packages', id: '11' },
    { name: 'Access attendance records', id: '12' },
    { name: 'Send messages', id: '13' },
    { name: 'Edit user roles & permissions', id: '14' },
  ];

  const roleOptions = [
    {
      value: 'admin',
      label: 'Admin',
      avatar: '/assets/svg/admin-icon.svg',
    },
    {
      value: 'trainer',
      label: 'Trainer',
      avatar: '/assets/svg/trainer-icon.svg',
    },
    {
      value: 'staff',
      label: 'Staff',
      avatar: '/assets/svg/staff-icon.svg',
    },
  ];

  const [roleValue, setRoleValue] = useState('');
  const [allPermissions, setAllPermissions] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<
    Record<string, boolean>
  >(Object.fromEntries(permissions.map((perm) => [perm.id, false])));

  // Handle Parent Switch (Enable All Permissions)
  const handleParentSwitch = (checked: boolean) => {
    setAllPermissions(checked);
    setSelectedPermissions(
      Object.fromEntries(permissions.map((perm) => [perm.id, checked]))
    );
  };

  // Handle Individual Permission Switch
  const handleChildSwitch = (permValue: string, checked: boolean) => {
    const newPermissions = { ...selectedPermissions, [permValue]: checked };
    setSelectedPermissions(newPermissions);

    // Check if all permissions are enabled
    const allEnabled = Object.values(newPermissions).every((val) => val);
    setAllPermissions(allEnabled);
  };

  return (
    <div className="bg-secondary-blue-500 border border-primary-blue-300 rounded-lg">
      {/* Head Section */}
      <div className="border-b border-primary-blue-300 p-6">
        <h5 className="text-white text-base font-normal leading-normal">
          User Permissions
        </h5>
        <div className="flex items-center gap-6 mt-4">
          {/* select role */}
          <Select
            value={roleValue}
            onValueChange={(value) => setRoleValue(value)}
          >
            <SelectTrigger className="border border-transparent rounded-md focus:outline-hidden focus:border-primary-blue-200 hover:border-primary-blue-200 focus:shadow-none focus:ring-0 p-[10px] h-[52px] text-[15px] text-white font-normal leading-normal focus:outline-0 bg-secondary-blue-400 max-w-[265px] data-[state=open]:border-primary-blue-200 data-[state=open]:border-b-transparent data-[state=open]:rounded-b-none">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent className="bg-secondary-blue-400 m-0 rounded-t-none border mt-[-3.7px] border-primary-blue-200 max-w-[265px]  border-t-primary-blue-300">
              {roleOptions.map((option) => (
                <SelectItem
                  className="cursor-pointer p-2 pl-3 hover:bg-primary-blue-300 k-transition h-10"
                  key={option.value}
                  value={option.value}
                >
                  <div
                    className="flex items-center gap-2 text-white leading-normal text-[15px]
                  font-normal capitalize"
                  >
                    {option.avatar && (
                      <span className="w-[18px] h-[18px] flex items-center justify-center">
                        <Image
                          height={18}
                          width={18}
                          src={option.avatar}
                          alt={option.label}
                          className="object-cover"
                        />
                      </span>
                    )}
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <KSwitch
            label="Enable all permissions"
            checked={allPermissions}
            onCheckedChange={handleParentSwitch}
          />
        </div>
      </div>

      {/* Permissions List */}
      <div className="p-6">
        <h5 className="text-white text-[15px] font-normal leading-normal mb-4">
          Permissions
        </h5>
        <div className="grid grid-cols-3 gap-6 max-w-[80%]">
          {permissions.map((perm) => (
            <KSwitch
              key={perm.id}
              label={perm.name}
              checked={selectedPermissions[perm.id]}
              onCheckedChange={(checked) => handleChildSwitch(perm.id, checked)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Permissions;
