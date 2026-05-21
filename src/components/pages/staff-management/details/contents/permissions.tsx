'use client';

import { useMemo, useState } from 'react';

import { Switch } from '@/components/ui/switch';

type PermissionAction = 'view' | 'create' | 'edit' | 'delete';
type PermissionState = Record<string, Record<PermissionAction, boolean>>;

const actions: { key: PermissionAction; label: string }[] = [
  { key: 'view', label: 'View' },
  { key: 'create', label: 'Create' },
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' },
];

const permissionModules = [
  'Member management',
  'Staff management',
  'Reports',
  'Lead management',
  'Expense management',
  'Attendance management',
  'Payment management',
  'Workout plan management',
  'Settings management',
  'Payroll management',
];

const createInitialPermissions = (checked = false): PermissionState =>
  Object.fromEntries(
    permissionModules.map((module) => [
      module,
      Object.fromEntries(
        actions.map((action) => [action.key, checked])
      ) as Record<PermissionAction, boolean>,
    ])
  ) as PermissionState;

function PermissionSwitch({
  checked,
  label,
  onCheckedChange,
}: {
  checked: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-white/80">
      <Switch
        aria-label={label}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <span className="sr-only">{label}</span>
    </label>
  );
}

function Permissions() {
  const [permissions, setPermissions] = useState<PermissionState>(() =>
    createInitialPermissions()
  );

  const allPermissionsEnabled = useMemo(
    () =>
      permissionModules.every((module) =>
        actions.every((action) => permissions[module][action.key])
      ),
    [permissions]
  );

  const enabledPermissionCount = useMemo(
    () =>
      permissionModules.reduce(
        (count, module) =>
          count +
          actions.filter((action) => permissions[module][action.key]).length,
        0
      ),
    [permissions]
  );

  const totalPermissionCount = permissionModules.length * actions.length;

  const handleAllPermissions = (checked: boolean) => {
    setPermissions(createInitialPermissions(checked));
  };

  const handleModulePermissions = (module: string, checked: boolean) => {
    setPermissions((currentPermissions) => ({
      ...currentPermissions,
      [module]: Object.fromEntries(
        actions.map((action) => [action.key, checked])
      ) as Record<PermissionAction, boolean>,
    }));
  };

  const handlePermissionChange = (
    module: string,
    action: PermissionAction,
    checked: boolean
  ) => {
    setPermissions((currentPermissions) => ({
      ...currentPermissions,
      [module]: {
        ...currentPermissions[module],
        [action]: checked,
      },
    }));
  };

  return (
    <section className="overflow-hidden rounded-lg border border-primary-blue-300 bg-secondary-blue-500">
      <div className="flex flex-col gap-4 border-b border-primary-blue-300 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between lg:p-6">
        <div className="min-w-0">
          <h5 className="text-base font-medium leading-normal text-white">
            Roles & Permissions
          </h5>
          <p className="mt-1 text-sm leading-normal text-white/60">
            {enabledPermissionCount} of {totalPermissionCount} permissions
            enabled
          </p>
        </div>

        <label className="flex w-full items-center justify-between gap-3 rounded-md border border-primary-blue-300 bg-secondary-blue-400/40 px-4 py-3 sm:w-fit sm:justify-start">
          <Switch
            aria-label="Enable all permissions"
            checked={allPermissionsEnabled}
            onCheckedChange={handleAllPermissions}
          />
          <span className="text-sm font-normal leading-normal text-white cursor-pointer">
            Enable all permissions
          </span>
        </label>
      </div>

      <div className="hidden lg:block">
        <div className="grid grid-cols-[minmax(160px,1.4fr)_repeat(5,minmax(64px,1fr))] border-b border-primary-blue-300 bg-secondary-blue-400/60 px-4 py-3 text-sm font-medium text-white/70 xl:grid-cols-[minmax(220px,1.4fr)_repeat(5,minmax(92px,1fr))] xl:px-6">
          <div>Management area</div>
          {actions.map((action) => (
            <div key={action.key} className="text-center">
              {action.label}
            </div>
          ))}
          <div className="text-center">All</div>
        </div>

        <div className="divide-y divide-primary-blue-300">
          {permissionModules.map((module) => {
            const moduleEnabled = actions.every(
              (action) => permissions[module][action.key]
            );

            return (
              <div
                key={module}
                className="grid grid-cols-[minmax(160px,1.4fr)_repeat(5,minmax(64px,1fr))] items-center px-4 py-4 xl:grid-cols-[minmax(220px,1.4fr)_repeat(5,minmax(92px,1fr))] xl:px-6"
              >
                <div className="pr-3 text-sm font-normal leading-normal text-white">
                  {module}
                </div>
                {actions.map((action) => (
                  <div key={action.key} className="flex justify-center">
                    <PermissionSwitch
                      label={`${action.label} ${module}`}
                      checked={permissions[module][action.key]}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(module, action.key, checked)
                      }
                    />
                  </div>
                ))}
                <div className="flex justify-center">
                  <PermissionSwitch
                    label={`Enable all ${module} permissions`}
                    checked={moduleEnabled}
                    onCheckedChange={(checked) =>
                      handleModulePermissions(module, checked)
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="divide-y divide-primary-blue-300 lg:hidden">
        {permissionModules.map((module) => {
          const moduleEnabled = actions.every(
            (action) => permissions[module][action.key]
          );

          return (
            <div key={module} className="p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h6 className="min-w-0 text-sm font-medium leading-normal text-white">
                  {module}
                </h6>
                <PermissionSwitch
                  label={`Enable all ${module} permissions`}
                  checked={moduleEnabled}
                  onCheckedChange={(checked) =>
                    handleModulePermissions(module, checked)
                  }
                />
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(128px,1fr))] gap-3">
                {actions.map((action) => (
                  <label
                    key={action.key}
                    className="flex items-center justify-between gap-3 rounded-md border border-primary-blue-300 bg-secondary-blue-400/40 px-3 py-3"
                  >
                    <span className="text-sm text-white/80">
                      {action.label}
                    </span>
                    <Switch
                      aria-label={`${action.label} ${module}`}
                      checked={permissions[module][action.key]}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(module, action.key, checked)
                      }
                    />
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Permissions;
