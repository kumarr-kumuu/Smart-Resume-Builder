
import React from 'react';
import { ResumeScore } from '../types';
import { AlertCircle, CheckCircle2, TrendingUp, X, EyeOff, PartyPopper } from 'lucide-react';

interface ScoreCardProps {
  score: ResumeScore | null;
  loading: boolean;
  onDismiss?: () => void;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ score, loading, onDismiss }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 h-full flex flex-col items-center justify-center animate-pulse">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Analyzing your resume...</p>
        <p className="text-xs text-gray-400 mt-1">Evaluating against ATS standards</p>
      </div>
    );
  }

  if (!score) return null;

  const isEightyFive = score.overall === 85;

  const getScoreColor = (val: number) => {
    if (val >= 90) return 'text-green-600';
    if (val >= 70) return 'text-blue-600';
    if (val >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Calculate SVG stroke dasharray for donut chart
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score.overall / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 flex items-center justify-between">
        <h3 className="text-white font-semibold flex items-center gap-2 text-sm">
          <TrendingUp size={16} className="text-blue-400" /> 
          AI Quality Score
        </h3>
        <div className="flex items-center gap-2">
          {isEightyFive ? (
            <span className="px-3 py-1 bg-green-100 text-green-800 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-200">
              85% - Excellent
            </span>
          ) : (
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-white/20 text-white`}>
              {score.overall >= 85 ? 'Excellent' : score.overall >= 70 ? 'Good' : 'Needs Work'}
            </span>
          )}
          {onDismiss && (
            <button 
              onClick={onDismiss}
              className="p-1 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Main Score & Graph */}
        <div className="flex items-center gap-6 mb-6">
          <div className="relative w-20 h-20 flex-shrink-0">
             <svg className="w-full h-full transform -rotate-90">
               <circle cx="50%" cy="50%" r={radius} stroke="#f3f4f6" strokeWidth="6" fill="transparent" />
               <circle 
                 cx="50%" cy="50%" r={radius} 
                 stroke="currentColor" 
                 strokeWidth="6" 
                 fill="transparent"
                 strokeDasharray={circumference}
                 strokeDashoffset={offset}
                 strokeLinecap="round"
                 className={`${getScoreColor(score.overall)} transition-all duration-1000 ease-out`}
               />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className={`text-2xl font-black ${getScoreColor(score.overall)}`}>{score.overall}</span>
             </div>
          </div>

          <div className="flex-1 space-y-3">
             <ProgressBar label="ATS Check" value={score.breakdown.ats} color="blue" />
             <ProgressBar label="Clarity" value={score.breakdown.quality} color="purple" />
             <ProgressBar label="Keywords" value={score.breakdown.relevance} color="green" />
          </div>
        </div>

        {/* Success Message for 85% completion */}
        {isEightyFive && (
          <div className="mb-6 bg-green-50 border border-green-100 p-4 rounded-xl flex gap-3 items-start animate-fade-in-up">
            <PartyPopper size={20} className="text-green-600 shrink-0" />
            <p className="text-xs text-green-800 font-bold leading-relaxed">
              🎉 Congratulations! Your resume is 85% optimized and ready to share.
            </p>
          </div>
        )}

        {/* Feedback Section */}
        <div className="space-y-4">
          <h4 className="font-black text-gray-900 uppercase tracking-widest text-[10px] flex items-center gap-2">
            <AlertCircle size={14} className="text-amber-500" />
            Specific Improvements
          </h4>
          <ul className="space-y-2">
            {score.feedback.map((tip, idx) => (
              <li key={idx} className="flex gap-3 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <CheckCircle2 size={14} className="text-indigo-500 flex-shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer Action */}
        <button 
          onClick={onDismiss}
          className="mt-6 w-full py-3 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-all border border-gray-100"
        >
          <EyeOff size={14} /> Hide Review Panel
        </button>
      </div>
    </div>
  );
};

const ProgressBar = ({ label, value, color }: { label: string, value: number, color: string }) => {
  const colorClass = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  }[color] || 'bg-blue-500';

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div 
          className={`h-full rounded-full ${colorClass} transition-all duration-500 shadow-sm`} 
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

export default ScoreCard;
