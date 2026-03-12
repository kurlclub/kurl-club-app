import { useMemo, useState } from 'react';

import { format } from 'date-fns';
import { Calendar, IndianRupee, Pencil } from 'lucide-react';
import { toast } from 'sonner';

import { KDatePicker } from '@/components/shared/form/k-datepicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUpsertStaffSalary } from '@/hooks/use-payroll';
import { useStaffSalaryDetails } from '@/services/staff';
import { StaffType } from '@/types/staff';

interface SalaryConfigurationProps {
  staffId: string;
  staffRole: StaffType;
}

function SalaryConfiguration({ staffId, staffRole }: SalaryConfigurationProps) {
  const {
    data: salaryDetails,
    isLoading,
    isError,
  } = useStaffSalaryDetails(staffId, staffRole);
  const upsertSalaryMutation = useUpsertStaffSalary();
  const isSaving = upsertSalaryMutation.isPending;

  const [isEditing, setIsEditing] = useState(false);

  const initialSalaryData = useMemo(() => {
    if (!salaryDetails) return { amount: '', date: undefined };
    return {
      amount: String(salaryDetails.salary ?? ''),
      date: salaryDetails.salaryDate
        ? new Date(salaryDetails.salaryDate)
        : undefined,
    };
  }, [salaryDetails]);

  const [draftAmount, setDraftAmount] = useState(initialSalaryData.amount);
  const [draftDate, setDraftDate] = useState<Date | undefined>(
    initialSalaryData.date
  );

  const savedAmount = initialSalaryData.amount;
  const savedDate = initialSalaryData.date;

  const isDirty = useMemo(
    () =>
      draftAmount !== savedAmount ||
      (draftDate?.toDateString() ?? '') !== (savedDate?.toDateString() ?? ''),
    [draftAmount, draftDate, savedAmount, savedDate]
  );

  const handleStartEdit = () => {
    setDraftAmount(savedAmount);
    setDraftDate(savedDate);
    setIsEditing(true);
  };

  const handleDiscard = () => {
    setDraftAmount(savedAmount);
    setDraftDate(savedDate);
    setIsEditing(false);
  };

  const handleSave = async () => {
    const salaryValue = Number(draftAmount);
    if (!draftAmount || !Number.isFinite(salaryValue) || salaryValue <= 0) {
      toast.error('Please enter a valid salary amount.');
      return;
    }

    if (!draftDate) {
      toast.error('Please select a salary date.');
      return;
    }

    if (!staffId) {
      toast.error('Staff not found.');
      return;
    }

    try {
      await upsertSalaryMutation.mutateAsync({
        employeeId: Number(staffId),
        employeeType: staffRole,
        salary: salaryValue,
        salaryDate: draftDate,
      });
      setIsEditing(false);
      toast.success('Salary configuration saved.');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to save salary configuration.'
      );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-secondary-blue-500 border border-primary-blue-300 rounded-lg p-6 text-secondary-blue-100">
        Loading salary details...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-secondary-blue-500 border border-primary-blue-300 rounded-lg p-6 text-red-300">
        Failed to load salary details.
      </div>
    );
  }

  return (
    <div className="bg-secondary-blue-500 border border-primary-blue-300 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h5 className="text-white text-base font-medium leading-normal">
            Salary Configuration
          </h5>
          <p className="text-secondary-blue-100 text-sm mt-1">
            Set monthly payout amount and salary disbursement date.
          </p>
        </div>

        {!isEditing && (
          <Button variant="outline" className="h-10" onClick={handleStartEdit}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-secondary-blue-100">
            Salary Amount
          </label>
          <div className="relative">
            <IndianRupee className="h-4 w-4 text-secondary-blue-100 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="number"
              min={0}
              step="0.01"
              value={draftAmount}
              disabled={!isEditing}
              onChange={(e) => setDraftAmount(e.target.value)}
              className="pl-8 h-12 bg-primary-blue-500 font-semibold border-primary-blue-300 text-white disabled:opacity-100 disabled:text-secondary-blue-100 disabled:font-normal"
              placeholder="Enter salary amount"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-secondary-blue-100">Salary Date</label>
          {isEditing ? (
            <KDatePicker
              mode="single"
              showPresets={false}
              showYearSelector
              value={draftDate}
              onDateChange={(date) => setDraftDate(date as Date | undefined)}
              label="Select salary date"
              icon={<Calendar className="text-primary-green-100 h-4 w-4" />}
              className="h-12 bg-primary-blue-500! w-full"
            />
          ) : (
            <div className="h-12 rounded-md border border-primary-blue-300 bg-primary-blue-500 px-3 flex opacity-100 items-center text-secondary-blue-100 text-sm gap-2">
              <Calendar className="h-4 w-4 text-secondary-blue-100" />
              {savedDate ? format(savedDate, 'dd MMM yyyy') : 'Not set'}
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="flex items-center justify-end gap-2 border-t border-primary-blue-300 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleDiscard}
            disabled={isSaving}
          >
            Discard
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
}

export default SalaryConfiguration;
