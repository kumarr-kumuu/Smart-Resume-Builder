
import React, { useState, useRef } from 'react';
import { Upload, Wand2, Download, Trash2, Loader2, Sparkles, Image as ImageIcon, Camera, RotateCcw } from 'lucide-react';
import { editImageWithGemini } from '../services/geminiService';

const ImageLab: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setEditedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalImage || !prompt.trim() || isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Remove data URL prefix for Gemini
      const base64Data = originalImage.split(',')[1];
      const result = await editImageWithGemini(base64Data, prompt);
      setEditedImage(result);
    } catch (err: any) {
      setError(err.message || "Failed to edit image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const clearImages = () => {
    setOriginalImage(null);
    setEditedImage(null);
    setPrompt('');
    setError(null);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-black uppercase tracking-widest mb-4">
          <Sparkles size={14} /> Gemini 2.5 AI Powered
        </div>
        <h1 className="text-4xl font-black font-heading text-gray-900 mb-3">AI Photo Lab</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Transform your casual photos into professional headshots. Just tell Gemini what to change! 
          Try "Add a retro filter", "Change background to office", or "Make it professional B&W".
        </p>
      </div>

      {!originalImage ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-4 border-dashed border-gray-200 rounded-[2.5rem] p-20 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all group"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*" 
          />
          <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Upload size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Upload your photo</h3>
          <p className="text-gray-500 mt-2">Click or drag and drop a high-res image</p>
          <div className="mt-8 flex gap-4">
             <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
               <ImageIcon size={16} /> JPG, PNG
             </div>
             <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
               <Camera size={16} /> 10MB Max
             </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Preview Area */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 relative group">
              <div className="aspect-square relative flex items-center justify-center bg-gray-50">
                <img 
                  src={editedImage || originalImage} 
                  alt="Headshot" 
                  className="w-full h-full object-cover transition-opacity duration-500"
                />
                {isProcessing && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                    <Loader2 size={48} className="text-purple-600 animate-spin mb-4" />
                    <p className="font-bold text-purple-900 animate-pulse">Gemini is working its magic...</p>
                  </div>
                )}
              </div>
              
              <div className="p-4 flex justify-between items-center bg-white border-t border-gray-50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {editedImage ? 'Edited Version' : 'Original Photo'}
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={clearImages}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                  {editedImage && (
                    <a 
                      href={editedImage} 
                      download="professional-headshot.jpg"
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                    >
                      <Download size={20} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {editedImage && (
              <button 
                onClick={() => setEditedImage(null)}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-gray-200 rounded-2xl text-gray-500 font-bold hover:bg-gray-50 transition-all"
              >
                <RotateCcw size={18} /> Revert to Original
              </button>
            )}
          </div>

          {/* Controls Area */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Edit with AI</h2>
              <p className="text-gray-500 text-sm">Describe the changes you want to see. Gemini will handle the professional touch.</p>
            </div>

            <form onSubmit={handleEdit} className="space-y-4">
              <div className="relative">
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Add a retro filter and professional office background..."
                  className="w-full h-32 p-5 bg-gray-50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-3xl outline-none transition-all resize-none font-medium text-gray-700"
                  disabled={isProcessing}
                />
                <Sparkles size={20} className="absolute bottom-4 right-4 text-purple-300" />
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium flex gap-2 items-center">
                  <Wand2 size={16} /> {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={!prompt.trim() || isProcessing}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-4 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-purple-200 hover:shadow-purple-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wand2 size={24} />
                    Magic Edit
                  </>
                )}
              </button>
            </form>

            <div className="pt-6 border-t border-gray-50">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Try these prompts:</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  "Make it a professional black and white photo",
                  "Blur the background",
                  "Replace background with a modern library",
                  "Add a clean studio lighting effect",
                  "Apply a vintage warm filter"
                ].map((sug, i) => (
                  <button 
                    key={i}
                    onClick={() => setPrompt(sug)}
                    className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-purple-50 hover:border-purple-100 hover:text-purple-600 transition-all"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageLab;
