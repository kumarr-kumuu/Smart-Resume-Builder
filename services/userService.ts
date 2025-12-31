
import { User } from '../types';

const API_URL = '/api/users';

const getHeaders = () => {
  const user = localStorage.getItem('smart_resume_user');
  const token = user ? JSON.parse(user).token : '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const updateProfile = async (userData: Partial<User>): Promise<User> => {
  try {
    const response = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return await response.json();
  } catch (error) {
    // Mock update for preview
    const stored = localStorage.getItem('smart_resume_user');
    const user = stored ? JSON.parse(stored) : null;
    const updated = { ...user, ...userData };
    localStorage.setItem('smart_resume_user', JSON.stringify(updated));
    return updated;
  }
};

export const changePassword = async (current: string, next: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/password`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ current, next })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Failed to change password');
    }
  } catch (error) {
    // Mock success for preview
    console.log("Password change requested in mock mode");
  }
};
