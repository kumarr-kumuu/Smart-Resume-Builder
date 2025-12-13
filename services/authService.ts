import { User } from '../types';

const API_URL = '/api/auth';

interface AuthResponse {
  user: User;
  token: string;
}

// --- MOCK DATABASE (LocalStorage) for Preview ---
// In a real app, remove these mock functions and use the fetch calls below.

const getMockUsers = () => {
  const users = localStorage.getItem('mock_users_db');
  return users ? JSON.parse(users) : [];
};

const saveMockUser = (user: any) => {
  const users = getMockUsers();
  users.push(user);
  localStorage.setItem('mock_users_db', JSON.stringify(users));
};

// ------------------------------------------------

export const signupUser = async (userData: any): Promise<AuthResponse> => {
  // --- REAL BACKEND CALL (Commented out for Preview) ---
  /*
  const response = await fetch(`${API_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Signup failed');
  return data;
  */

  // --- MOCK IMPLEMENTATION ---
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getMockUsers();
      if (users.find((u: any) => u.email === userData.email)) {
        reject(new Error('An account with this email already exists.'));
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        password: userData.password, // In real app, never store plain password
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=0D8ABC&color=fff`,
        plan: 'Free' as const
      };

      saveMockUser(newUser);
      resolve({ user: newUser, token: 'mock-jwt-token' });
    }, 1000); // Simulate network delay
  });
};

export const loginUser = async (userData: any): Promise<AuthResponse> => {
  // --- REAL BACKEND CALL (Commented out for Preview) ---
  /*
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Login failed');
  return data;
  */

  // --- MOCK IMPLEMENTATION ---
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getMockUsers();
      const user = users.find((u: any) => u.email === userData.email);

      if (!user) {
        reject(new Error('You must sign up first — this account doesn’t exist.'));
        return;
      }

      if (user.password !== userData.password) {
        reject(new Error('Incorrect password. Please try again.'));
        return;
      }

      resolve({ 
        user: { ...user, password: undefined }, // Don't return password
        token: 'mock-jwt-token' 
      });
    }, 1000);
  });
};