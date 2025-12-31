
import { User } from '../types';

const API_URL = '/api/auth';

interface AuthResponse {
  user: User;
  token: string;
}

// --- MOCK DATABASE (LocalStorage) for Preview ---
const getMockUsers = () => {
  const users = localStorage.getItem('mock_users_db');
  return users ? JSON.parse(users) : [];
};

const saveMockUser = (user: any) => {
  const users = getMockUsers();
  users.push(user);
  localStorage.setItem('mock_users_db', JSON.stringify(users));
};

const updateMockUser = (userId: string, updates: any) => {
  const users = getMockUsers();
  const index = users.findIndex((u: any) => u.id === userId);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    localStorage.setItem('mock_users_db', JSON.stringify(users));
  }
};

// ------------------------------------------------

export const signupUser = async (userData: any): Promise<AuthResponse> => {
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
        phone: userData.phone || '5550000000', // Default mock phone
        password: userData.password,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=0D8ABC&color=fff`,
        plan: 'Free' as const
      };

      saveMockUser(newUser);
      resolve({ user: newUser, token: 'mock-jwt-token' });
    }, 1000);
  });
};

export const loginUser = async (userData: any): Promise<AuthResponse> => {
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
        user: { ...user, password: undefined },
        token: 'mock-jwt-token' 
      });
    }, 1000);
  });
};

export const sendOTP = async (phone: string): Promise<void> => {
  // In real backend: POST /api/auth/send-otp
  console.log(`Sending OTP to: ${phone}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getMockUsers();
      const user = users.find((u: any) => u.phone === phone);
      if (!user) return reject(new Error('No account found with this mobile number.'));
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      localStorage.setItem(`otp_${phone}`, JSON.stringify({ code: otp, expires: Date.now() + 300000 }));
      alert(`[MOCK OTP] Your verification code is: ${otp}`);
      resolve();
    }, 800);
  });
};

export const verifyOTP = async (phone: string, code: string): Promise<void> => {
  // In real backend: POST /api/auth/verify-otp
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const stored = localStorage.getItem(`otp_${phone}`);
      if (!stored) return reject(new Error('OTP expired or not found.'));
      const { code: savedCode, expires } = JSON.parse(stored);
      if (Date.now() > expires) return reject(new Error('OTP has expired.'));
      if (savedCode !== code) return reject(new Error('Invalid verification code.'));
      resolve();
    }, 800);
  });
};

export const resetPasswordWithOTP = async (phone: string, password: string): Promise<void> => {
  // In real backend: PUT /api/auth/reset-password
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getMockUsers();
      const user = users.find((u: any) => u.phone === phone);
      if (!user) return reject(new Error('Account not found.'));
      
      updateMockUser(user.id, { password });
      localStorage.removeItem(`otp_${phone}`);
      resolve();
    }, 800);
  });
};
