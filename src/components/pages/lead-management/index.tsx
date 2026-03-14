'use client';

import { useMemo, useState } from 'react';

import { Plus } from 'lucide-react';

import { StudioLayout } from '@/components/shared/layout';
import { DataTable, DataTableToolbar } from '@/components/shared/table';
import { Button } from '@/components/ui/button';
import { useFilterableList } from '@/hooks/use-filterable-list';
import { useSheet } from '@/hooks/use-sheet';
import { searchItems } from '@/lib/utils';
import { useGymBranch } from '@/providers/gym-branch-provider';
import { useLeads } from '@/services/lead';
import { Lead } from '@/types/lead';

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

export default function LeadManagement() {
  const { isOpen, openSheet, closeSheet } = useSheet();
  const {
    isOpen: isViewOpen,
    openSheet: openViewSheet,
    closeSheet: closeViewSheet,
  } = useSheet();
  const { gymBranch } = useGymBranch();
  const { data: leadApiData = [], isLoading } = useLeads(gymBranch?.gymId);

  const leads = useMemo<Lead[]>(() => {
    const normalizeSource = (source?: string): Lead['source'] => {
      const normalized = (source || '').toLowerCase();
      if (normalized === 'walk in' || normalized === 'walkin') {
        return 'walk_in';
      }
      if (normalized === 'online' || normalized === 'ads') {
        return normalized;
      }
      return 'online';
    };

    const normalizeInterest = (status?: string): Lead['interest'] => {
      const normalized = (status || '').toLowerCase();
      if (
        normalized === 'lost' ||
        normalized === 'new' ||
        normalized === 'interested' ||
        normalized === 'contacted'
      ) {
        return normalized;
      }
      return 'new';
    };

    return leadApiData.map((lead) => ({
      id: lead.id,
      leadNo: String(lead.id).padStart(3, '0'),
      leadName: lead.name,
      createdAt: lead.createdAt,
      phone: lead.phone,
      interest: normalizeInterest(lead.status),
      source: normalizeSource(lead.source),
      note: lead.notes,
      followUpDate: lead.followUpDate,
      assignedToUserId: lead.assignedToUserId,
      assignedToUserType: lead.assignedToUserType,
      assignedTo: lead.assignedToUserName,
    }));
  }, [leadApiData]);

  // lead being edited via AddLead
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [leadFilters, setLeadFilters] = useState({
    page: 1,
    pageSize: 10,
  });

  // search + filter logic
  const { items: searchedLeads, search } = useFilterableList<Lead>(
    leads,
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
        <Button
          className="h-10"
          onClick={() => {
            setEditingLead(null);
            openSheet();
          }}
        >
          <Plus className="h-4 w-4" />
          Add new
        </Button>
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
        isLoading={isLoading}
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
