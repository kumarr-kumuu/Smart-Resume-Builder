import React from 'react';
import { Sparkles, X, Check, Loader2 } from 'lucide-react';
import { Suggestion } from '../types';

interface AiSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  suggestions: Suggestion[];
  onApply: (text: string) => void;
}

const AiSuggestionModal: React.FC<AiSuggestionModalProps> = ({ 
  isOpen, onClose, loading, suggestions, onApply 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-yellow-300" />
            <h3 className="font-semibold text-lg">AI Suggestions</h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Gemini is thinking...</p>
              <p className="text-xs text-gray-400 mt-1">Generating professional content</p>
            </div>
          ) : (
            <div className="space-y-4">
              {suggestions.length > 0 ? suggestions.map((sug) => (
                <div key={sug.id} className="border border-gray-100 rounded-xl p-4 hover:border-blue-200 hover:shadow-md transition-all group bg-gray-50 hover:bg-white">
                  <p className="text-gray-700 text-sm leading-relaxed mb-3">{sug.text}</p>
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => onApply(sug.text)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Check size={14} /> Apply
                    </button>
                  </div>
                </div>
              )) : (
                 <p className="text-center text-gray-500">No suggestions found. Try adding more context.</p>
              )}
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 p-3 text-center text-xs text-gray-400 border-t border-gray-100">
          Powered by Google Gemini
        </div>
      </div>
    </div>
  );
};

export default AiSuggestionModal;