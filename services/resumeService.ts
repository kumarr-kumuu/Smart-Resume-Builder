
import { Resume } from '../types';

const API_URL = '/api/resume';

const getHeaders = () => {
  const user = localStorage.getItem('smart_resume_user');
  const token = user ? JSON.parse(user).token : '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const fetchResumes = async (): Promise<Resume[]> => {
  // In this environment, we fallback to mock if the real API fails or isn't connected
  try {
    const response = await fetch(API_URL, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch resumes');
    return await response.json();
  } catch (error) {
    console.warn("Using mock resumes due to API unavailability:", error);
    const mockData = localStorage.getItem('mock_resumes_db');
    return mockData ? JSON.parse(mockData) : [];
  }
};

export const deleteResume = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete resume');
    }
  } catch (error) {
    // Mock deletion for preview persistence
    const mockData = localStorage.getItem('mock_resumes_db');
    if (mockData) {
      const resumes = JSON.parse(mockData);
      const filtered = resumes.filter((r: any) => r.id !== id && r._id !== id);
      localStorage.setItem('mock_resumes_db', JSON.stringify(filtered));
    }
    throw error;
  }
};
