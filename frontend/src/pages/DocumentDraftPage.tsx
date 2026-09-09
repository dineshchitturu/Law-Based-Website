import React, { useEffect, useState } from 'react';
import {
  FileText, Copy, Printer, Check, Save, ShieldAlert,
  ArrowLeft, RefreshCw, AlertCircle
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { api } from '../services/api';
import { GeneratedDocument } from '../types';
import { LoadingState } from '../components/common/LoadingState';

export const DocumentDraftPage: React.FC<{
  caseId: number;
  onBack: () => void;
}> = ({ caseId, onBack }) => {
  const { t } = useTranslation();

  const [docType, setDocType] = useState<string>('police_complaint');
  const [currentDoc, setCurrentDoc] = useState<GeneratedDocument | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  const draftTypes = [
    { id: 'police_complaint', label: 'Police Complaint Draft (FIR format)' },
    { id: 'cybercrime_report', label: 'Cyber Crime Incident Report' },
    { id: 'consumer_notice', label: 'Consumer Grievance Notice' },
    { id: 'incident_statement', label: 'Factual Incident Statement' },
    { id: 'chronology', label: 'Chronology of Events' },
    { id: 'evidence_list', label: 'Evidence Inventory List' },
  ];

  const loadDraft = async (typeToLoad: string) => {
    setGenerating(true);
    try {
      const doc = await api.generateDraft({ case_id: caseId, doc_type: typeToLoad });
      setCurrentDoc(doc);
      setContent(doc.content_markdown);
    } catch (err) {
      console.error('Failed to generate draft:', err);
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDraft(docType);
  }, [caseId, docType]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = async () => {
    if (!currentDoc) return;
    try {
      await api.updateDocument(currentDoc.id, content);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save draft:', err);
    }
  };

  if (loading) {
    return <LoadingState message="Generating structured complaint draft..." />;
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-5">
      
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-gov-navy transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Case Assessment</span>
        </button>

        <span className="text-xs font-bold text-gov-navy uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
          Editable Legal Draft
        </span>
      </div>

      {/* Title & Intro */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          {t('draft.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          {t('draft.subtitle')}
        </p>
      </div>

      {/* Mandatory Safety Alert */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 text-xs text-amber-950 flex items-start gap-2.5 shadow-2xs">
        <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed font-medium">
          {t('draft.disclaimer')}
        </p>
      </div>

      {/* Draft Type Selector Tabs */}
      <div className="flex flex-wrap gap-2 pt-1" role="tablist" aria-label="Draft type selector">
        {draftTypes.map((dt) => {
          const isSelected = docType === dt.id;
          return (
            <button
              key={dt.id}
              type="button"
              onClick={() => setDocType(dt.id)}
              disabled={generating}
              role="tab"
              aria-selected={isSelected}
              className={`px-3 py-2 rounded-lg text-xs font-bold border transition ${
                isSelected
                  ? 'bg-gov-navy text-white border-gov-navy shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {dt.label}
            </button>
          );
        })}
      </div>

      {/* Action Bar (Copy, Print, Save) */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-100 p-2.5 rounded-lg border border-slate-300">
        <span className="text-xs font-bold text-slate-600 truncate max-w-xs">
          Draft Format: {currentDoc?.title || 'Complaint'}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded-md hover:bg-slate-50 transition shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Copied!' : t('draft.copyBtn')}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded-md hover:bg-slate-50 transition shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('draft.printBtn')}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gov-navy text-white text-xs font-bold rounded-md hover:bg-blue-900 transition shadow-xs"
          >
            {saved ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saved ? 'Saved' : t('draft.saveBtn')}</span>
          </button>
        </div>
      </div>

      {/* Live Editable Draft Text Area */}
      <div className="bg-white border-2 border-slate-300 focus-within:border-gov-navy rounded-xl p-4 shadow-xs">
        <label htmlFor="draft-editor" className="sr-only">Editable draft text</label>
        <textarea
          id="draft-editor"
          rows={20}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={generating}
          className="w-full text-xs sm:text-sm font-mono text-slate-900 focus:outline-none resize-y leading-relaxed bg-transparent"
        />
      </div>

      {/* Submission Advice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs sm:text-sm text-slate-700">
        <h4 className="font-bold text-gov-navy mb-1">
          How to use this draft:
        </h4>
        <ol className="list-decimal list-inside space-y-1 text-slate-700 font-medium">
          <li>Review the facts above to verify accuracy (dates, amounts, item serial numbers).</li>
          <li>Click <strong>Print / Save PDF</strong> or <strong>Copy Draft</strong>.</li>
          <li>Attach printed copies of receipts, screenshots, and evidence.</li>
          <li>Submit to the jurisdictional authority (e.g. Police SHO for FIR, or 1930 for Cyber Crime).</li>
        </ol>
      </div>

    </div>
  );
};
