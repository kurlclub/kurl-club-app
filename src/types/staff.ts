export type StaffType = 'trainer' | 'staff';

export type Staff = {
  uuid: string;
  id: string;
  staffId: string;
  name: string;
  avatar: string;
  role: StaffType;
  email: string;
  phone: string;
  bloodGroup: string;
  gender?: string;
  createdAt: string;
};

export type StaffDetails = {
  id: number;
  name?: string; // for staff
  trainerName?: string; // for trainer
  trainerId?: string; // for trainer
  email: string;
  phone: string;
  dob: string;
  bloodGroup: string;
  gender: string;
  addressLine: string;
  doj: string;
  status: string;
  profilePicture: string | File | null;
  hasProfilePicture?: boolean;
  // Trainer specific
  certification?: string;
  gymId?: number;
  // Legacy fields (keeping for compatibility)
  uuid?: string;
  memberIdentifier?: string;
  package?: string;
  feeStatus?: string;
  height?: number;
  weight?: number;
  personalTrainer?: number;
  workoutPlan?: number;
};

export interface EditableSectionProps {
  isEditing: boolean;
  details: StaffDetails | null;
  onUpdate: <K extends keyof StaffDetails>(
    key: K,
    value: StaffDetails[K]
  ) => void;
}
