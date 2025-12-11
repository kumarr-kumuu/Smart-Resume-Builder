import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Template } from '../types';

const templates: Template[] = [
  { id: '1', name: 'Modern Clean', category: 'Professional', image: 'https://picsum.photos/300/400?random=1' },
  { id: '2', name: 'Creative Bold', category: 'Creative', image: 'https://picsum.photos/300/400?random=2' },
  { id: '3', name: 'Executive Suite', category: 'Executive', image: 'https://picsum.photos/300/400?random=3' },
  { id: '4', name: 'Tech Minimal', category: 'Technical', image: 'https://picsum.photos/300/400?random=4' },
  { id: '5', name: 'Academic', category: 'Academic', image: 'https://picsum.photos/300/400?random=5' },
  { id: '6', name: 'Simple Start', category: 'Entry Level', image: 'https://picsum.photos/300/400?random=6' },
];

const Templates: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = React.useState('All');
  const categories = ['All', 'Professional', 'Creative', 'Technical', 'Executive'];

  const filteredTemplates = filter === 'All' 
    ? templates 
    : templates.filter(t => t.category === filter);

  const handleUseTemplate = (templateId: string) => {
    // Generate a new ID and navigate to editor
    const newId = `resume-${Date.now()}`;
    // In a real app, we would create the resume record in DB here
    navigate(`/editor/${newId}?template=${templateId}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold font-heading text-gray-900">Choose a Template</h1>
        <p className="text-gray-500 mt-2">Start with a professional design and customize it.</p>
      </div>

      <div className="flex justify-center mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                ${filter === cat 
                  ? 'bg-gray-900 text-white shadow-lg' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="aspect-[1/1.414] bg-gray-100 relative overflow-hidden">
               <img src={template.image} alt={template.name} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                 <button 
                  onClick={() => handleUseTemplate(template.id)}
                  className="bg-white text-gray-900 px-6 py-3 rounded-xl font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform shadow-lg hover:scale-105"
                 >
                   Use This Template
                 </button>
               </div>
            </div>
            <div className="p-4 bg-white">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">{template.name}</h3>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{template.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Templates;