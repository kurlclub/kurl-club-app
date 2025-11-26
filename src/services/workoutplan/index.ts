import { api } from '@/lib/api';
import { ApiResponse } from '@/types';
import type { WorkoutPlan } from '@/types/workoutplan';

// Get all workout plans for a gym
export const getWorkoutPlans = async (gymId: number) => {
  try {
    const response = await api.get<ApiResponse<WorkoutPlan[]>>(
      `/Gym/GetWorkoutPlanByGym/${gymId}`
    );
    return response.data || [];
  } catch (error) {
    console.error('Error fetching workout plans:', error);
    throw error;
  }
};

// Get a specific workout plan by ID
export async function getWorkoutPlan(id: number) {
  try {
    const response = await api.get<ApiResponse<WorkoutPlan>>(
      `/Gym/workoutplan/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching workout plan ${id}:`, error);
    throw error;
  }
}

// Create a new workout plan
export async function createWorkoutPlan(workoutPlan: WorkoutPlan) {
  try {
    const response = await api.post<ApiResponse<WorkoutPlan>>(
      '/Gym/workoutplan',
      workoutPlan
    );
    return response.data;
  } catch (error) {
    console.error('Error creating workout plan:', error);
    throw error;
  }
}

// Update an existing workout plan
export async function updateWorkoutPlan(id: number, workoutPlan: WorkoutPlan) {
  try {
    const response = await api.put<ApiResponse<WorkoutPlan>>(
      `/Gym/workoutplan/${id}`,
      workoutPlan
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating workout plan ${id}:`, error);
    throw error;
  }
}

// Delete a workout plan
export async function deleteWorkoutPlan(id: number) {
  try {
    await api.delete(`/Gym/workoutplan/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting workout plan ${id}:`, error);
    throw error;
  }
}
