interface ProviderData {
  providerId: string;
  uid: string;
  displayName: string | null;
  email: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
}

export interface FirebaseResponse {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  providerData: ProviderData[];
}

export interface UserRequest extends Record<string, unknown> {
  uid: string;
  email: string;
  emailVerified: boolean;
  role?: string;
  phoneNumber?: string | null;
  photoURL?: string | null;
}

export interface userDetail {
  name: string;
  role: Role;
  trainerNo: string;
  email: string;
  mobile: string;
  dob: string;
  doj: string;
  bloodGroup: BloodGroup;
  address: string;
  pin: string;
  gender: Gender;
}

export type BloodGroup =
  | 'A+'
  | 'B+'
  | 'O+'
  | 'AB+'
  | 'A-'
  | 'B-'
  | 'O-'
  | 'AB-';
export type Role = 'Trainer' | 'Admin' | 'Staff';
export type Gender = 'Male' | 'Female' | 'Transgender';

export interface EditableSectionProps {
  isEditing: boolean;
  details: userDetail;
  onUpdate: <K extends keyof userDetail>(key: K, value: userDetail[K]) => void;
  role?: string;
  trainerNo?: string;
}

export type User = {
  name: string;
  joined_date?: string;
  user_id: string;
  package?: 'Monthly' | 'Quarterly' | 'Yearly';
  picture?: string | undefined;
};
