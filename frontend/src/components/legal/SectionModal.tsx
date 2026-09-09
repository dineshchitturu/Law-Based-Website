import React, { useState } from 'react';
import { X, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { LegalSection } from '../../types';

export const SectionModal: React.FC<{
  section: LegalSection | null;
  onClose: () => void;
}> = ({ section, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'statutory' | 'punishment'>('overview');

  if (!section) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-section-title"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-start justify-between bg-slate-50 rounded-t-xl">
          <div>
            <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-gov-navy">
              {section.act_short_code} — Section {section.section_number}
            </span>
            <h3 id="modal-section-title" className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              {section.title}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Category: {section.category} | Last Verified: {section.last_verified || '2024'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-5 pt-2 bg-white text-xs font-bold" role="tablist">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            role="tab"
            aria-selected={activeTab === 'overview'}
            className={`pb-2.5 px-3 border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-gov-navy text-gov-navy'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview (Simple Language)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('statutory')}
            role="tab"
            aria-selected={activeTab === 'statutory'}
            className={`pb-2.5 px-3 border-b-2 transition ${
              activeTab === 'statutory'
                ? 'border-gov-navy text-gov-navy'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Statutory Text
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('punishment')}
            role="tab"
            aria-selected={activeTab === 'punishment'}
            className={`pb-2.5 px-3 border-b-2 transition ${
              activeTab === 'punishment'
                ? 'border-gov-navy text-gov-navy'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Punishment & Bail
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-800">
          {activeTab === 'overview' && (
            <div>
              <h4 className="font-bold text-slate-900 mb-1 text-sm">
                What this means in simple language:
              </h4>
              <p className="leading-relaxed bg-blue-50/60 p-3.5 rounded-lg border border-blue-100 font-medium">
                {section.simple_explanation}
              </p>

              {section.keywords && section.keywords.length > 0 && (
                <div className="mt-4">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Common terms associated:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {section.keywords.map((kw, idx) => (
                      <span key={idx} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'statutory' && (
            <div>
              <h4 className="font-bold text-slate-900 mb-1 text-sm">
                Official Statutory Provision Text:
              </h4>
              <blockquote className="border-l-4 border-gov-navy pl-3 py-1 text-slate-700 bg-slate-50 rounded-r-md italic leading-relaxed text-xs sm:text-sm">
                "{section.description}"
              </blockquote>
            </div>
          )}

          {activeTab === 'punishment' && (
            <div className="space-y-3">
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
                  Prescribed Punishment / Penalty:
                </span>
                <p className="font-medium text-slate-900">
                  {section.punishment || 'Refer to judicial schedule for detailed penalty guidance.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">
                    Bail Classification:
                  </span>
                  <p className="font-bold text-slate-900 mt-1">
                    {section.bailable || 'Under statutory rules'}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">
                    Police Powers (FIR):
                  </span>
                  <p className="font-bold text-slate-900 mt-1">
                    {section.cognizable || 'Under statutory rules'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Legal Source Verification Banner */}
          <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Grounded in verified legislation. Verify current state amendments.</span>
            </div>
            {section.source_url && (
              <a
                href={section.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-gov-navy font-bold hover:underline"
              >
                <span>Official Source</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gov-navy text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-blue-900 transition"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
};
