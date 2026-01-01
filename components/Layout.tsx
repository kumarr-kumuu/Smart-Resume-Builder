
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  User, 
  LogOut, 
  Menu, 
  X, 
  PlusCircle,
  Moon,
  Sun,
  Sparkles,
  Zap
} from 'lucide-react';
import { useAuth, useTheme } from '../App';
import ChatBot from './ChatBot';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'MY RESUMES', path: '/dashboard', icon: LayoutDashboard },
    { label: 'TEMPLATES', path: '/templates', icon: FileText },
    { label: 'Settings', path: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-brand-black flex flex-col md:flex-row transition-all duration-700 selection:bg-brand-red selection:text-white">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-brand-surface border-b border-white/5 p-4 flex justify-between items-center sticky top-0 z-[100] glass">
        <div className="flex items-center gap-3">
           <div className="bg-brand-red text-white p-2 rounded-lg shadow-lg shadow-brand-red/20">
              <Zap size={20} fill="currentColor" />
            </div>
            <span className="font-heading font-black text-sm uppercase tracking-tighter">SMART RESUME BUILDER</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-white">
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-[110] w-72 bg-brand-black border-r border-white/5 transform transition-transform duration-500 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 h-full flex flex-col">
          <div className="hidden md:flex items-center gap-4 mb-16">
            <div className="bg-brand-red text-white p-3 rounded-2xl shadow-2xl shadow-brand-red/40 animate-pulse-slow">
              <Zap size={24} fill="currentColor" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-black text-lg uppercase leading-none tracking-tighter">SMART RESUME</span>
              <span className="font-heading font-light text-xs uppercase tracking-widest text-brand-red">BUILDER</span>
            </div>
          </div>

          <div className="mb-10">
            <Link 
              to="/templates" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="group flex items-center justify-center gap-3 w-full bg-gradient-to-r from-brand-red to-pink-700 text-white py-4 px-6 rounded-2xl shadow-xl hover:shadow-brand-red/30 hover:scale-105 active:scale-95 transition-all font-black uppercase tracking-widest text-[10px]"
            >
              <PlusCircle size={18} />
              <span>Create New</span>
            </Link>
          </div>

          <nav className="space-y-3 flex-1">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-4 px-6 py-4 rounded-2xl transition-all relative overflow-hidden group
                    ${isActive 
                      ? 'bg-brand-surface text-white border border-white/10' 
                      : 'text-gray-500 hover:text-white hover:bg-white/5'}
                  `}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-red shadow-[0_0_15px_rgba(229,9,20,1)]"></div>}
                  <Icon size={20} className={`${isActive ? 'text-brand-red' : 'group-hover:text-brand-red'} transition-colors duration-300`} />
                  <span className={`text-xs uppercase tracking-widest font-bold ${isActive ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-8 border-t border-white/5 space-y-4">
            <div className="flex items-center gap-4 px-4 py-4 bg-white/5 rounded-[2rem] border border-white/5 group transition-all hover:bg-white/10 cursor-pointer">
              <div className="relative">
                <img 
                  src={user?.avatar || "https://picsum.photos/100/100"} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-brand-red/20 group-hover:ring-brand-red transition-all"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-white truncate uppercase tracking-widest">{user?.name}</p>
                <p className="text-[8px] font-bold text-gray-500 truncate uppercase tracking-tighter">{user?.email}</p>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 px-6 py-4 text-gray-500 hover:text-brand-red transition-all text-xs font-black uppercase tracking-widest"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto h-[calc(100vh-64px)] md:h-screen relative no-print bg-brand-black">
        <div className="max-w-7xl mx-auto min-h-full">
          {children}
        </div>
        <ChatBot />
      </main>
    </div>
  );
};

export default Layout;
