import React from 'react';
import { User, Mail, Bell, Shield, CreditCard, Moon } from 'lucide-react';
import { useAuth } from '../App';

const Profile: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold font-heading text-gray-900 mb-8">Account Settings</h1>
      
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 border-b border-gray-100">
          <img 
            src={user?.avatar || "https://picsum.photos/200/200"} 
            alt="Profile" 
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
          />
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
              {user?.plan} Plan
            </span>
          </div>
          <button className="sm:ml-auto px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            Edit Profile
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><User size={20} /></div>
              <div>
                <p className="font-medium text-gray-900">Personal Information</p>
                <p className="text-sm text-gray-500">Update your name and personal details</p>
              </div>
            </div>
          </div>
          <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="bg-purple-50 p-2 rounded-lg text-purple-600"><Shield size={20} /></div>
              <div>
                <p className="font-medium text-gray-900">Login & Security</p>
                <p className="text-sm text-gray-500">Change password and security settings</p>
              </div>
            </div>
          </div>
          <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="bg-green-50 p-2 rounded-lg text-green-600"><CreditCard size={20} /></div>
              <div>
                <p className="font-medium text-gray-900">Subscription & Billing</p>
                <p className="text-sm text-gray-500">Manage your Pro plan and payments</p>
              </div>
            </div>
          </div>
          <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
             <div className="flex items-center gap-4">
              <div className="bg-orange-50 p-2 rounded-lg text-orange-600"><Bell size={20} /></div>
              <div>
                <p className="font-medium text-gray-900">Notifications</p>
                <p className="text-sm text-gray-500">Choose what updates you want to receive</p>
              </div>
            </div>
             <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300"/>
                <label htmlFor="toggle" className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer"></label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;