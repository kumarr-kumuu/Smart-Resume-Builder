
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, FileText, Download, Trash2, Edit, Clock, CheckCircle, Loader2, AlertCircle, XCircle } from 'lucide-react';
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
    if (!window.confirm('Are you sure you want to permanently delete this resume? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteResume(id);
      setResumes(prev => prev.filter(r => (r.id !== id && (r as any)._id !== id)));
      showToast('Resume deleted successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete resume', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredResumes = resumes.filter(r => {
    const title = r.title || 'Untitled Resume';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' 
      || (activeTab === 'published' && r.status === 'final')
      || (activeTab === 'drafts' && r.status === 'draft');
    return matchesSearch && matchesTab;
  });

  const publishedCount = resumes.filter(r => r.status === 'final').length;
  const draftCount = resumes.filter(r => r.status === 'draft').length;

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in-up border ${
          toast.type === 'success' ? 'bg-green-600 border-green-500 text-white' : 'bg-red-600 border-red-500 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="font-bold text-sm tracking-wide uppercase">{toast.message}</span>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-10">
        <div 
          onClick={() => navigate('/templates')}
          className="group cursor-pointer p-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl shadow-xl hover:shadow-blue-200 transition-all flex items-center justify-between text-white max-w-2xl"
        >
          <div>
            <h2 className="text-2xl font-bold mb-2 font-heading">Create New Resume</h2>
            <p className="text-blue-100">Pick a professional template and land your dream job.</p>
          </div>
          <Plus size={40} className="opacity-50 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Stats & Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-6">
        <div className="flex p-1 bg-white border border-gray-100 rounded-2xl shadow-sm w-full lg:w-auto overflow-x-auto scrollbar-hide">
          <TabButton 
            active={activeTab === 'all'} 
            onClick={() => setActiveTab('all')} 
            label="All" 
            count={resumes.length} 
          />
          <TabButton 
            active={activeTab === 'published'} 
            onClick={() => setActiveTab('published')} 
            label="Published" 
            count={publishedCount} 
          />
          <TabButton 
            active={activeTab === 'drafts'} 
            onClick={() => setActiveTab('drafts')} 
            label="Drafts" 
            count={draftCount} 
          />
        </div>

        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search resumes..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm font-medium"
          />
        </div>
      </div>

      {/* Resume Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-3xl h-72 animate-pulse border border-gray-100"></div>
          ))}
        </div>
      ) : filteredResumes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredResumes.map((resume) => {
            const resumeId = (resume as any)._id || resume.id;
            const isDeleting = deletingId === resumeId;

            return (
              <div key={resumeId} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group relative">
                {/* Status Badge */}
                <div className="absolute top-4 left-4 z-10">
                  {resume.status === 'draft' ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider rounded-full border border-amber-100">
                      <Clock size={12} /> Draft
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-wider rounded-full border border-green-100">
                      <CheckCircle size={12} /> Final
                    </span>
                  )}
                </div>

                {/* Action Menu (Floating) */}
                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(resumeId); }} 
                    disabled={isDeleting}
                    className={`p-2 bg-white/90 backdrop-blur shadow-sm rounded-xl transition-colors ${isDeleting ? 'text-gray-300' : 'text-gray-400 hover:text-red-500'}`}
                    title="Delete Resume"
                  >
                    {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </div>

                {/* Thumbnail Area */}
                <div className="h-44 bg-gray-50 relative border-b border-gray-50 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 to-transparent group-hover:from-gray-900/20 transition-all"></div>
                  <FileText size={64} className="text-gray-200 group-hover:text-blue-200 transition-colors" />
                  
                  <div className="absolute inset-x-0 bottom-4 flex justify-center translate-y-12 group-hover:translate-y-0 transition-transform duration-300">
                     <button 
                      onClick={() => navigate(`/editor/${resumeId}`)}
                      className="bg-white text-gray-900 px-5 py-2.5 rounded-xl font-bold shadow-lg text-sm flex items-center gap-2 hover:bg-gray-50 active:scale-95"
                     >
                       <Edit size={14} /> {resume.status === 'draft' ? 'Continue' : 'Edit'}
                     </button>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 truncate mb-1" title={resume.title}>
                    {resume.title || 'Untitled Resume'}
                  </h3>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mb-6">
                    <Clock size={12} /> {new Date(resume.lastEdited).toLocaleDateString()}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                     <button 
                      onClick={() => navigate(`/editor/${resumeId}`)}
                      className={`text-xs font-bold uppercase tracking-wider transition-colors ${resume.status === 'draft' ? 'text-amber-600 hover:text-amber-700' : 'text-blue-600 hover:text-blue-700'}`}
                     >
                       Open Editor
                     </button>
                     <button className="text-gray-300 hover:text-gray-900 transition-colors">
                       <Download size={18} />
                     </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
             <FileText size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 font-heading">No resumes yet</h3>
          <p className="text-gray-500 mt-1">Start by picking a professional template.</p>
          <button 
            onClick={() => navigate('/templates')}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            <Plus size={18} /> New Resume
          </button>
        </div>
      )}
    </div>
  );
};

// --- Sub-components ---

const TabButton = ({ active, onClick, label, count }: { active: boolean, onClick: () => void, label: string, count: number }) => (
  <button 
    onClick={onClick}
    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
      active ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
    }`}
  >
    {label}
    <span className={`px-2 py-0.5 rounded-lg text-[10px] ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
      {count}
    </span>
  </button>
);

export default Dashboard;
