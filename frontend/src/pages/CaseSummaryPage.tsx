import React, { useEffect, useState } from 'react';
import { ArrowLeft, Printer, Download, Share2, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { CaseReport } from '../types';
import { LoadingState } from '../components/common/LoadingState';

export const CaseSummaryPage: React.FC<{
  caseId: number;
  onBack: () => void;
}> = ({ caseId, onBack }) => {
  const [report, setReport] = useState<CaseReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await api.getCaseReport(caseId);
        setReport(data);
      } catch (err) {
        console.error('Failed to load case report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [caseId]);

  if (loading || !report) {
    return <LoadingState message="Compiling Case Summary Report..." />;
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6 print:p-0">
      
      {/* Header & Controls */}
      <div className="flex items-center justify-between print:hidden">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-gov-navy transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Case</span>
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gov-navy text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-blue-900 transition shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* Structured Dossier Sheet */}
      <div className="bg-white border-2 border-slate-300 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-gov-navy">
              LawBot AI — Case Preparation Platform
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              OFFICIAL CASE SUMMARY DOSSIER
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Generated: {new Date(report.created_at).toLocaleDateString()} | Reference ID: #{report.case_id}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold uppercase text-slate-400 block">
              Completeness Score
            </span>
            <span className="text-2xl font-black text-gov-navy">
              {report.completeness_score}%
            </span>
          </div>
        </div>

        {/* Narrative & Body */}
        <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-line font-mono">
          {report.summary_text}
        </div>

        {/* Used Facts & Next Steps Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
          <div>
            <h4 className="font-bold text-xs uppercase text-slate-700 mb-2">
              Verified Information Recorded:
            </h4>
            <ul className="text-xs space-y-1 text-slate-600">
              {report.used_facts?.map((f, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase text-slate-700 mb-2">
              Recommended Administrative Next Steps:
            </h4>
            <ol className="text-xs space-y-1 text-slate-600 list-decimal list-inside">
              {report.recommended_steps?.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
        </div>

        {/* Legal Disclaimer & Seal */}
        <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-gov-navy flex-shrink-0" />
          <p>
            This document is a computer-organized factual summary generated from citizen-supplied information. 
            It is prepared to assist in legal review and administrative clarity. Not a substitute for formal judicial orders.
          </p>
        </div>

      </div>

    </div>
  );
};
