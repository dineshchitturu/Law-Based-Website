import React from 'react';
import { FileCheck, Sparkles } from 'lucide-react';

export const FactCard: React.FC<{
  facts: Record<string, string>;
  category: string;
}> = ({ facts, category }) => {
  const factKeys = Object.keys(facts || {});
  if (factKeys.length === 0) return null;

  const formatKey = (k: string) => {
    return k
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs shadow-2xs">
      <div className="flex items-center gap-1.5 text-gov-navy font-bold text-xs uppercase tracking-wider mb-2">
        <Sparkles className="w-3.5 h-3.5 text-gov-saffron" aria-hidden="true" />
        <span>Organized Case Facts ({category})</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {Object.entries(facts).map(([k, v]) => (
          <div key={k} className="bg-white p-2 rounded border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">
              {formatKey(k)}
            </span>
            <span className="font-semibold text-slate-800 line-clamp-2 mt-0.5">
              {String(v)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
