'use client';

import { useMemo, useState } from 'react';

import { Lock } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useGymBranch } from '@/providers/gym-branch-provider';
import { useSubscription } from '@/providers/subscription-provider';
import {
  useAccessModules,
  useSubjectPermissions,
  useUpdateSubjectPermissions,
} from '@/services/access/access_service';
import { useStaffByID } from '@/services/staff';
import type {
  AccessModuleDefinition,
  AccessSubjectPermission,
  AccessSubjectType,
} from '@/types/access.types';
import type { StaffType } from '@/types/staff';

type PermissionAction = 'canView' | 'canCreate' | 'canEdit' | 'canDelete';
type PermissionState = Record<string, Record<PermissionAction, boolean>>;

const actions: { key: PermissionAction; label: string }[] = [
  { key: 'canView', label: 'View' },
  { key: 'canCreate', label: 'Create' },
  { key: 'canEdit', label: 'Edit' },
  { key: 'canDelete', label: 'Delete' },
];

const fallbackPermissionModules = [
  { moduleKey: 'member_management', label: 'Member management' },
  { moduleKey: 'staff_management', label: 'Staff management' },
  { moduleKey: 'reports', label: 'Reports' },
  { moduleKey: 'lead_management', label: 'Lead management' },
  { moduleKey: 'expense_management', label: 'Expense management' },
  { moduleKey: 'attendance_management', label: 'Attendance management' },
  { moduleKey: 'payment_management', label: 'Payment management' },
  { moduleKey: 'workout_plan_management', label: 'Workout plan management' },
  { moduleKey: 'settings_management', label: 'Settings management' },
  { moduleKey: 'payroll_management', label: 'Payroll management' },
];

const toTitleCase = (value: string) =>
  value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const getModuleKey = (module: AccessModuleDefinition) =>
  module.moduleKey || module.key || module.name || module.moduleName || '';

const getModuleLabel = (module: AccessModuleDefinition) =>
  module.displayName ||
  module.moduleName ||
  module.name ||
  (module.moduleKey ? toTitleCase(module.moduleKey) : 'Permission module');

const createInitialPermissions = (
  modules: { moduleKey: string }[],
  checked = false
): PermissionState =>
  Object.fromEntries(
    modules.map((module) => [
      module.moduleKey,
      Object.fromEntries(
        actions.map((action) => [action.key, checked])
      ) as Record<PermissionAction, boolean>,
    ])
  ) as PermissionState;

const createPermissionsFromResponse = (
  modules: { moduleKey: string }[],
  subjectPermissions: AccessSubjectPermission[] = []
) => {
  const permissionsByModule = new Map(
    subjectPermissions.map((permission) => [permission.moduleKey, permission])
  );

  return Object.fromEntries(
    modules.map((module) => {
      const permission = permissionsByModule.get(module.moduleKey);

      return [
        module.moduleKey,
        {
          canView: Boolean(permission?.canView),
          canCreate: Boolean(permission?.canCreate),
          canEdit: Boolean(permission?.canEdit),
          canDelete: Boolean(permission?.canDelete),
        },
      ];
    })
  ) as PermissionState;
};

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

