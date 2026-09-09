import React, { useEffect, useState } from 'react';
import {
  ArrowLeft, MessageSquare, BookOpen, Paperclip, FileText,
  Clock, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Printer
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { api } from '../services/api';
import { CaseItem, GeneratedDocument, EvidenceItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { CaseCompletenessBar } from '../components/common/CaseCompletenessBar';
import { LoadingState } from '../components/common/LoadingState';

export const CaseDetailsPage: React.FC<{
  caseId: number;
  onBack: () => void;
  onNavigateToChat: (id: number) => void;
  onNavigateToDraft: (id: number) => void;
  onNavigateToAnalysis: (id: number) => void;
}> = ({ caseId, onBack, onNavigateToChat, onNavigateToDraft, onNavigateToAnalysis }) => {
  const { t } = useTranslation();

  const [caseData, setCaseData] = useState<CaseItem | null>(null);
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'facts' | 'evidence' | 'documents' | 'next_steps'>('facts');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [cDetail, cDocs, cEv] = await Promise.all([
          api.getCaseDetail(caseId),
          api.getCaseDocuments(caseId).catch(() => []),
          api.getCaseEvidence(caseId).catch(() => [])
        ]);
        setCaseData(cDetail);
        setDocuments(cDocs);
        setEvidence(cEv);
      } catch (err) {
        console.error('Failed to load case details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [caseId]);

  if (loading || !caseData) {
    return <LoadingState message="Loading case details..." />;
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-gov-navy transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cases</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateToChat(caseId)}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:border-gov-navy text-slate-800 text-xs font-bold rounded-lg transition inline-flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-gov-navy" />
            <span>Continue Intake</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateToAnalysis(caseId)}
            className="px-3.5 py-1.5 bg-gov-navy text-white text-xs font-bold rounded-lg hover:bg-blue-900 transition shadow-xs inline-flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
            <span>Legal Analysis</span>
          </button>
        </div>
      </div>

      {/* Case Overview Card */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-xs font-extrabold uppercase text-gov-navy bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
            {caseData.category}
          </span>
          <StatusBadge status={caseData.status} />
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-slate-900">
          {caseData.title}
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
          {caseData.initial_description}
        </p>

        <div className="mt-4 pt-4 border-t border-slate-100">
          <CaseCompletenessBar score={caseData.completeness_score} />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 text-xs sm:text-sm font-bold" role="tablist">
        <button
          type="button"
          onClick={() => setActiveTab('facts')}
          role="tab"
          aria-selected={activeTab === 'facts'}
          className={`pb-3 px-4 border-b-2 transition ${
            activeTab === 'facts'
              ? 'border-gov-navy text-gov-navy'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Case Facts ({caseData.facts?.length || 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('evidence')}
          role="tab"
          aria-selected={activeTab === 'evidence'}
          className={`pb-3 px-4 border-b-2 transition ${
            activeTab === 'evidence'
              ? 'border-gov-navy text-gov-navy'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Evidence Exhibits ({evidence.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('documents')}
          role="tab"
          aria-selected={activeTab === 'documents'}
          className={`pb-3 px-4 border-b-2 transition ${
            activeTab === 'documents'
              ? 'border-gov-navy text-gov-navy'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Draft Documents ({documents.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('next_steps')}
          role="tab"
          aria-selected={activeTab === 'next_steps'}
          className={`pb-3 px-4 border-b-2 transition ${
            activeTab === 'next_steps'
              ? 'border-gov-navy text-gov-navy'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Citizen Next Steps
        </button>
      </div>

      {/* Tab Content Panels */}
      <div>
        {activeTab === 'facts' && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">
              Extracted Case Particulars
            </h3>

            {caseData.facts && caseData.facts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {caseData.facts.map((f) => (
                  <div key={f.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {f.fact_key.replace(/_/g, ' ')}
                    </span>
                    <span className="font-semibold text-xs sm:text-sm text-slate-800 mt-0.5 block">
                      {f.fact_value}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Source: {f.source === 'nlp' ? 'Automated Fact Extraction' : 'Direct Question Response'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No additional structured facts recorded yet.</p>
            )}
          </div>
        )}

        {activeTab === 'evidence' && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Attached Files & Documents
              </h3>
              <button
                type="button"
                onClick={() => onNavigateToChat(caseId)}
                className="text-xs font-bold text-gov-navy hover:underline"
              >
                + Add More Evidence
              </button>
            </div>

            {evidence.length === 0 ? (
              <p className="text-xs text-slate-500">No evidence attached to this case.</p>
            ) : (
              <div className="space-y-2">
                {evidence.map((ev) => (
                  <div key={ev.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800">{ev.original_filename}</h4>
                      <p className="text-xs text-slate-500">{ev.description} ({ev.file_type})</p>
                    </div>
                    <span className="text-xs font-bold text-slate-400">
                      {Math.round(ev.file_size / 1024)} KB
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Generated Complaint Drafts
              </h3>
              <button
                type="button"
                onClick={() => onNavigateToDraft(caseId)}
                className="text-xs font-bold text-gov-navy hover:underline"
              >
                + Prepare New Draft
              </button>
            </div>

            {documents.length === 0 ? (
              <div className="text-center py-6 text-slate-500">
                <p className="text-xs sm:text-sm">No formal drafts generated for this case yet.</p>
                <button
                  type="button"
                  onClick={() => onNavigateToDraft(caseId)}
                  className="mt-3 px-4 py-2 bg-gov-navy text-white text-xs font-bold rounded-lg hover:bg-blue-900"
                >
                  Generate First Draft
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => onNavigateToDraft(caseId)}
                    className="p-3.5 bg-slate-50 hover:bg-blue-50/50 rounded-lg border border-slate-200 flex items-center justify-between cursor-pointer transition"
                  >
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">{doc.title}</h4>
                      <p className="text-[11px] text-slate-500">Format: {doc.doc_type} | Last edited: {new Date(doc.updated_at).toLocaleDateString()}</p>
                    </div>
                    <span className="text-xs font-bold text-gov-navy">Edit / Print &rarr;</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'next_steps' && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Action Plan for {caseData.category}
            </h3>

            <div className="space-y-2.5 text-xs sm:text-sm text-slate-700">
              <div className="flex items-start gap-2.5 p-3 bg-blue-50/60 rounded-lg border border-blue-100">
                <CheckCircle2 className="w-4 h-4 text-gov-navy flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Preserve All Evidence:</strong> Retain original receipts, device boxes, bank PDF statements, and screenshots.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 bg-blue-50/60 rounded-lg border border-blue-100">
                <CheckCircle2 className="w-4 h-4 text-gov-navy flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Print & Review Draft:</strong> Carefully read through the prepared complaint before presenting it to any police station or consumer forum.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 bg-blue-50/60 rounded-lg border border-blue-100">
                <CheckCircle2 className="w-4 h-4 text-gov-navy flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Verify Current Jurisdictional Rules:</strong> Consult free government legal aid (NALSA Helpline 15100) or an advocate to ensure proper local filing.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
