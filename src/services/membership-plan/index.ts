import { api } from '@/lib/api';
import { ApiResponse } from '@/types';
import { MembershipPlan } from '@/types/membership-plan';

// Get all Membership plans for a gym
export const getMembershipPlans = async (gymId: number) => {
  try {
    const response = await api.get<ApiResponse<MembershipPlan[]>>(
      `/Gym/get-membership-plans-by-gym/${gymId}`
    );
    return response.data || [];
  } catch (error) {
    console.error('Error fetching membership plans:', error);
    throw error;
  }
};

// Get a specific Membership plan by ID
export async function getMembershipPlanById(id: number) {
  try {
    const response = await api.get<ApiResponse<MembershipPlan>>(
      `/Gym/get-membership-plan/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching membership plan ${id}:`, error);
    throw error;
  }
}

// Create a new Membership plan
export async function createMembershipPlan(membershipPlan: MembershipPlan) {
  try {
    const response = await api.post<ApiResponse<MembershipPlan>>(
      '/Gym/create-membership-plan',
      {
        ...membershipPlan,
        billingType: membershipPlan.billingType === 'PerSession' ? 1 : 0,
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating membership plan:', error);
    throw error;
  }
}

// Update an existing Membership plan
export async function updateMembershipPlan(
  id: number,
  membershipPlan: MembershipPlan
) {
  try {
    const response = await api.put<ApiResponse<MembershipPlan>>(
      `/Gym/update-membership-plan/${id}`,
      {
        ...membershipPlan,
        billingType: membershipPlan.billingType === 'PerSession' ? 1 : 0,
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating membership plan ${id}:`, error);
    throw error;
  }
}

// Delete a Membership plan
export async function deleteMembershipPlan(id: number) {
  try {
    await api.delete(`/Gym/delete-membership-plan/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting membership plan ${id}:`, error);
    throw error;
  }
}
