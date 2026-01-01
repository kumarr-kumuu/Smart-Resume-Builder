
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, GripVertical, Minus } from 'lucide-react';
import { getChatResponseStream } from '../services/geminiService';
import { ChatMessage } from '../types';

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFABVisible, setIsFABVisible] = useState(true);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hi! I am your Smart Resume Builder assistant. I can help you find templates, save drafts, or use our AI features. How can I assist you today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Draggable State
  const [position, setPosition] = useState({ x: 0, y: 0 }); // Offset from bottom-right
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const fabRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Drag Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isOpen) return; // Disable drag when chat is open for better UX
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    dragOffset.current = { x: position.x, y: position.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;
    
    // Constraints (keep within viewport)
    const newX = dragOffset.current.x - deltaX;
    const newY = dragOffset.current.y - deltaY;
    
    // We limit the movement so it doesn't go off screen
    // Approx bounds based on common screen sizes
    const boundedX = Math.max(-window.innerWidth + 100, Math.min(20, newX));
    const boundedY = Math.max(-window.innerHeight + 100, Math.min(20, newY));

    setPosition({ x: boundedX, y: boundedY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    
    // If movement was minimal, treat as a click
    const deltaX = Math.abs(e.clientX - dragStartPos.current.x);
    const deltaY = Math.abs(e.clientY - dragStartPos.current.y);
    if (deltaX < 5 && deltaY < 5) {
      setIsOpen(!isOpen);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const stream = await getChatResponseStream(messages.map(m => ({ role: m.role, text: m.text })), input);
      
      let botResponseText = '';
      const botMsgId = (Date.now() + 1).toString();
      
      setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '', isStreaming: true }]);

      for await (const chunk of stream) {
        const chunkText = chunk.text || ''; 
        botResponseText += chunkText;
        
        setMessages(prev => prev.map(m => 
          m.id === botMsgId ? { ...m, text: botResponseText } : m
        ));
      }
      
      setMessages(prev => prev.map(m => 
        m.id === botMsgId ? { ...m, isStreaming: false } : m
      ));

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Sorry, I encountered an error connecting to Gemini." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // If FAB is hidden, show a tiny restore button
  if (!isFABVisible) {
    return (
      <button
        onClick={() => setIsFABVisible(true)}
        className="fixed bottom-4 right-4 z-[200] p-3 bg-brand-surface/80 border border-white/10 text-brand-red rounded-full shadow-lg backdrop-blur-md hover:scale-110 transition-all opacity-40 hover:opacity-100"
        title="Show Assistant"
      >
        <Bot size={18} />
      </button>
    );
  }

  return (
    <div 
      ref={fabRef}
      className="fixed z-[200] flex flex-col items-end print:hidden transition-shadow"
      style={{ 
        bottom: '24px', 
        right: '24px',
        transform: `translate(${position.x}px, ${position.y}px)`,
        touchAction: 'none'
      }}
    >
      {isOpen && (
        <div className="bg-white rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.4)] border border-gray-100 w-80 sm:w-96 h-[500px] mb-4 flex flex-col overflow-hidden animate-scale-in origin-bottom-right">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-brand-black p-5 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-red rounded-xl">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xs uppercase tracking-widest">Smart Assistant</h3>
                <p className="text-[8px] text-gray-500 uppercase font-black">Powered by Gemini</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 rounded-full p-2 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/50 no-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`
                  max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm
                  ${msg.role === 'user' 
                    ? 'bg-brand-red text-white rounded-tr-none font-medium' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none font-medium'}
                `}>
                  {msg.text}
                  {msg.isStreaming && <span className="inline-block w-1 h-4 ml-1 bg-brand-red animate-pulse align-middle"></span>}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100 flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="How can I help with your resume?"
              className="flex-1 border border-gray-100 bg-gray-50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-brand-red focus:ring-4 focus:ring-brand-red/5 transition-all text-gray-800 font-medium"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-brand-red text-white p-3 rounded-2xl hover:bg-brand-redHover disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-red/20"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </div>
      )}

      {/* Draggable FAB */}
      <div className="relative group">
        {!isOpen && (
          <button 
            onClick={(e) => { e.stopPropagation(); setIsFABVisible(false); }}
            className="absolute -top-2 -right-2 bg-gray-900 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg border border-white/10"
            title="Hide Assistant"
          >
            <X size={10} />
          </button>
        )}
        
        <button
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className={`
            bg-white text-gray-900 p-4 rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.2)] 
            hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all transform 
            ${isDragging ? 'scale-110 rotate-3 cursor-grabbing shadow-2xl' : 'hover:scale-105 cursor-grab'}
            ${isOpen ? 'bg-brand-red text-white' : ''}
            flex items-center justify-center relative
          `}
        >
          {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
          {!isOpen && !isDragging && (
             <div className="absolute -left-10 bg-gray-900 text-white text-[8px] font-black uppercase tracking-widest py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-white/10">
               Drag Me
             </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
