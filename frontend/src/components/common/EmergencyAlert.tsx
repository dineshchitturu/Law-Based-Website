import React from 'react';
import { AlertOctagon, PhoneCall } from 'lucide-react';

export const EmergencyAlert: React.FC<{ message?: string; onDismiss?: () => void }> = ({
  message = "Your immediate safety comes first. If you or someone else is in immediate physical danger, ongoing violence, or facing life threats, contact emergency services immediately.",
  onDismiss
}) => {
  return (
    <div 
      className="bg-red-50 border-2 border-red-500 rounded-lg p-4 my-3 text-slate-900 shadow-md animate-pulse-once"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <AlertOctagon className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1">
          <h4 className="text-base font-bold text-red-800">
            EMERGENCY SAFETY NOTICE
          </h4>
          <p className="text-sm text-slate-800 mt-1 font-medium">
            {message}
          </p>

          <div className="mt-3 flex flex-wrap gap-2.5">
            <a
              href="tel:112"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-md font-bold text-sm hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <PhoneCall className="w-4 h-4" />
              Call 112 (National Emergency)
            </a>
            <a
              href="tel:100"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white rounded-md font-bold text-sm hover:bg-slate-900 transition focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <PhoneCall className="w-4 h-4" />
              Call 100 (Police)
            </a>
            <a
              href="tel:1930"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 text-white rounded-md font-bold text-sm hover:bg-amber-800 transition focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <PhoneCall className="w-4 h-4" />
              Call 1930 (Cyber Fraud)
            </a>
          </div>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="mt-3 text-xs text-slate-600 hover:text-slate-900 underline block font-medium"
            >
              I am safe now — continue with legal intake
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
