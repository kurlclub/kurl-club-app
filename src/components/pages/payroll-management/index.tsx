'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { StudioLayout } from '@/components/shared/layout';
import { DataTable, DataTableToolbar } from '@/components/shared/table';
import { Button } from '@/components/ui/button';
import { useFilterableList } from '@/hooks/use-filterable-list';
import { usePaySalary, usePayrollDashboard } from '@/hooks/use-payroll';
import { useSheet } from '@/hooks/use-sheet';
import { FilterConfig } from '@/lib/filters';
import { getEmployeeTypeFromRole, getPaymentMonth } from '@/lib/payroll-utils';
import { searchItems } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { useGymBranch } from '@/providers/gym-branch-provider';
import type { PayrollRow } from '@/types/payroll-management';

import AddPayment from './add-payment';
import CardWrapper from './card-wrapper';
import PayIndividual from './pay-individual';
import PaymentDetails from './payment-details';
import PaymentSuccess from './payment-success';
import PayRollDetails from './payroll-details';
import { getPayrollColumns } from './table/payroll-list-column';

const tableFilters: FilterConfig[] = [
  {
    columnId: 'role',
    title: 'Role',
    options: [
      { label: 'Trainer', value: 'Trainer' },
      { label: 'Staff', value: 'Staff' },
    ],
  },
  {
    columnId: 'feeStatus',
    title: 'Fee status',
    options: [
      { label: 'Paid', value: 'Paid' },
      { label: 'Partially Paid', value: 'Partially Paid' },
      { label: 'Unpaid', value: 'Unpaid' },
    ],
  },
];

