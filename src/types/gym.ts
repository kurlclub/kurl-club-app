export interface GymDetails {
  id: number;
  gymName: string;
  location: string;
  contactNumber1: string;
  contactNumber2?: string | null;
  email: string;
  socialLinks?: string | Array<string | { url?: string | null }> | null;
  gymAdminId: number;
  status: string;
  gymIdentifier: string;
  photoPath?: string | null;
}

export interface GymResponse {
  status: string;
  message: string;
  data: GymDetails;
}
