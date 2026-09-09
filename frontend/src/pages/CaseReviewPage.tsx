import React, { useEffect, useState } from 'react';
import { ArrowRight, Edit3, Check, Sparkles, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { api } from '../services/api';
import { CaseItem, CaseFact } from '../types';
import { CaseCompletenessBar } from '../components/common/CaseCompletenessBar';
import { LoadingState } from '../components/common/LoadingState';

export const CaseReviewPage: React.FC<{
  caseId: number;
  onProceedToAnalysis: () => void;
  onEditFact: () => void;
}> = ({ caseId, onProceedToAnalysis, onEditFact }) => {
  const { t } = useTranslation();

  const [caseData, setCaseData] = useState<CaseItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [analyzing, setAnalyzing] = useState<boolean>(false);

  // Inline editing state
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const fetchDetails = async () => {
    try {
      const data = await api.getCaseDetail(caseId);
      setCaseData(data);
    } catch (err) {
      console.error('Failed to load case for review:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [caseId]);

  const handleStartEdit = (field: string, currentVal: string) => {
    setEditingField(field);
    setTempValue(currentVal || '');
  };

  const handleSaveEdit = async (field: string) => {
    if (!caseData) return;
    try {
      const payload: Partial<CaseItem> = {};
      if (field === 'initial_description') payload.initial_description = tempValue;
      if (field === 'incident_date') payload.incident_date = tempValue;
      if (field === 'incident_location') payload.incident_location = tempValue;
      if (field === 'suspect_info') payload.suspect_info = tempValue;
      if (field === 'loss_damage') payload.loss_damage = tempValue;

      const updated = await api.updateCase(caseData.id, payload);
      setCaseData({ ...caseData, ...updated });
      setEditingField(null);
    } catch (err) {
      console.error('Failed to update field:', err);
    }
  };

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    try {
      await api.analyzeCase(caseId);
      onProceedToAnalysis();
    } catch (err) {
      console.error('Failed to run legal analysis:', err);
      onProceedToAnalysis(); // fallback navigation
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading || !caseData) {
    return <LoadingState message="Preparing case review details..." />;
  }

  const sections = [
    {
      id: 'initial_description',
      label: t('review.whatHappened'),
      value: caseData.initial_description || 'Not provided',
      isLong: true
    },
    {
      id: 'incident_date',
      label: t('review.when'),
      value: caseData.incident_date || 'Not specified',
      isLong: false
    },
    {
      id: 'incident_location',
      label: t('review.where'),
      value: caseData.incident_location || 'Not specified',
      isLong: false
    },
    {
      id: 'suspect_info',
      label: t('review.peopleInvolved'),
      value: caseData.suspect_info || 'Unknown or not specified',
      isLong: false
    },
    {
      id: 'loss_damage',
      label: t('review.lossDamage'),
      value: caseData.loss_damage || 'Under assessment',
      isLong: false
    },
  ];

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
      
      {/* Title */}
      <div>
        <span className="text-xs font-bold text-gov-navy uppercase tracking-wider block mb-1">
          Intake Step 4 of 4
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          {t('review.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
          {t('review.subtitle')}
        </p>
      </div>

      {/* Case Completeness Meter */}
      <CaseCompletenessBar score={caseData.completeness_score} />

      {/* Information Review Cards with Edit buttons */}
      <div className="space-y-3">
        {sections.map((sec) => {
          const isEditing = editingField === sec.id;
          return (
            <div
              key={sec.id}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  {sec.label}
                </span>

                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => handleStartEdit(sec.id, sec.value)}
                    className="text-xs font-semibold text-gov-navy hover:text-blue-900 inline-flex items-center gap-1 hover:underline"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{t('review.editBtn')}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(sec.id)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                )}
              </div>

              {isEditing ? (
                sec.isLong ? (
                  <textarea
                    rows={3}
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-gov-navy mt-1"
                  />
                ) : (
                  <input
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-gov-navy mt-1"
                  />
                )
              ) : (
                <p className="text-xs sm:text-sm text-slate-900 font-medium leading-relaxed">
                  {sec.value}
                </p>
              )}
            </div>
          );
        })}

        {/* Evidence Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-0.5">
              {t('review.evidenceAttached')}
            </span>
            <p className="text-xs sm:text-sm font-semibold text-slate-800">
              {caseData.evidence_count || 0} file(s) attached
            </p>
          </div>
          <button
            type="button"
            onClick={onEditFact}
            className="text-xs font-semibold text-gov-navy hover:text-blue-900 inline-flex items-center gap-1"
          >
            <span>Manage Evidence</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-slate-200 flex justify-end">
        <button
          type="button"
          onClick={handleRunAnalysis}
          disabled={analyzing}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gov-navy text-white text-sm sm:text-base font-bold rounded-xl hover:bg-blue-900 active:scale-98 transition shadow-sm disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{analyzing ? 'Analyzing Verified Statutes...' : t('review.analyzeBtn')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
