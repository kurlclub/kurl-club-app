export interface GymDetails {
  id: number;
  gymName: string;
  location: string;
  contactNumber1: string;
  contactNumber2?: string | null;
  email: string;
  socialLinks?: string | null;
  gymAdminId: number;
  status: string;
  gymIdentifier: string;
}

export interface GymResponse {
  status: string;
  message: string;
  data: GymDetails;
}
