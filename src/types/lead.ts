export type InterestStatus = 'lost' | 'new' | 'interested' | 'contacted';
export type LeadSource = 'walk_in' | 'online' | 'ads';

export interface Lead {
  id: number;
  leadNo: string;
  leadName: string;
  createdAt: string;
  phone?: string;
  interest: InterestStatus;
  source: LeadSource;
  profilePicture?: string;
  photoPath?: string;
  note?: string;
  followUpDate?: string;
  assignedTo?: string;
}

export type LeadListItem = Lead;
