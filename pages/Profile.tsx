
import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Camera,
  ChevronLeft,
  ChevronRight,
  Lock,
  Smartphone,
  MapPin,
  ArrowRight,
  KeyRound,
  Hash,
  Search,
  Check,
  Palette,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth, useTheme } from '../App';
import { updateProfile, changePassword } from '../services/userService';
import { sendOTP, verifyOTP, resetPasswordWithOTP } from '../services/authService';

type Toast = { message: string; type: 'success' | 'error' | 'info' } | null;
type SecurityStep = 'form' | 'forgot-phone' | 'forgot-otp' | 'forgot-reset';

// --- Country Data & Types ---
interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
  mask: string;
  length: number;
}

const COUNTRIES: Country[] = [
  { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸', mask: '000-000-0000', length: 10 },
  { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳', mask: '00000-00000', length: 10 },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧', mask: '0000 000000', length: 10 },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦', mask: '000-000-0000', length: 10 },
  { name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺', mask: '000 000 000', length: 9 },
  { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪', mask: '000 0000000', length: 10 },
  { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷', mask: '0 00 00 00 00', length: 9 },
  { name: 'Japan', code: 'JP', dialCode: '+81', flag: '🇯🇵', mask: '00-0000-0000', length: 10 },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', flag: '🇦🇪', mask: '00 000 0000', length: 9 },
  { name: 'Singapore', code: 'SG', dialCode: '+65', flag: '🇸🇬', mask: '0000 0000', length: 8 },
];

// --- Subpage Wrapper Component ---
const SubpageLayout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex items-center gap-4">
        <Link 
          to="/profile" 
          className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-xl text-gray-400 hover:text-indigo-600 transition-all shadow-sm border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
        >
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white font-heading">{title}</h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Profile Settings</p>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm p-8 md:p-12 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

// --- Main Profile Component ---
const Profile: React.FC = () => {
  const { user, login } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  // Security Flow States
  const [securityStep, setSecurityStep] = useState<SecurityStep>('form');
  const [otpPhone, setOtpPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Form States
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    location: 'United States',
    phone: '', // Clean number without dial code
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [notifs, setNotifs] = useState({
    email: true,
    push: false,
    updates: true,
  });

  // Get current country object
  const currentCountry = useMemo(() => {
    return COUNTRIES.find(c => c.name === profileData.location) || COUNTRIES[0];
  }, [profileData.location]);

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({ 
        ...prev, 
        name: user.name, 
        email: user.email,
        phone: user.phone ? user.phone.replace(/^\+\d+\s?/, '') : ''
      }));
    }
  }, [user]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const fullPhone = `${currentCountry.dialCode} ${profileData.phone.replace(/\D/g, '')}`;
      const updatedUser = await updateProfile({ 
        name: profileData.name, 
        email: profileData.email,
        phone: fullPhone
      });
      login(updatedUser);
      showToast('Profile updated successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      showToast('Passwords do not match', 'error');
      return;
    }
    setIsSaving(true);
    try {
      await changePassword(passwordData.current, passwordData.new);
      showToast('Password updated successfully', 'success');
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      showToast(err.message || 'Failed to update password', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpPhone.length < 8) {
      showToast('Enter a valid mobile number', 'error');
      return;
    }
    setIsSaving(true);
    try {
      await sendOTP(otpPhone);
      setSecurityStep('forgot-otp');
      showToast('OTP sent to your verified mobile number', 'info');
    } catch (err: any) {
      showToast(err.message || 'Verification failed', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      showToast('Enter the 6-digit code', 'error');
      return;
    }
    setIsSaving(true);
    try {
      await verifyOTP(otpPhone, otpCode);
      setSecurityStep('forgot-reset');
      showToast('OTP verified successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Invalid OTP', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      showToast('Passwords do not match', 'error');
      return;
    }
    setIsSaving(true);
    try {
      await resetPasswordWithOTP(otpPhone, passwordData.new);
      showToast('Password reset successfully', 'success');
      setSecurityStep('form');
      setPasswordData({ current: '', new: '', confirm: '' });
      setOtpPhone('');
      setOtpCode('');
    } catch (err: any) {
      showToast(err.message || 'Failed to reset password', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto relative min-h-screen">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in-up border ${
          toast.type === 'success' ? 'bg-green-600 border-green-500 text-white' : 
          toast.type === 'error' ? 'bg-red-600 border-red-500 text-white' :
          'bg-indigo-600 border-indigo-500 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : toast.type === 'error' ? <AlertCircle size={18} /> : <Bell size={18} />}
          <span className="font-bold text-sm tracking-wide uppercase">{toast.message}</span>
        </div>
      )}

      <Routes>
        <Route index element={
          <div className="animate-fade-in">
            <header className="mb-12">
              <h1 className="text-4xl font-black text-gray-900 dark:text-white font-heading mb-3">Account Settings</h1>
              <p className="text-gray-500 dark:text-gray-400 max-w-2xl">Manage your identity, security, and preferences for the Smart Resume platform.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MenuCard to="personal-info" icon={UserIcon} title="Personal Info" description="Update your name, email, and contact details." color="indigo" />
              <MenuCard to="security" icon={Shield} title="Security" description="Change password and manage account safety." color="purple" />
              <MenuCard to="notifications" icon={Bell} title="Notifications" description="Set your alerts and communication preferences." color="emerald" />
              <MenuCard to="appearance" icon={Palette} title="Appearance" description="Choose between Light and Dark application themes." color="rose" />
            </div>

            <div className="mt-12 bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="flex items-center gap-6">
                  <div className="relative">
                    <img src={user?.avatar || "https://picsum.photos/100/100"} alt="Profile" className="w-20 h-20 rounded-3xl object-cover ring-4 ring-gray-50 dark:ring-gray-700" />
                    <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-1.5 rounded-xl shadow-lg">
                      <Camera size={14} />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight">{user?.name}</h2>
                    <p className="text-sm text-gray-400 font-medium">{user?.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                      {user?.plan || 'Free'} Member
                    </span>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="text-center px-6 border-r border-gray-100 dark:border-gray-700">
                    <p className="text-2xl font-black text-gray-900 dark:text-white">12</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resumes</p>
                  </div>
                  <div className="text-center px-6">
                    <p className="text-2xl font-black text-gray-900 dark:text-white">85%</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg Score</p>
                  </div>
               </div>
            </div>
          </div>
        } />

        {/* Appearance Subpage */}
        <Route path="appearance" element={
          <SubpageLayout title="Appearance">
            <div className="space-y-12 max-w-2xl">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Interface Theme</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Customize how Smart Resume looks on your device.</p>
                
                <div className="grid grid-cols-2 gap-6">
                  <button 
                    onClick={() => setTheme('light')}
                    className={`flex flex-col items-center gap-4 p-6 rounded-3xl border-2 transition-all group ${theme === 'light' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'}`}
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${theme === 'light' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 group-hover:text-gray-600'}`}>
                      <Sun size={32} />
                    </div>
                    <div className="text-center">
                      <span className={`block font-black uppercase tracking-widest text-xs ${theme === 'light' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>Light Mode</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => setTheme('dark')}
                    className={`flex flex-col items-center gap-4 p-6 rounded-3xl border-2 transition-all group ${theme === 'dark' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'}`}
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 group-hover:text-white'}`}>
                      <Moon size={32} />
                    </div>
                    <div className="text-center">
                      <span className={`block font-black uppercase tracking-widest text-xs ${theme === 'dark' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>Dark Mode</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="p-8 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-indigo-100 dark:bg-indigo-900/40 p-2 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <Shield size={20} />
                  </div>
                  <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-xs">System Sync</h4>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                  The application will remember your choice across all sessions. If you switch to another device, your preference will be stored locally.
                </p>
              </div>
            </div>
          </SubpageLayout>
        } />

        {/* Personal Info Subpage */}
        <Route path="personal-info" element={
          <SubpageLayout title="Personal Information">
            <form onSubmit={handleUpdateProfile} className="space-y-10 max-w-3xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputField 
                  label="Full Name" 
                  icon={UserIcon}
                  value={profileData.name} 
                  onChange={(v) => setProfileData(p => ({ ...p, name: v }))}
                  placeholder="Your Name"
                />
                <InputField 
                  label="Email Address" 
                  icon={Mail}
                  value={profileData.email} 
                  onChange={(v) => setProfileData(p => ({ ...p, email: v }))}
                  placeholder="you@example.com"
                />
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <CountrySelector 
                    label="Location (Country)"
                    value={profileData.location}
                    onChange={(v) => setProfileData(p => ({ ...p, location: v }))}
                  />
                  <PhoneInputField 
                    label="Phone Number"
                    country={currentCountry}
                    value={profileData.phone}
                    onChange={(v) => setProfileData(p => ({ ...p, phone: v }))}
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50 dark:border-gray-700 flex justify-end">
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Apply Changes'}
                </button>
              </div>
            </form>
          </SubpageLayout>
        } />

        {/* Security Subpage */}
        <Route path="security" element={
          <SubpageLayout title="Login & Security">
             {securityStep === 'form' && (
              <form onSubmit={handleChangePassword} className="space-y-10 max-w-xl animate-fade-in">
                <div className="space-y-4">
                  <InputField label="Current Password" type="password" icon={Lock} value={passwordData.current} onChange={(v) => setPasswordData(p => ({ ...p, current: v }))} placeholder="••••••••" />
                  <button type="button" onClick={() => setSecurityStep('forgot-phone')} className="text-sm text-indigo-600 font-bold hover:underline block ml-1">Forgot Password?</button>
                </div>
                <div className="grid grid-cols-1 gap-8">
                  <InputField label="New Password" type="password" icon={Shield} value={passwordData.new} onChange={(v) => setPasswordData(p => ({ ...p, new: v }))} />
                  <InputField label="Confirm New Password" type="password" icon={Shield} value={passwordData.confirm} onChange={(v) => setPasswordData(p => ({ ...p, confirm: v }))} />
                </div>
                <div className="pt-6 border-t border-gray-50 dark:border-gray-700 flex justify-end">
                   <button type="submit" disabled={isSaving || !passwordData.new} className="flex items-center gap-2 bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50">
                     {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Update Password'}
                   </button>
                </div>
              </form>
            )}
          </SubpageLayout>
        } />

        {/* Notifications Subpage */}
        <Route path="notifications" element={
          <SubpageLayout title="Notifications">
            <div className="space-y-6 max-w-3xl">
              <ToggleItem 
                title="Email Notifications" 
                description="Receive expert resume tips and job market trends directly."
                enabled={notifs.email}
                onToggle={() => setNotifs(p => ({ ...p, email: !p.email }))}
              />
              <ToggleItem 
                title="Push Alerts" 
                description="Get notified instantly when your AI analysis is ready."
                enabled={notifs.push}
                onToggle={() => setNotifs(p => ({ ...p, push: !p.push }))}
              />
              <ToggleItem 
                title="Smart Updates" 
                description="Updates on new premium templates and feature launches."
                enabled={notifs.updates}
                onToggle={() => setNotifs(p => ({ ...p, updates: !p.updates }))}
              />
            </div>
          </SubpageLayout>
        } />
      </Routes>
    </div>
  );
};

// --- Helper Components ---

const MenuCard = ({ to, icon: Icon, title, description, color }: { to: string; icon: any; title: string; description: string; color: string }) => {
  const colors: Record<string, string> = {
    indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 border-indigo-100 dark:border-indigo-800',
    purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30 border-purple-100 dark:border-purple-800',
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800',
    rose: 'text-rose-600 bg-rose-50 dark:bg-rose-900/30 border-rose-100 dark:border-rose-800',
  };

  return (
    <Link to={to} className="group bg-white dark:bg-gray-800 rounded-[2rem] p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${colors[color]}`}><Icon size={28} /></div>
      <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 font-heading group-hover:text-indigo-600 transition-colors">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">{description}</p>
      <div className="mt-auto flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">Manage Settings <ArrowRight size={14} /></div>
    </Link>
  );
};

const InputField = ({ label, value, onChange, placeholder, type = "text", icon: Icon }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; icon?: any; }) => (
  <div className="space-y-3">
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{label}</label>
    <div className="relative group">
      {Icon && <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors"><Icon size={20} /></div>}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={`w-full ${Icon ? 'pl-16' : 'px-8'} pr-8 py-4.5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-600 focus:bg-white dark:focus:bg-gray-900 rounded-2xl outline-none transition-all font-bold text-gray-800 dark:text-white placeholder:text-gray-300 shadow-sm`} placeholder={placeholder} />
    </div>
  </div>
);

const CountrySelector = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredCountries = COUNTRIES.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const selectedCountry = COUNTRIES.find(c => c.name === value) || COUNTRIES[0];

  return (
    <div className="space-y-3 relative">
      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{label}</label>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4.5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent hover:border-indigo-200 focus:border-indigo-600 rounded-2xl outline-none transition-all font-bold text-gray-800 dark:text-white shadow-sm"
      >
        <div className="flex items-center gap-3">
          <MapPin size={20} className="text-gray-300" />
          <span className="text-xl mr-1">{selectedCountry.flag}</span>
          <span>{selectedCountry.name}</span>
        </div>
        <ChevronRight size={18} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 w-full mt-2 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-2xl overflow-hidden animate-fade-in-up">
          <div className="p-4 border-b border-gray-50 dark:border-gray-700 flex items-center gap-3">
             <Search size={16} className="text-gray-300" />
             <input autoFocus className="flex-1 bg-transparent outline-none text-sm font-bold text-gray-900 dark:text-white placeholder:text-gray-300" placeholder="Search countries..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="max-h-60 overflow-y-auto no-scrollbar">
            {filteredCountries.map(c => (
              <button key={c.code} type="button" onClick={() => { onChange(c.name); setIsOpen(false); }} className="w-full flex items-center justify-between px-6 py-4 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors group">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{c.flag}</span>
                  <span className={`text-sm font-bold ${value === c.name ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300'}`}>{c.name}</span>
                </div>
                {value === c.name && <Check size={16} className="text-indigo-600" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PhoneInputField = ({ label, value, onChange, country }: { label: string; value: string; onChange: (v: string) => void; country: Country;}) => {
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= country.length) onChange(val);
  };
  return (
    <div className="space-y-3">
      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{label}</label>
      <div className="relative group flex items-center">
        <div className="absolute left-1 top-1 bottom-1 flex items-center gap-2 pl-5 pr-4 bg-gray-100/50 dark:bg-gray-800 rounded-xl border-r border-gray-100 dark:border-gray-700 pointer-events-none">
          <span className="text-xl">{country.flag}</span>
          <span className="text-sm font-black text-gray-400 tracking-tighter">{country.dialCode}</span>
          <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-700 ml-1"></div>
        </div>
        <input type="text" value={value} onChange={handlePhoneChange} className="w-full pl-32 pr-8 py-4.5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-600 focus:bg-white dark:focus:bg-gray-900 rounded-2xl outline-none transition-all font-bold text-gray-800 dark:text-white placeholder:text-gray-300 shadow-sm tracking-[0.1em]" placeholder={country.mask.replace(/0/g, '•')} />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-200"><Smartphone size={18} /></div>
      </div>
    </div>
  );
};

const ToggleItem = ({ title, description, enabled, onToggle }: { title: string; description: string; enabled: boolean; onToggle: () => void; }) => (
  <div className="flex items-center justify-between p-8 bg-gray-50 dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all group">
    <div className="pr-10">
      <h4 className="font-black text-gray-900 dark:text-white mb-1">{title}</h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{description}</p>
    </div>
    <div className="flex flex-col items-end shrink-0 gap-3">
      <button onClick={onToggle} className={`relative inline-flex h-10 w-16 items-center rounded-full transition-all duration-300 focus:outline-none ${enabled ? 'bg-emerald-500 shadow-lg shadow-emerald-100' : 'bg-gray-300 dark:bg-gray-700'}`}>
        <span className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-xl transition-transform duration-300 ease-in-out ${enabled ? 'translate-x-7' : 'translate-x-1'}`} />
      </button>
      <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${enabled ? 'text-emerald-600' : 'text-gray-400'}`}>
        {enabled ? 'Notifications Enabled' : 'Notifications Disabled'}
      </span>
    </div>
  </div>
);

export default Profile;
