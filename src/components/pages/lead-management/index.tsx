'use client';

import { useMemo, useState } from 'react';

import { StudioLayout } from '@/components/shared/layout';
import { DataTable, DataTableToolbar } from '@/components/shared/table';
import { useFilterableList } from '@/hooks/use-filterable-list';
import { useSheet } from '@/hooks/use-sheet';
import { searchItems } from '@/lib/utils';
import { Lead } from '@/types/lead';

import { StaffsHeader } from '../staff-management/staff-header';
import AddLead from './add-lead';
import { getLeadColumns } from './table/lead-list-columns';
import ViewLead from './view-lead';

// filters for the lead table
const tableFilters = [
  {
    columnId: 'interest',
    title: 'Interest',
    options: [
      { label: 'New', value: 'new' },
      { label: 'Interested', value: 'interested' },
      { label: 'Contacted', value: 'contacted' },
      { label: 'Lost', value: 'lost' },
    ],
  },
  {
    columnId: 'source',
    title: 'Source',
    options: [
      { label: 'Walk In', value: 'walk_in' },
      { label: 'Online', value: 'online' },
      { label: 'Ads', value: 'ads' },
    ],
  },
];

// Dummy leads data
export const dummyLeads: Lead[] = [
  {
    id: 1,
    leadNo: '001',
    leadName: 'Rajesh Kumar',
    createdAt: '2025-02-20T10:30:00',
    phone: '+919876543210',
    interest: 'new',
    source: 'walk_in',
    note: 'Interested in premium membership. Follow up next week.',
    followUpDate: '2025-02-25',
    assignedTo: 'Rahul (Sales)',
  },
  {
    id: 2,
    leadNo: '002',
    leadName: 'Priya Singh',
    createdAt: '2025-02-19T14:45:00',
    phone: '+919812345678',
    interest: 'interested',
    source: 'online',
    note: 'Asked for online training plans. Shared brochure.',
    followUpDate: '2025-02-24',
    assignedTo: 'Anita (Support)',
  },
  {
    id: 3,
    leadNo: '003',
    leadName: 'Amit Patel',
    createdAt: '2025-02-18T09:15:00',
    phone: '+919823456789',
    interest: 'contacted',
    source: 'ads',
    note: 'Responded to Facebook ad. Needs follow-up call.',
    followUpDate: '2025-02-23',
    assignedTo: 'Rohit (Marketing)',
  },
  {
    id: 4,
    leadNo: '004',
    leadName: 'Anjali Reddy',
    createdAt: '2025-02-17T16:20:00',
    phone: '+919834567890',
    interest: 'new',
    source: 'walk_in',
    note: 'Walk-in inquiry. Interested in group classes.',
    followUpDate: '2025-02-26',
    assignedTo: 'Rahul (Sales)',
  },
  {
    id: 5,
    leadNo: '005',
    leadName: 'Vikram Rao',
    createdAt: '2025-02-16T11:00:00',
    phone: '+919845678901',
    interest: 'lost',
    source: 'online',
    note: 'Not interested due to pricing.',
    followUpDate: '2025-02-22',
    assignedTo: 'Anita (Support)',
  },
  {
    id: 6,
    leadNo: '006',
    leadName: 'Neha Gupta',
    createdAt: '2025-02-15T13:30:00',
    phone: '+919856789012',
    interest: 'interested',
    source: 'ads',
    note: 'Interested in personal training. Requested callback.',
    followUpDate: '2025-02-27',
    assignedTo: 'Rohit (Marketing)',
  },
  {
    id: 7,
    leadNo: '007',
    leadName: 'Suresh Joshi',
    createdAt: '2025-02-14T10:45:00',
    phone: '+919867890123',
    interest: 'contacted',
    source: 'walk_in',
    note: 'Visited gym. Considering annual membership.',
    followUpDate: '2025-02-21',
    assignedTo: 'Rahul (Sales)',
  },
  {
    id: 8,
    leadNo: '008',
    leadName: 'Divya Nair',
    createdAt: '2025-02-13T15:15:00',
    phone: '+919878901234',
    interest: 'new',
    source: 'online',
    note: 'Submitted inquiry form via website.',
    followUpDate: '2025-02-28',
    assignedTo: 'Anita (Support)',
  },
  {
    id: 9,
    leadNo: '009',
    leadName: 'Arjun Verma',
    createdAt: '2025-02-12T12:00:00',
    phone: '+919889012345',
    interest: 'interested',
    source: 'ads',
    note: 'Clicked Google Ad. Asked about trial session.',
    followUpDate: '2025-02-24',
    assignedTo: 'Rohit (Marketing)',
  },
  {
    id: 10,
    leadNo: '010',
    leadName: 'Sneha Chopra',
    createdAt: '2025-02-11T09:30:00',
    phone: '+919890123456',
    interest: 'new',
    source: 'walk_in',
    note: 'Referred by existing member.',
    followUpDate: '2025-02-26',
    assignedTo: 'Rahul (Sales)',
  },
];

