'use client';

import { useMemo, useState } from 'react';

import { Plus } from 'lucide-react';

import { StudioLayout } from '@/components/shared/layout';
import { DataTable, DataTableToolbar } from '@/components/shared/table';
import { Button } from '@/components/ui/button';
import { useFilterableList } from '@/hooks/use-filterable-list';
import { useSheet } from '@/hooks/use-sheet';
import { FilterConfig } from '@/lib/filters';
import { searchItems } from '@/lib/utils';
import type { PayrollRow } from '@/types/payroll-management';

import AddPayment from './add-payment';
import CardWrapper from './card-wrapper';
import PaymentDetails from './payment-details';
import PaymentSuccess from './payment-success';
import PayRollDetails from './payroll-details';
import { getPayrollColumns } from './table/payroll-list-column';

const DUMMY_PAYROLL_DATA: PayrollRow[] = [
  {
    staffId: 'STF-1001',
    name: 'Aarav Sharma',
    role: 'Trainer',
    feeStatus: 'Paid',
    imageUrl: 'https://i.pravatar.cc/100?img=12',
  },
  {
    staffId: 'STF-1003',
    name: 'Rahul Verma',
    role: 'Staff',
    feeStatus: 'Unpaid',
    imageUrl: 'https://i.pravatar.cc/100?img=22',
  },
  {
    staffId: 'STF-1004',
    name: 'Sneha Iyer',
    role: 'Trainer',
    feeStatus: 'Unpaid',
  },
  {
    staffId: 'STF-1005',
    name: 'Karan Mehta',
    role: 'Staff',
    feeStatus: 'Paid',
    imageUrl: 'https://i.pravatar.cc/100?img=16',
  },
  {
    staffId: 'STF-1007',
    name: 'Vikram Singh',
    role: 'Trainer',
    feeStatus: 'Paid',
  },
  {
    staffId: 'STF-1008',
    name: 'Ananya Rao',
    role: 'Staff',
    feeStatus: 'Unpaid',
    imageUrl: 'https://i.pravatar.cc/100?img=48',
  },
  {
    staffId: 'STF-1009',
    name: 'Rohit Das',
    role: 'Trainer',
    feeStatus: 'Unpaid',
  },
  {
    staffId: 'STF-1011',
    name: 'Nitin Kapoor',
    role: 'Staff',
    feeStatus: 'Paid',
    imageUrl: 'https://i.pravatar.cc/100?img=29',
  },
  {
    staffId: 'STF-1012',
    name: 'Sana Khan',
    role: 'Trainer',
    feeStatus: 'Unpaid',
  },
];

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
  const {
    isOpen: isBulkPaymentOpen,
    openSheet: openBulkPaymentSheet,
    closeSheet: closeBulkPaymentSheet,
  } = useSheet();

  const { items: searchedRows, search } = useFilterableList<PayrollRow>(
    DUMMY_PAYROLL_DATA,
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
  const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = useState(false);
  const [isPaymentSuccessOpen, setIsPaymentSuccessOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollRow | null>(
    null
  );

  const handleOpenPaymentConfirmation = () => {
    setIsDetailsOpen(false);
    setIsPaymentDetailsOpen(true);
  };

  const handlePayNow = () => {
    setIsPaymentDetailsOpen(false);
    setIsPaymentSuccessOpen(true);
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
          setSelectedPayroll(row);
          setIsDetailsOpen(true);
        },
      }),
    []
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
          members={DUMMY_PAYROLL_DATA}
        />

        <CardWrapper />
        <h2 className="mt-8 mb-7 font-medium text-[20px] leading-normal">
          Staff & trainers
        </h2>
        <DataTable
          columns={columns}
          data={filteredRows}
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
          onMakePayment={handleOpenPaymentConfirmation}
        />

        <PaymentDetails
          details={selectedPayroll}
          open={isPaymentDetailsOpen}
          onOpenChange={setIsPaymentDetailsOpen}
          onPayNow={handlePayNow}
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
