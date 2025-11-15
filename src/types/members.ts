export type Member = {
  id: string;
  gymNo: string;
  gymId?: string;
  name: string;
  avatar: string;
  package: 'Monthly' | 'Yearly' | 'Special' | 'Quarterly' | 'Half_Yearly';
  feeStatus: 'paid' | 'partially_paid' | 'unpaid';
  email: string;
  phone: string;
  bloodGroup: string;
  gender?: string;
  dob?: string;
  doj?: string;
  workoutPlan?: string;
  memberIdentifier?: string;
  profilePicture: string | File | null;
  createdAt: string;
  personalTrainer?: string | number;
};

export type MemberDetails = {
  id: number;
  memberIdentifier: string;
  name: string;
  dob: string;
  bloodGroup: string;
  gender?: string;
  package: string;
  feeStatus: string;
  doj: string;
  phone: string;
  email: string;
  height: number;
  weight: number;
  personalTrainer: number;
  membershipPlanId: number;
  fullAddress: string;
  workoutPlan: number;
  profilePicture: string | File | null;
  customSessionRate?: number;
  photoPath?: string;
  idCopyPath?: string;
  address?: string;
  idType?: string;
  idNumber?: string;
  fitnessGoal?: string;
  medicalHistory?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
};

export type WorkoutPlan = 'Weight loss' | 'Muscle gain' | 'General fitness';
export type BloodGroup =
  | 'A+'
  | 'B+'
  | 'O+'
  | 'AB+'
  | 'A-'
  | 'B-'
  | 'O-'
  | 'AB-';
export type Trainer = 'Hafiz' | 'John' | 'Sarah';

export interface EditableSectionProps {
  isEditing: boolean;
  details: MemberDetails | null;
  onUpdate: <K extends keyof MemberDetails>(
    key: K,
    value: MemberDetails[K]
  ) => void;
}
