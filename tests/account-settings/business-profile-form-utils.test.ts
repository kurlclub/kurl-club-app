import { describe, expect, it } from 'vitest';

import {
  buildGymUpdateFormData,
  getDefaultBusinessProfileFormValues,
  mapClubToGymDetails,
  mapGymDetailsToBusinessProfileForm,
  serializeSocialLinks,
} from '@/components/pages/account-settings/tabs/business-profile-tab/form-utils';
import type { AppClub } from '@/types/access';
import type { GymDetails } from '@/types/gym';

const clubFixture: AppClub = {
  gymId: 12,
  gymName: 'Elite Fitness Center',
  location: '123 Main Street',
  contactNumber1: '+15551234567',
  contactNumber2: null,
  email: 'hello@elitefitness.com',
  socialLinks: JSON.stringify([
    { url: 'https://instagram.com/elitefitness' },
    'https://elitefitness.com',
  ]),
  gymAdminId: 45,
  status: 1,
  gymIdentifier: 'KURLE123',
  photoPath: '/uploads/elite.png',
};

const gymDetailsFixture: GymDetails = {
  id: 12,
  gymName: 'Elite Fitness Center',
  location: '123 Main Street',
  contactNumber1: '+15551234567',
  contactNumber2: null,
  email: 'hello@elitefitness.com',
  socialLinks: 'https://instagram.com/elitefitness, https://elitefitness.com',
  gymAdminId: 45,
  status: '1',
  gymIdentifier: 'KURLE123',
  photoPath: '/uploads/elite.png',
};

describe('business profile form utils', () => {
  it('maps club data through gym details into business profile form values', () => {
    expect(
      mapGymDetailsToBusinessProfileForm(mapClubToGymDetails(clubFixture))
    ).toEqual({
      ProfilePicture: null,
      GymName: 'Elite Fitness Center',
      Phone: '+15551234567',
      Email: 'hello@elitefitness.com',
      Address: '123 Main Street',
      socialLinks: [
        { url: 'https://instagram.com/elitefitness' },
        { url: 'https://elitefitness.com' },
      ],
    });
  });

  it('falls back to empty business profile defaults when gym details are missing', () => {
    expect(mapGymDetailsToBusinessProfileForm(null)).toEqual(
      getDefaultBusinessProfileFormValues()
    );
  });

  it('serializes social links from arrays, json strings, and comma-separated strings', () => {
    expect(
      serializeSocialLinks([
        { url: 'https://instagram.com/elitefitness' },
        'https://elitefitness.com',
      ])
    ).toBe('https://instagram.com/elitefitness,https://elitefitness.com');

    expect(serializeSocialLinks(clubFixture.socialLinks)).toBe(
      'https://instagram.com/elitefitness,https://elitefitness.com'
    );

    expect(serializeSocialLinks(gymDetailsFixture.socialLinks)).toBe(
      'https://instagram.com/elitefitness,https://elitefitness.com'
    );
  });

  it('builds gym update form data with serialized links and existing photo fallback', () => {
    const formData = buildGymUpdateFormData({
      gymId: gymDetailsFixture.id,
      existingPhoto: gymDetailsFixture.photoPath,
      data: mapGymDetailsToBusinessProfileForm(gymDetailsFixture),
    });

    expect(formData.get('Id')).toBe('12');
    expect(formData.get('GymName')).toBe('Elite Fitness Center');
    expect(formData.get('Location')).toBe('123 Main Street');
    expect(formData.get('ContactNumber1')).toBe('+15551234567');
    expect(formData.get('Email')).toBe('hello@elitefitness.com');
    expect(formData.get('SocialLinks')).toBe(
      'https://instagram.com/elitefitness,https://elitefitness.com'
    );
    expect(formData.get('PhotoPath')).toBe('/uploads/elite.png');
  });
});
