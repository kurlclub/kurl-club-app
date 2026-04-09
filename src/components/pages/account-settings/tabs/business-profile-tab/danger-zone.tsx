import { useMemo, useState } from 'react';

import {
  AlertTriangle,
  Info,
  Loader2,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { useSettingsGymId } from '@/components/pages/account-settings/tabs/settings-gym';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/providers/auth-provider';
import { DeleteCheckData, checkGymDelete, hardDeleteGym } from '@/services/gym';

const blockersToLabel: Record<string, string> = {
  members: 'Members',
  trainers: 'Trainers',
  staff: 'Staff',
  payments: 'Payments',
  paymentCycles: 'Payment Cycles',
  sessionPayments: 'Session Payments',
  attendanceRecords: 'Attendance Records',
  expenses: 'Expenses',
  leads: 'Leads',
  salaryPayments: 'Salary Payments',
  supportTickets: 'Support Tickets',
  workoutPlans: 'Workout Plans',
  membershipPlans: 'Membership Plans',
  accessPermissions: 'Access Permissions',
  biometricDevices: 'Biometric Devices',
};

const toBlockerRows = (blockers: DeleteCheckData['blockers']) =>
  Object.entries(blockers).map(([key, count]) => ({
    key,
    label: blockersToLabel[key] || key,
    count,
  }));

export default function DangerZone() {
  const gymId = useSettingsGymId();
  const { refreshUser } = useAuth();
  const [isLoadingCheck, setIsLoadingCheck] = useState(false);
  const [deleteCheckData, setDeleteCheckData] =
    useState<DeleteCheckData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isConfirmAlertOpen, setIsConfirmAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmGymName, setConfirmGymName] = useState('');

  const blockerRows = useMemo(
    () => (deleteCheckData ? toBlockerRows(deleteCheckData.blockers) : []),
    [deleteCheckData]
  );

  const hasBlockers = blockerRows.some((row) => row.count > 0);
  const isDeleteEnabled =
    deleteCheckData !== null &&
    confirmGymName.trim().toLowerCase() ===
      deleteCheckData.gymName.toLowerCase();

  const handleOpenDeleteDialog = async () => {
    if (!gymId) return;
    setConfirmGymName('');
    setIsLoadingCheck(true);
    const result = await checkGymDelete(gymId);
    setIsLoadingCheck(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setDeleteCheckData(result.data ?? null);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!gymId) return;
    setIsDeleting(true);
    const result = await hardDeleteGym(gymId);
    setIsDeleting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setIsConfirmAlertOpen(false);
    setIsDeleteDialogOpen(false);
    toast.success(result.success ?? 'Club deleted successfully.');
    await refreshUser();
  };

  return (
    <>
      <Card className="border-red-500/40 bg-red-50 dark:bg-red-950/15">
        <CardHeader className="flex flex-row items-center gap-3 pb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/40">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-red-700 dark:text-red-400">
              Danger Zone
            </CardTitle>
            <CardDescription className="text-red-600/80 dark:text-red-300/70">
              Critical actions that cannot be undone
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-0.5">
            <p className="font-medium text-gray-900 dark:text-white">
              Delete this club
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Review impact details before deleting. You will need to type the
              gym name to confirm.
            </p>
          </div>

          <Button
            variant="destructive"
            className="md:w-auto w-full"
            disabled={isLoadingCheck}
            onClick={handleOpenDeleteDialog}
          >
            {isLoadingCheck ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete Club
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-xl border-red-500/40 bg-primary-blue-500">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <ShieldAlert className="h-5 w-5" />
              Delete Club Confirmation
            </DialogTitle>
            <DialogDescription className="text-secondary-blue-100">
              This action may remove or affect important data tied to this club.
              Please review details carefully before continuing.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-secondary-blue-400 bg-secondary-blue-700 px-3 py-2">
            <p className="text-xs text-secondary-blue-200">Gym Name</p>
            <p className="text-base font-semibold text-white">
              {deleteCheckData?.gymName}
            </p>
          </div>

          {hasBlockers && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-300">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                This club still has linked data. Deleting it will permanently
                remove or affect all records listed below.
              </span>
            </div>
          )}

          <div className="rounded-lg border border-secondary-blue-400 bg-secondary-blue-700 px-3 py-2">
            <p className="mb-2 flex items-center gap-2 text-xs text-secondary-blue-200">
              <Info className="h-3.5 w-3.5" />
              Linked Data Overview
            </p>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {blockerRows.map((row) => (
                <div
                  key={row.key}
                  className="rounded-md border border-secondary-blue-400/70 bg-secondary-blue-600/80 px-2.5 py-2"
                >
                  <p className="text-[12px] text-secondary-blue-200 truncate">
                    {row.label}
                  </p>
                  <p className="text-[14px] font-semibold text-white">
                    {row.count}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs text-secondary-blue-200">
              Type{' '}
              <span className="font-semibold text-white">
                {deleteCheckData?.gymName}
              </span>{' '}
              to enable delete.
            </p>
            <Input
              value={confirmGymName}
              onChange={(e) => setConfirmGymName(e.target.value)}
              placeholder="Type gym name to confirm"
              className="bg-secondary-blue-700 border-secondary-blue-400 text-white h-12"
            />
          </div>

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!isDeleteEnabled}
              onClick={() => setIsConfirmAlertOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete Club
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isConfirmAlertOpen}
        onOpenChange={setIsConfirmAlertOpen}
      >
        <AlertDialogContent className="bg-primary-blue-500 border-red-500/40">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-secondary-blue-100">
              This will permanently delete{' '}
              <strong className="text-white">{deleteCheckData?.gymName}</strong>{' '}
              and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              disabled={isDeleting}
              onClick={() => setIsConfirmAlertOpen(false)}
              variant="secondary"
              className="text-white"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Yes, Delete Club
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
