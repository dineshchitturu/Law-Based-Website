import React from 'react';
import { BookOpen, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { LegalMatch } from '../../types';

export const LegalCard: React.FC<{
  match: LegalMatch;
  onViewDetails: (sectionId: string) => void;
}> = ({ match, onViewDetails }) => {
  const { section, reason_explanation, matched_facts } = match;

  return (
    <div className="bg-white border-2 border-slate-200 hover:border-gov-navy/70 rounded-xl p-4 sm:p-5 shadow-xs transition">
      
      {/* Header: Act & Section */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div>
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 text-gov-navy border border-blue-200">
            <BookOpen className="w-3 h-3" />
            {section.act_short_code} — Section {section.section_number}
          </span>
          <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
            {section.title}
          </h4>
        </div>

        <button
          type="button"
          onClick={() => onViewDetails(section.id)}
          className="text-xs font-bold text-gov-navy hover:text-blue-900 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-blue-100 transition flex-shrink-0"
        >
          <span>View Details</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Why relevant plain English */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 my-3">
        <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
          Why this may be relevant:
        </span>
        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
          {reason_explanation}
        </p>
      </div>

      {/* Matched Facts */}
      {matched_facts && matched_facts.length > 0 && (
        <div className="mt-2.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block mb-1">
            Information matched:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {matched_facts.map((fact, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {fact}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bail / Cognizable Badges */}
      <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-[11px]">
        {section.cognizable && (
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
            {section.cognizable}
          </span>
        )}
        {section.bailable && (
          <span className={`px-2 py-0.5 rounded font-semibold ${
            section.bailable.toLowerCase().includes('non-bailable')
              ? 'bg-amber-100 text-amber-900 border border-amber-300'
              : 'bg-slate-100 text-slate-700'
          }`}>
            {section.bailable}
          </span>
        )}
      </div>

    </div>
  );
};
