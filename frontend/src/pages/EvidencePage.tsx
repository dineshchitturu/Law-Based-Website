import React, { useEffect, useState } from 'react';
import { ArrowRight, SkipForward, ShieldCheck, AlertCircle } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { api } from '../services/api';
import { EvidenceItem } from '../types';
import { FileUploader } from '../components/evidence/FileUploader';
import { EvidenceCard } from '../components/evidence/EvidenceCard';
import { LoadingState } from '../components/common/LoadingState';

export const EvidencePage: React.FC<{
  caseId: number;
  onProceedToReview: () => void;
}> = ({ caseId, onProceedToReview }) => {
  const { t } = useTranslation();

  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchEvidence = async () => {
    try {
      const items = await api.getCaseEvidence(caseId);
      setEvidenceList(items);
    } catch (err) {
      console.error('Failed to load evidence:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, [caseId]);

  const handleUploaded = (newItem: EvidenceItem) => {
    setEvidenceList((prev) => [newItem, ...prev]);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteEvidence(id);
      setEvidenceList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Failed to delete evidence:', err);
    }
  };

  if (loading) {
    return <LoadingState message="Loading case evidence..." />;
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-gov-navy uppercase tracking-wider block mb-1">
          Intake Step 3 of 4
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          {t('evidence.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          {t('evidence.subtitle')}
        </p>
      </div>

      {/* File Uploader Component */}
      <FileUploader caseId={caseId} onUploaded={handleUploaded} />

      {/* Current Uploaded Evidence List */}
      <div>
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
          Attached Evidence for this Case ({evidenceList.length})
        </h3>

        {evidenceList.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-xs sm:text-sm text-slate-400">
            {t('evidence.noEvidence')}
          </div>
        ) : (
          <div className="space-y-2.5">
            {evidenceList.map((item) => (
              <EvidenceCard key={item.id} item={item} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={onProceedToReview}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
        >
          <SkipForward className="w-4 h-4" />
          <span>{t('evidence.skipBtn')}</span>
        </button>

        <button
          type="button"
          onClick={onProceedToReview}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gov-navy text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-blue-900 active:scale-98 transition shadow-sm"
        >
          <span>{t('evidence.continueBtn')}</span>
          <ArrowRight className="w-4 h-4 text-amber-300" />
        </button>
      </div>

    </div>
  );
};
