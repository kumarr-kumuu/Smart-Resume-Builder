import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, MoreVertical, FileText, Download, Trash2, Edit } from 'lucide-react';
import { Resume } from '../types';

// Mock data
const mockResumes: Resume[] = [
  {
    id: '1',
    title: 'Software Engineer Resume',
    lastEdited: '2023-10-25',
    templateId: 'temp-1',
    personalInfo: { fullName: '', email: '', phone: '', location: '', summary: '' },
    experience: [],
    education: [],
    skills: []
  },
  {
    id: '2',
    title: 'Product Manager Application',
    lastEdited: '2023-10-20',
    templateId: 'temp-2',
    personalInfo: { fullName: '', email: '', phone: '', location: '', summary: '' },
    experience: [],
    education: [],
    skills: []
  },
];

const Dashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  // In a real app, this would come from a context or API
  const [resumes, setResumes] = useState<Resume[]>(mockResumes);

  const handleDelete = (id: string) => {
    if(window.confirm('Are you sure you want to delete this resume?')) {
      setResumes(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/editor/${id}`);
  };

  const filteredResumes = resumes.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">My Resumes</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and edit your CVs</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search resumes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <button 
            onClick={() => navigate('/templates')}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">New Resume</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Create New Card */}
        <div 
          onClick={() => navigate('/templates')}
          className="group cursor-pointer border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[280px] hover:border-blue-500 hover:bg-blue-50 transition-all"
        >
          <div className="bg-blue-100 text-blue-600 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
            <Plus size={32} />
          </div>
          <h3 className="font-semibold text-gray-800">Create New Resume</h3>
          <p className="text-sm text-gray-500 mt-2 text-center">Start from a professional template</p>
        </div>

        {/* Resume Cards */}
        {filteredResumes.map((resume) => (
          <div key={resume.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col group">
            {/* Thumbnail Placeholder */}
            <div className="h-40 bg-gray-100 relative border-b border-gray-100 flex items-center justify-center overflow-hidden">
               <div className="absolute inset-0 bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                  <button onClick={() => handleEdit(resume.id)} className="bg-white p-2 rounded-lg shadow text-gray-700 hover:text-blue-600" title="Edit">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(resume.id)} className="bg-white p-2 rounded-lg shadow text-gray-700 hover:text-red-600" title="Delete">
                    <Trash2 size={18} />
                  </button>
               </div>
               <FileText size={48} className="text-gray-300" />
            </div>
            
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 truncate" title={resume.title}>{resume.title}</h3>
                <p className="text-xs text-gray-500 mt-1">Last edited: {resume.lastEdited}</p>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                 <button 
                  onClick={() => handleEdit(resume.id)}
                  className="text-sm text-blue-600 font-medium hover:underline"
                 >
                   Open Editor
                 </button>
                 <button className="text-gray-400 hover:text-gray-600">
                   <Download size={18} />
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;