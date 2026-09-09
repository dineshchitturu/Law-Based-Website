import React from 'react';
import { useTextSize, TextSize } from '../../hooks/useTextSize';

export const TextSizeControl: React.FC = () => {
  const { textSize, setTextSize } = useTextSize();

  const options: { size: TextSize; label: string; title: string }[] = [
    { size: 'small', label: 'A-', title: 'Small text' },
    { size: 'normal', label: 'A', title: 'Normal text (Default)' },
    { size: 'large', label: 'A+', title: 'Large text' }
  ];

  return (
    <div className="inline-flex items-center border border-slate-300 rounded-md bg-white p-0.5 shadow-sm" role="group" aria-label="Text size control">
      <span className="sr-only">Adjust text size:</span>
      {options.map((opt) => (
        <button
          key={opt.size}
          type="button"
          onClick={() => setTextSize(opt.size)}
          title={opt.title}
          aria-pressed={textSize === opt.size}
          className={`px-2.5 py-1 text-xs font-bold rounded transition min-w-[32px] ${
            textSize === opt.size
              ? 'bg-gov-navy text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};
