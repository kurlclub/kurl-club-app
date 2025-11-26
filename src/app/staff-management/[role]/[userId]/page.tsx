'use client';

import { useEffect, useState } from 'react';

import Contents from '@/components/pages/staff-management/details/contents';
import { Sidebar } from '@/components/pages/staff-management/details/sidebar';
import { useStaffDetails } from '@/hooks/use-staff-details';
import { StaffType } from '@/types/staff';

interface StaffDetailsPageProps {
  params: Promise<{ role: StaffType; userId: string }>;
}

export default function StaffDetailsPage({ params }: StaffDetailsPageProps) {
  const [staffId, setStaffId] = useState<string>('');
  const [staffRole, setStaffRole] = useState<StaffType>('staff');

  useEffect(() => {
    params.then(({ userId, role }) => {
      setStaffId(userId);
      setStaffRole(role);
    });
  }, [params]);

  const {
    isEditing,
    handleSave,
    toggleEdit,
    details,
    loading,
    error,
    updateStaffDetail,
  } = useStaffDetails(staffId, staffRole);

  if (loading) return <p>Loading staff details...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <main className="p-0 flex flex-auto gap-4 md:gap-0 bg-background-dark h-full">
      <Sidebar
        isEditing={isEditing}
        details={details}
        updateStaffDetail={updateStaffDetail}
        staffRole={staffRole}
      />
      <Contents
        staffRole={staffRole}
        staffId={staffId}
        isEditing={isEditing}
        handleSave={handleSave}
        toggleEdit={toggleEdit}
      />
    </main>
  );
}
