import { z } from 'zod/v4';

import { GymDataDetailsSchema } from '@/schemas';
import type { AppClub } from '@/types/access';
import type { GymDetails } from '@/types/gym';

export type BusinessProfileFormValues = z.infer<typeof GymDataDetailsSchema>;

type SocialLinkValue = { url?: string | null } | string;

const getDefaultSocialLinkFields = () => [{ url: '' }];

export const getDefaultBusinessProfileFormValues =
  (): BusinessProfileFormValues => ({
    ProfilePicture: null,
    GymName: '',
    Phone: '',
    Email: '',
    Address: '',
    socialLinks: getDefaultSocialLinkFields(),
  });

const normalizeSocialLinks = (
  socialLinks?: string | SocialLinkValue[] | null
): string[] => {
  if (!socialLinks) return [];

  if (Array.isArray(socialLinks)) {
    return socialLinks
      .map((link) =>
        typeof link === 'string' ? link.trim() : link.url?.trim() || ''
      )
      .filter(Boolean);
  }

  const trimmedLinks = socialLinks.trim();
  if (!trimmedLinks) return [];

  try {
    const parsedLinks = JSON.parse(trimmedLinks) as unknown;
    if (Array.isArray(parsedLinks)) {
      return parsedLinks
        .map((link) => {
          if (typeof link === 'string') return link.trim();
          if (link && typeof link === 'object' && 'url' in link) {
            return String(link.url ?? '').trim();
          }
          return '';
        })
        .filter(Boolean);
    }
  } catch {
    // Fallback to comma-separated values.
  }

  return trimmedLinks
    .split(',')
    .map((link) => link.trim())
    .filter(Boolean);
};

export const extractSocialLinks = (
  socialLinks?:
    | string
    | SocialLinkValue[]
    | BusinessProfileFormValues['socialLinks']
    | null
) => normalizeSocialLinks(socialLinks);

export const serializeSocialLinks = (
  socialLinks?:
    | string
    | SocialLinkValue[]
    | BusinessProfileFormValues['socialLinks']
    | null
) => normalizeSocialLinks(socialLinks).join(',');

const toSocialLinkFieldValues = (
  socialLinks?: string | SocialLinkValue[] | null
) => {
  const links = normalizeSocialLinks(socialLinks).map((url) => ({ url }));
  return links.length > 0 ? links : getDefaultSocialLinkFields();
};

export const mapClubToGymDetails = (club: AppClub): GymDetails => ({
  id: club.gymId,
  gymName: club.gymName,
  location: club.location,
  contactNumber1: club.contactNumber1,
  contactNumber2: club.contactNumber2,
  email: club.email,
  socialLinks: club.socialLinks,
  gymIdentifier: club.gymIdentifier,
  gymAdminId: club.gymAdminId,
  status: String(club.status),
  photoPath: club.photoPath,
});

export const mapGymDetailsToBusinessProfileForm = (
  gymDetails?: GymDetails | null
): BusinessProfileFormValues => {
  if (!gymDetails) {
    return getDefaultBusinessProfileFormValues();
  }

  return {
    ProfilePicture: null,
    GymName: gymDetails.gymName,
    Phone: gymDetails.contactNumber1 || '',
    Email: gymDetails.email || '',
    Address: gymDetails.location,
    socialLinks: toSocialLinkFieldValues(gymDetails.socialLinks),
  };
};

interface BuildGymUpdateFormDataInput {
  data: BusinessProfileFormValues;
  gymId: number;
  existingPhoto?: string | null;
}

export const buildGymUpdateFormData = ({
  data,
  gymId,
  existingPhoto = null,
}: BuildGymUpdateFormDataInput) => {
  const formData = new FormData();
  const payload: Record<string, string | File> = {
    Id: String(gymId),
    GymName: data.GymName,
    Location: data.Address,
    ContactNumber1: data.Phone,
    Email: data.Email,
    SocialLinks: serializeSocialLinks(data.socialLinks),
  };

  if (data.ProfilePicture instanceof File) {
    payload.ProfilePicture = data.ProfilePicture;
  } else if (existingPhoto) {
    payload.PhotoPath = existingPhoto;
  }

  Object.entries(payload).forEach(([key, value]) => {
    formData.append(key, value);
  });

  return formData;
};
