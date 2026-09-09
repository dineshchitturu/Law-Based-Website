import React, { useEffect, useState } from 'react';
import {
  ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight,
  BookOpen, FileText, Download, Save, ExternalLink
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { api } from '../services/api';
import { LegalAnalysisResponse, LegalSection } from '../types';
import { LegalCard } from '../components/legal/LegalCard';
import { SectionModal } from '../components/legal/SectionModal';
import { LoadingState } from '../components/common/LoadingState';
import { CaseCompletenessBar } from '../components/common/CaseCompletenessBar';

export const LegalResultPage: React.FC<{
  caseId: number;
  onNavigateToDraft: () => void;
  onNavigateToSummary: () => void;
  onSaveCase: () => void;
}> = ({ caseId, onNavigateToDraft, onNavigateToSummary, onSaveCase }) => {
  const { t } = useTranslation();

  const [analysis, setAnalysis] = useState<LegalAnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSection, setSelectedSection] = useState<LegalSection | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const res = await api.analyzeCase(caseId);
        setAnalysis(res);
      } catch (err) {
        console.error('Failed to get legal analysis:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [caseId]);

  const handleViewSection = async (sectionId: string) => {
    try {
      const sec = await api.getSectionDetail(sectionId);
      setSelectedSection(sec);
    } catch (err) {
      console.error('Failed to fetch section details:', err);
    }
  };

  const handleSave = async () => {
    try {
      await api.updateCase(caseId, { status: 'ready_for_review' });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onSaveCase();
      }, 1200);
    } catch (err) {
      console.error('Failed to save case:', err);
    }
  };

  if (loading || !analysis) {
    return <LoadingState message="Cross-referencing verified legal provisions..." />;
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      
      {/* Section Detail Modal */}
      <SectionModal section={selectedSection} onClose={() => setSelectedSection(null)} />

      {/* Official Header */}
      <div className="bg-white border-b-2 border-slate-200 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gov-navy bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
            Case Assessment Dossier
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-600 mr-1.5"></span>
            {analysis.status}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          {t('result.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Case Category: <strong className="text-slate-900">{analysis.case_category}</strong> | Grounded in authentic Indian statutory knowledge.
        </p>
      </div>

      {/* Completeness Meter */}
      <CaseCompletenessBar score={analysis.completeness_score} />

      {/* Possible Relevant Legal Areas */}
      {analysis.possible_legal_areas && analysis.possible_legal_areas.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">
            {t('result.possibleAreas')}:
          </span>
          <div className="flex flex-wrap gap-2">
            {analysis.possible_legal_areas.map((area, idx) => (
              <span key={idx} className="px-3 py-1 rounded-md bg-blue-50 text-gov-navy font-bold text-xs border border-blue-200">
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Possible Relevant Provisions Cards */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-gov-navy" />
          <span>{t('result.possibleProvisions')} ({analysis.possible_provisions.length})</span>
        </h3>

        <div className="space-y-3.5">
          {analysis.possible_provisions.map((m) => (
            <LegalCard key={m.id} match={m} onViewDetails={handleViewSection} />
          ))}
        </div>
      </div>

      {/* Information We Used vs Information Still Needed (Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Information Used */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-2 text-emerald-800 font-bold text-xs uppercase tracking-wide">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{t('result.infoUsed')}</span>
          </div>
          <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
            {analysis.information_used.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Information Still Needed */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-2 text-amber-800 font-bold text-xs uppercase tracking-wide">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>{t('result.infoNeeded')}</span>
          </div>
          <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
            {analysis.information_still_needed.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">⚠</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Recommended Next Steps */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gov-navy mb-3">
          {t('result.nextSteps')}:
        </h3>
        <ol className="space-y-2.5 text-xs sm:text-sm text-slate-800 font-medium">
          {analysis.recommended_next_steps.map((step, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-gov-navy text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Legal Safety Disclaimer */}
      <div className="bg-slate-100 p-3.5 rounded-lg border border-slate-300 text-xs text-slate-600 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-gov-navy flex-shrink-0 mt-0.5" />
        <p>
          <strong>Informational Guidance Only:</strong> {analysis.disclaimer}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onNavigateToSummary}
          className="px-4 py-2.5 bg-white border-2 border-slate-300 text-slate-800 text-xs sm:text-sm font-bold rounded-lg hover:bg-slate-50 transition"
        >
          {t('result.summaryBtn')}
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2.5 bg-slate-100 border border-slate-300 text-slate-800 text-xs sm:text-sm font-bold rounded-lg hover:bg-slate-200 transition inline-flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{savedSuccess ? 'Saved!' : t('result.saveCaseBtn')}</span>
          </button>

          <button
            type="button"
            onClick={onNavigateToDraft}
            className="px-6 py-2.5 bg-gov-navy text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-blue-900 transition shadow-sm inline-flex items-center gap-1.5"
          >
            <span>{t('result.draftBtn')}</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </button>
        </div>
      </div>

    </div>
  );
};
