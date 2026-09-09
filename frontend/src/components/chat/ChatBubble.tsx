import React from 'react';
import { Scale, User, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ChatMessage } from '../../types';

export const ChatBubble: React.FC<{
  message: ChatMessage;
}> = ({ message }) => {
  const isAssistant = message.role === 'assistant';
  const isNotice = message.input_type === 'notice' || message.input_type === 'completed';

  if (isNotice) {
    const isSuccess = message.input_type === 'completed';
    return (
      <div className="my-3 mx-auto max-w-xl animate-fade-in" role="note">
        <div className={`rounded-lg p-3.5 border text-sm flex items-start gap-3 shadow-xs ${
          isSuccess 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
            : 'bg-blue-50 border-blue-200 text-slate-800'
        }`}>
          {isSuccess ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          ) : (
            <Scale className="w-5 h-5 text-gov-navy flex-shrink-0 mt-0.5" aria-hidden="true" />
          )}
          <div className="flex-1 font-medium leading-relaxed whitespace-pre-line">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-2.5 my-3.5 max-w-2xl ${isAssistant ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}>
      
      {/* Avatar Icon */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-xs ${
        isAssistant
          ? 'bg-gov-navy text-white'
          : 'bg-slate-700 text-white'
      }`} aria-hidden="true">
        {isAssistant ? <Scale className="w-4 h-4 text-amber-300" /> : <User className="w-4 h-4" />}
      </div>

      {/* Bubble Content */}
      <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed max-w-[85%] sm:max-w-[78%] shadow-xs ${
        isAssistant
          ? 'bg-white border border-slate-200 text-slate-900 font-medium'
          : 'bg-gov-navy text-white font-medium'
      }`}>
        <p className="whitespace-pre-line">
          {message.content}
        </p>
      </div>

    </div>
  );
};
