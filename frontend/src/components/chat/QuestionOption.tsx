import React from 'react';

export const QuestionOption: React.FC<{
  options: string[];
  onSelect: (option: string) => void;
  disabled?: boolean;
}> = ({ options, onSelect, disabled = false }) => {
  if (!options || options.length === 0) return null;

  return (
    <div className="my-3 pl-10 pr-2 animate-fade-in" role="group" aria-label="Available response options">
      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
        Select an answer:
      </span>
      <div className="flex flex-wrap gap-2 sm:gap-2.5">
        {options.map((opt, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(opt)}
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-white border-2 border-slate-300 hover:border-gov-navy hover:bg-blue-50/60 active:bg-blue-100 text-slate-800 text-xs sm:text-sm font-semibold rounded-lg transition shadow-2xs focus:outline-none focus:ring-2 focus:ring-gov-navy focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed text-left"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};