export default function LeadManagement() {
  const { isOpen, openSheet, closeSheet } = useSheet();
  const {
    isOpen: isViewOpen,
    openSheet: openViewSheet,
    closeSheet: closeViewSheet,
  } = useSheet();

  // lead being edited via AddLead
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [leadFilters, setLeadFilters] = useState({
    page: 1,
    pageSize: 10,
  });

  // search + filter logic
  const { items: searchedLeads, search } = useFilterableList<Lead>(
    dummyLeads,
    // searchItems requires T extends Record so we cast for Lead
    searchItems as unknown as (items: Lead[], term: string) => Lead[]
  );

  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[] | undefined>
  >({});

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const onFilterChange = (columnId: string, values: string[] | undefined) => {
    setSelectedFilters((prev) => ({ ...prev, [columnId]: values }));
  };

  const onResetFilters = () => setSelectedFilters({});

  const filteredLeads = useMemo(() => {
    return searchedLeads.filter((l) => {
      return Object.entries(selectedFilters).every(([col, vals]) => {
        if (!vals || vals.length === 0) return true;

        const key = col as keyof Lead;
        const field = l[key];
        if (field === undefined || field === null) return false;

        return vals.some(
          (v) => String(field).toLowerCase() === String(v).toLowerCase()
        );
      });
    });
  }, [searchedLeads, selectedFilters]);

  const totalCount = filteredLeads.length;

  const paginatedLeads = useMemo(() => {
    const startIndex = (leadFilters.page - 1) * leadFilters.pageSize;
    const endIndex = startIndex + leadFilters.pageSize;
    return filteredLeads.slice(startIndex, endIndex);
  }, [leadFilters.page, leadFilters.pageSize, filteredLeads]);

  const columns = useMemo(
    () =>
      getLeadColumns({
        onView: (lead: Lead) => {
          setSelectedLead(lead);
          openViewSheet();
        },
      }),
    [openViewSheet]
  );

  return (
    <StudioLayout
      title="Lead Management"
      headerActions={
        <StaffsHeader
          onAddNewClick={() => {
            setEditingLead(null);
            openSheet();
          }}
          isOpen={isOpen}
          closeSheet={closeSheet}
        />
      }
    >
      <AddLead
        isOpen={isOpen}
        closeSheet={() => {
          setEditingLead(null);
          closeSheet();
        }}
        initialData={editingLead ?? undefined}
      />
      <ViewLead
        isOpen={isViewOpen}
        closeSheet={() => {
          setSelectedLead(null);
          closeViewSheet();
        }}
        lead={selectedLead}
        onEdit={(lead) => {
          setEditingLead(lead);
          closeViewSheet();
          openSheet();
        }}
      />
      <DataTable
        columns={columns}
        data={paginatedLeads}
        totalCount={totalCount}
        pageSize={leadFilters.pageSize}
        currentPage={leadFilters.page}
        onPageChange={(page) => setLeadFilters((prev) => ({ ...prev, page }))}
        onPageSizeChange={(pageSize) =>
          setLeadFilters((prev) => ({ ...prev, pageSize, page: 1 }))
        }
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
    </StudioLayout>
  );
}
