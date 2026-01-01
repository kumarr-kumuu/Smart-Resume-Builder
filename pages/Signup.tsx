
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, AlertCircle, Loader2, Zap } from 'lucide-react';
import { signupUser } from '../services/authService';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!formData.name || !formData.email || !formData.password) {
      setError('All fields are required.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      await signupUser(formData);
      setSuccess('Signup successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-black p-6 font-sans selection:bg-brand-red selection:text-white relative overflow-hidden">
      {/* Background Cinematic Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-brand-red/10 blur-[180px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-purple-900/10 blur-[180px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-xl relative z-10 flex flex-col items-center">
        {/* Form Card */}
        <div className="w-full bg-brand-surface/60 backdrop-blur-3xl border border-white/5 p-10 md:p-14 rounded-[3.5rem] shadow-[0_80px_150px_-20px_rgba(0,0,0,0.8)] animate-scale-in">
          <header className="text-center mb-10 flex flex-col items-center">
            <div className="p-4 rounded-[2rem] bg-brand-red text-white shadow-2xl shadow-brand-red/40 mb-6 group hover:scale-110 transition-transform cursor-pointer">
              <Zap size={32} fill="currentColor" />
            </div>
            <h1 className="text-4xl font-black font-heading text-white tracking-tighter uppercase mb-2">SMART RESUME</h1>
            <p className="text-gray-500 font-black text-[10px] uppercase tracking-[0.4em]">New Account Application</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-shake">
                <AlertCircle size={20} className="shrink-0" />
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                <CheckCircle size={20} className="shrink-0" />
                {success}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Full Name</label>
              <input 
                name="name"
                type="text" 
                value={formData.name}
                onChange={handleChange}
                className="w-full px-8 py-5 rounded-2xl bg-brand-black/50 border border-white/5 focus:border-brand-red focus:ring-4 focus:ring-brand-red/10 outline-none transition-all font-bold text-white placeholder:text-gray-700"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Email Address</label>
              <input 
                name="email"
                type="email" 
                value={formData.email}
                onChange={handleChange}
                className="w-full px-8 py-5 rounded-2xl bg-brand-black/50 border border-white/5 focus:border-brand-red focus:ring-4 focus:ring-brand-red/10 outline-none transition-all font-bold text-white placeholder:text-gray-700"
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Password</label>
              <input 
                name="password"
                type="password" 
                value={formData.password}
                onChange={handleChange}
                className="w-full px-8 py-5 rounded-2xl bg-brand-black/50 border border-white/5 focus:border-brand-red focus:ring-4 focus:ring-brand-red/10 outline-none transition-all font-bold text-white placeholder:text-gray-700"
                placeholder="Min. 6 characters"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading || !!success}
              className="w-full bg-brand-red text-white py-6 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-brand-redHover hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-brand-red/40 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={24} className="animate-spin" /> 
                  <span className="animate-pulse tracking-widest text-xs">Processing Entry...</span>
                </>
              ) : (
                <>
                  Apply for Access <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-gray-600 font-bold text-[10px] uppercase tracking-widest">
              Already a member?{' '}
              <Link to="/login" className="text-white hover:text-brand-red transition-colors underline underline-offset-8 decoration-brand-red/30">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Purpose Statement Section */}
        <div className="mt-12 text-center max-w-md mx-auto animate-fade-in px-4">
          <p className="text-gray-500 font-medium text-sm leading-relaxed">
            Build your career with confidence. <br/>
            <span className="text-white font-black">SMART RESUME BUILDER</span> helps you create professional, AI-enhanced resumes that stand out — effortlessly. Start editing with smart suggestions, beautiful templates, and real-time previews that turn your experience into opportunity.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