const PayrollManagement = () => {
  const router = useRouter();
  const { gymBranch } = useGymBranch();
  const { user } = useAuth();
  const {
    isOpen: isBulkPaymentOpen,
    openSheet: openBulkPaymentSheet,
    closeSheet: closeBulkPaymentSheet,
  } = useSheet();
  const gymId = gymBranch?.gymId;
  const paySalaryMutation = usePaySalary();

  const { data: dashboardData, isLoading } = usePayrollDashboard(gymId);

  const payrollRows = useMemo<PayrollRow[]>(() => {
    const employees = dashboardData?.employees ?? [];

    return employees.map((employee) => {
      const roleKey = getEmployeeTypeFromRole(employee.role);
      const roleLabel = roleKey === 'trainer' ? 'Trainer' : 'Staff';
      const paidTotal = Number(employee.paidTotal ?? 0);
      const feeStatus = employee.isPaid
        ? 'Paid'
        : paidTotal > 0
          ? 'Partially Paid'
          : 'Unpaid';

      return {
        id: employee.id,
        staffId: employee.identifier || `STF-${employee.id}`,
        name: employee.name,
        role: roleLabel,
        roleKey,
        feeStatus,
        imageUrl: employee.photoPath ?? undefined,
        salary: Number(employee.salary ?? 0),
        paidTotal,
        lastPaidDate: employee.lastPaidDate ?? null,
        isPaid: employee.isPaid,
        isSalaryConfigured: employee.isSalaryConfigured,
      };
    });
  }, [dashboardData]);

  const { items: searchedRows, search } = useFilterableList<PayrollRow>(
    payrollRows,
    (items, term) =>
      searchItems(items, term, (item) => [
        item.staffId,
        item.name,
        item.role,
        item.feeStatus,
      ])
  );

  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[] | undefined>
  >({});
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isPayIndividualOpen, setIsPayIndividualOpen] = useState(false);
  const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = useState(false);
  const [isPaymentSuccessOpen, setIsPaymentSuccessOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollRow | null>(
    null
  );

  const handleOpenPaymentConfirmation = () => {
    setIsDetailsOpen(false);
    setIsPayIndividualOpen(false);
    setIsPaymentDetailsOpen(true);
  };

  const handlePayNow = async () => {
    if (!selectedPayroll) return;

    if (!gymId) {
      toast.error('Gym branch not found.');
      return;
    }

    const paidBy = user?.userId;
    if (!paidBy) {
      toast.error('User not authenticated.');
      return;
    }

    if (!selectedPayroll.isSalaryConfigured || selectedPayroll.salary <= 0) {
      toast.error('Salary not configured for this staff member.');
      return;
    }

    const paymentDate = new Date();
    const paymentMonth =
      dashboardData?.paymentMonth || getPaymentMonth(paymentDate);

    try {
      setIsProcessingPayment(true);
      await paySalaryMutation.mutateAsync({
        gymId,
        employeeType: selectedPayroll.roleKey,
        employeeId: selectedPayroll.id,
        amount: selectedPayroll.salary,
        paymentDate,
        paymentMonth,
        paidBy,
      });
      setIsPaymentDetailsOpen(false);
      setIsPaymentSuccessOpen(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to process payment.'
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCloseSuccess = (open: boolean) => {
    setIsPaymentSuccessOpen(open);
    if (!open) {
      setSelectedPayroll(null);
    }
  };

  const columns = useMemo(
    () =>
      getPayrollColumns({
        onView: (row) => {
          if (!row.isSalaryConfigured || row.salary <= 0) {
            toast.error('Salary not configured. Please set salary first.');
            router.push(`/staff-management/${row.roleKey}/${row.id}`);
            return;
          }
          setSelectedPayroll(row);
          setIsDetailsOpen(true);
        },
      }),
    [router]
  );

  const onFilterChange = (columnId: string, values: string[] | undefined) => {
    setSelectedFilters((prev) => ({ ...prev, [columnId]: values }));
  };

  const onResetFilters = () => setSelectedFilters({});

  const filteredRows = useMemo(() => {
    return searchedRows.filter((row) => {
      return Object.entries(selectedFilters).every(([columnId, values]) => {
        if (!values || values.length === 0) return true;

        const field = row[columnId as keyof PayrollRow];
        if (!field) return false;

        return values.some(
          (value) => String(field).toLowerCase() === String(value).toLowerCase()
        );
      });
    });
  }, [searchedRows, selectedFilters]);

  return (
    <StudioLayout
      title="Payroll management"
      headerActions={
        <Button className="h-10" onClick={openBulkPaymentSheet}>
          <Plus className="h-4 w-4" />
          Add payment
        </Button>
      }
    >
      <div className="space-y-4">
        <AddPayment
          open={isBulkPaymentOpen}
          onOpenChange={(open) => {
            if (open) {
              openBulkPaymentSheet();
              return;
            }
            closeBulkPaymentSheet();
          }}
          members={payrollRows}
        />

        <CardWrapper
          summary={
            dashboardData?.summary || {
              totalPaid: 0,
              totalUnpaid: 0,
              paidCount: 0,
              unpaidCount: 0,
              totalEmployees: 0,
            }
          }
          isLoading={isLoading}
        />
        <h2 className="mt-8 mb-7 font-medium text-[20px] leading-normal">
          Staff & trainers
        </h2>
        <DataTable
          columns={columns}
          data={filteredRows}
          isLoading={isLoading}
          toolbar={(table) => (
            <DataTableToolbar
              table={table}
              onSearch={search}
              filters={tableFilters}
              onFilterChange={onFilterChange}
              selectedFilters={selectedFilters}
              onResetFilters={onResetFilters}
            />
          )}
        />

        <PayRollDetails
          details={selectedPayroll}
          isDetailsOpen={isDetailsOpen}
          setIsDetailsOpen={setIsDetailsOpen}
          onMakePayment={() => {
            setIsDetailsOpen(false);
            setIsPayIndividualOpen(true);
          }}
        />

        <PayIndividual
          details={selectedPayroll}
          open={isPayIndividualOpen}
          onOpenChange={setIsPayIndividualOpen}
          onProceedToPay={handleOpenPaymentConfirmation}
          paymentMonth={dashboardData?.paymentMonth}
        />

        <PaymentDetails
          details={selectedPayroll}
          open={isPaymentDetailsOpen}
          onOpenChange={setIsPaymentDetailsOpen}
          onPayNow={handlePayNow}
          paymentMonth={dashboardData?.paymentMonth}
          isProcessing={isProcessingPayment}
        />

        <PaymentSuccess
          details={selectedPayroll}
          open={isPaymentSuccessOpen}
          onOpenChange={handleCloseSuccess}
        />
      </div>
    </StudioLayout>
  );
};

export default PayrollManagement;
