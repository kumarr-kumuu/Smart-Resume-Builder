
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, FileText, Download, Trash2, Edit, Clock, CheckCircle, Loader2, AlertCircle, Sparkles, Play } from 'lucide-react';
import { Resume } from '../types';
import { fetchResumes, deleteResume } from '../services/resumeService';

type Toast = { message: string, type: 'success' | 'error' } | null;

const Dashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'drafts'>('all');
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    setIsLoading(true);
    try {
      const data = await fetchResumes();
      setResumes(data);
    } catch (err) {
      showToast('Failed to load resumes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this masterpiece? This cannot be undone.')) return;

    setDeletingId(id);
    try {
      await deleteResume(id);
      setResumes(prev => prev.filter(r => (r.id !== id && (r as any)._id !== id)));
      showToast('Masterpiece removed.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Deletion failed.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredResumes = resumes.filter(r => {
    const title = r.title || 'Untitled';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' 
      || (activeTab === 'published' && r.status === 'final')
      || (activeTab === 'drafts' && r.status === 'draft');
    return matchesSearch && matchesTab;
  });

  return (
    <div className="p-8 md:p-12 animate-fade-in relative transition-colors duration-500">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-fade-in-up border ${
          toast.type === 'success' ? 'bg-brand-red border-red-500 text-white' : 'bg-red-950 border-red-800 text-red-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-black text-xs uppercase tracking-widest">{toast.message}</span>
        </div>
      )}

      {/* Header Section */}
      <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-5xl md:text-6xl font-black font-heading tracking-tighter mb-4 text-white uppercase">My Resumes</h1>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-[0.2em]">Manage your professional masterpieces</p>
        </div>
        
        <div className="relative group w-full md:w-96">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-red transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search catalog..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-6 py-5 bg-brand-surface border border-white/5 rounded-3xl focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red outline-none transition-all shadow-2xl text-sm font-bold placeholder:text-gray-700 text-white"
          />
        </div>
      </header>

      {/* Tabs Switcher */}
      <div className="flex bg-brand-surface p-1 rounded-2xl border border-white/5 mb-12 w-fit">
        {(['all', 'published', 'drafts'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab ? 'bg-brand-red text-white shadow-lg' : 'text-gray-500 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {/* Create Card */}
        <div 
          onClick={() => navigate('/templates')}
          className="aspect-[4/5] bg-brand-surface border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer group hover:border-brand-red/50 hover:bg-brand-red/5 transition-all relative overflow-hidden"
        >
          <div className="p-8 rounded-full bg-white/5 text-gray-500 group-hover:bg-brand-red group-hover:text-white transition-all shadow-2xl">
            <Plus size={48} strokeWidth={3} />
          </div>
          <span className="mt-8 font-black text-xs uppercase tracking-widest text-gray-400 group-hover:text-white">Start New Entry</span>
          
          <Sparkles size={20} className="absolute top-8 right-8 text-brand-red/20 group-hover:text-brand-red transition-colors" />
        </div>

        {/* Resume Cards */}
        {isLoading ? (
          [1,2,3,4].map(i => (
            <div key={i} className="aspect-[4/5] bg-brand-surface rounded-[2.5rem] animate-pulse border border-white/5"></div>
          ))
        ) : filteredResumes.map((resume) => {
          const rId = (resume as any)._id || resume.id;
          const isDeleting = deletingId === rId;

          return (
            <div key={rId} className="aspect-[4/5] bg-brand-surface rounded-[2.5rem] border border-white/5 group relative overflow-hidden shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:border-white/20 red-glow">
              <div className="h-[75%] bg-gradient-to-b from-transparent to-brand-black/80 relative flex items-center justify-center">
                 <FileText size={80} className="text-white/5 group-hover:text-brand-red/20 transition-all duration-700" />
                 
                 {/* Requested Draft Badge Styling */}
                 <div className="absolute top-8 left-8">
                    {resume.status === 'draft' ? (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
                        Draft
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-brand-red/10 text-brand-red border border-brand-red/20 text-[10px] font-black uppercase tracking-widest rounded-lg backdrop-blur-md">
                        Published
                      </span>
                    )}
                 </div>

                 {/* Play/Edit Overlay */}
                 <div className="absolute inset-0 bg-brand-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-8 backdrop-blur-[2px]">
                    <button 
                      onClick={() => navigate(`/editor/${rId}`)}
                      className="w-16 h-16 rounded-full bg-brand-red text-white flex items-center justify-center shadow-2xl shadow-brand-red/50 hover:scale-110 active:scale-95 transition-all mb-4"
                    >
                      <Play fill="white" size={28} className="ml-1" />
                    </button>
                    <span className="font-black text-[10px] uppercase tracking-widest text-white">
                      {resume.status === 'draft' ? 'Continue Editing' : 'View Masterpiece'}
                    </span>
                 </div>
              </div>

              {/* Info Area */}
              <div className="p-8 flex flex-col justify-end">
                <div className="flex justify-between items-start mb-2">
                   <h3 className="font-black text-xl text-white truncate uppercase tracking-tighter w-4/5">{resume.title || 'Untitled'}</h3>
                   <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(rId); }}
                    className="p-2 text-gray-600 hover:text-brand-red transition-colors"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <Clock size={12} />
                  <span>Edited {new Date(resume.lastEdited).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
                <div className="h-full bg-brand-red shadow-[0_0_10px_#e50914]" style={{ width: resume.status === 'final' ? '100%' : '45%' }}></div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredResumes.length === 0 && !isLoading && (
        <div className="mt-20 text-center py-20 border-2 border-dashed border-white/5 rounded-[3rem]">
          <p className="text-gray-600 font-black uppercase tracking-widest text-sm">No entries found in this category.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