function Permissions({
  staffId,
  staffRole,
}: {
  staffId: string;
  staffRole: StaffType;
}) {
  const { gymBranch } = useGymBranch();
  const { staffLoginEnabled } = useSubscription();
  const gymId = gymBranch?.gymId ?? 0;
  const subjectId = Number(staffId) || 0;
  const subjectType = staffRole as AccessSubjectType;
  const { data: staffDetails, isLoading: isStaffLoading } = useStaffByID(
    staffId,
    staffRole
  );
  const hasCredentials = Boolean(staffDetails?.username?.trim());
  const { data: accessModules = [], isLoading: isModulesLoading } =
    useAccessModules();
  const {
    data: subjectPermissions = [],
    isLoading: isPermissionsLoading,
    isError: isPermissionsError,
  } = useSubjectPermissions(gymId, subjectType, subjectId);
  const updatePermissions = useUpdateSubjectPermissions(
    gymId,
    subjectType,
    subjectId
  );

  const permissionModules = useMemo(() => {
    const apiModules = accessModules
      .map((module) => ({
        moduleKey: getModuleKey(module),
        label: getModuleLabel(module),
      }))
      .filter((module) => Boolean(module.moduleKey));

    return apiModules.length > 0 ? apiModules : fallbackPermissionModules;
  }, [accessModules]);

  const serverPermissions = useMemo(
    () => createPermissionsFromResponse(permissionModules, subjectPermissions),
    [permissionModules, subjectPermissions]
  );
  const [permissions, setPermissions] = useState<PermissionState>(
    createInitialPermissions(fallbackPermissionModules)
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const activePermissions = hasUnsavedChanges ? permissions : serverPermissions;

  const enabledPermissionCount = useMemo(
    () =>
      permissionModules.reduce(
        (count, module) =>
          count +
          actions.filter(
            (action) => activePermissions[module.moduleKey]?.[action.key]
          ).length,
        0
      ),
    [activePermissions, permissionModules]
  );

  const totalPermissionCount = permissionModules.length * actions.length;

  const handlePermissionChange = (
    module: string,
    action: PermissionAction,
    checked: boolean
  ) => {
    setPermissions((currentPermissions) => ({
      ...(hasUnsavedChanges ? currentPermissions : activePermissions),
      [module]: {
        ...(hasUnsavedChanges
          ? currentPermissions[module]
          : activePermissions[module]),
        [action]: checked,
      },
    }));
    setHasUnsavedChanges(true);
  };

  const applyBulkChange = (
    build: (base: PermissionState) => PermissionState
  ) => {
    setPermissions((currentPermissions) =>
      build(hasUnsavedChanges ? currentPermissions : serverPermissions)
    );
    setHasUnsavedChanges(true);
  };

  const handleModuleAllChange = (module: string, checked: boolean) =>
    applyBulkChange((base) => ({
      ...base,
      [module]: Object.fromEntries(
        actions.map((action) => [action.key, checked])
      ) as Record<PermissionAction, boolean>,
    }));

  const handleSelectAllChange = (checked: boolean) =>
    applyBulkChange(() => createInitialPermissions(permissionModules, checked));

  const isModuleAllEnabled = (moduleKey: string) =>
    actions.every((action) =>
      Boolean(activePermissions[moduleKey]?.[action.key])
    );

  const isAllEnabled =
    totalPermissionCount > 0 && enabledPermissionCount === totalPermissionCount;

  const handleSavePermissions = () => {
    const payload = {
      permissions: permissionModules.map((module) => ({
        moduleKey: module.moduleKey,
        canView: Boolean(activePermissions[module.moduleKey]?.canView),
        canCreate: Boolean(activePermissions[module.moduleKey]?.canCreate),
        canEdit: Boolean(activePermissions[module.moduleKey]?.canEdit),
        canDelete: Boolean(activePermissions[module.moduleKey]?.canDelete),
      })),
    };

    updatePermissions.mutate(payload, {
      onSuccess: (response) => {
        setHasUnsavedChanges(false);
        toast.success(response.message || 'Permissions updated successfully');
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to update permissions'
        );
      },
    });
  };

  const isLoading = isModulesLoading || isPermissionsLoading;
  const canSave =
    Boolean(gymId && subjectId && subjectType) &&
    hasUnsavedChanges &&
    !updatePermissions.isPending;

  if (!isStaffLoading && !hasCredentials) {
    return (
      <section className="overflow-hidden rounded-lg border border-primary-blue-300 bg-secondary-blue-500">
        <div className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center sm:py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-primary-blue-300 bg-secondary-blue-400/60">
            <Lock className="h-6 w-6 text-primary-blue-100" />
          </div>
          <div className="max-w-md space-y-2">
            <h5 className="text-base font-medium leading-normal text-white">
              Roles & Permissions are locked
            </h5>
            <p className="text-sm leading-normal text-white/60">
              {staffLoginEnabled ? (
                <>
                  This {staffRole === 'trainer' ? 'trainer' : 'staff'}{' '}
                  doesn&apos;t have login credentials yet. Set a username and
                  password from the profile sidebar to unlock roles and
                  permissions.
                </>
              ) : (
                <>
                  Staff login isn&apos;t included in your current plan. Upgrade
                  to give staff and trainers their own login with roles and
                  permissions.
                </>
              )}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-primary-blue-300 bg-secondary-blue-500">
      <div className="flex flex-col gap-4 border-b border-primary-blue-300 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between lg:p-6">
        <div className="min-w-0">
          <h5 className="text-base font-medium leading-normal text-white">
            Roles & Permissions
          </h5>
          <p className="mt-1 text-sm leading-normal text-white/60">
            {isLoading
              ? 'Loading permissions...'
              : `${enabledPermissionCount} of ${totalPermissionCount} permissions enabled`}
          </p>
          {isPermissionsError && (
            <p className="mt-1 text-sm leading-normal text-red-300">
              Failed to load saved permissions.
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-white/80">
            <span>Enable all permissions</span>
            <Switch
              aria-label="Select all permissions"
              checked={isAllEnabled}
              onCheckedChange={handleSelectAllChange}
              disabled={isLoading || permissionModules.length === 0}
            />
          </label>
          <Button onClick={handleSavePermissions} disabled={!canSave}>
            {updatePermissions.isPending ? 'Saving...' : 'Save Permissions'}
          </Button>
        </div>
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
            return (
              <div
                key={module.moduleKey}
                className="grid grid-cols-[minmax(160px,1.4fr)_repeat(5,minmax(64px,1fr))] items-center px-4 py-4 xl:grid-cols-[minmax(220px,1.4fr)_repeat(5,minmax(92px,1fr))] xl:px-6"
              >
                <div className="pr-3 text-sm font-normal leading-normal text-white">
                  {module.label}
                </div>
                {actions.map((action) => (
                  <div key={action.key} className="flex justify-center">
                    <PermissionSwitch
                      label={`${action.label} ${module.label}`}
                      checked={Boolean(
                        activePermissions[module.moduleKey]?.[action.key]
                      )}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(
                          module.moduleKey,
                          action.key,
                          checked
                        )
                      }
                    />
                  </div>
                ))}
                <div className="flex justify-center">
                  <PermissionSwitch
                    label={`All permissions for ${module.label}`}
                    checked={isModuleAllEnabled(module.moduleKey)}
                    onCheckedChange={(checked) =>
                      handleModuleAllChange(module.moduleKey, checked)
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
          return (
            <div key={module.moduleKey} className="p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h6 className="min-w-0 text-sm font-medium leading-normal text-white">
                  {module.label}
                </h6>
                <label className="inline-flex shrink-0 items-center gap-2 text-sm text-white/80">
                  <span>All</span>
                  <Switch
                    aria-label={`All permissions for ${module.label}`}
                    checked={isModuleAllEnabled(module.moduleKey)}
                    onCheckedChange={(checked) =>
                      handleModuleAllChange(module.moduleKey, checked)
                    }
                  />
                </label>
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
                      aria-label={`${action.label} ${module.label}`}
                      checked={Boolean(
                        activePermissions[module.moduleKey]?.[action.key]
                      )}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(
                          module.moduleKey,
                          action.key,
                          checked
                        )
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
