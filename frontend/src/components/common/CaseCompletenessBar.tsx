import React from 'react';
import { Info } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';

export const CaseCompletenessBar: React.FC<{ score: number; showNotice?: boolean }> = ({
  score,
  showNotice = true
}) => {
  const { t } = useTranslation();
  const clampedScore = Math.min(100, Math.max(0, score || 25));

  const getProgressColor = () => {
    if (clampedScore >= 80) return 'bg-emerald-600';
    if (clampedScore >= 50) return 'bg-blue-600';
    return 'bg-amber-500';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
        <span>{t('review.completenessLabel')}</span>
        <span className="font-bold text-gov-navy text-sm sm:text-base">{clampedScore}%</span>
      </div>

      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ease-out ${getProgressColor()}`}
          style={{ width: `${clampedScore}%` }}
          role="progressbar"
          aria-valuenow={clampedScore}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {showNotice && (
        <p className="mt-2 text-xs text-slate-500 flex items-start gap-1.5 leading-tight">
          <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span>{t('review.completenessNote')}</span>
        </p>
      )}
    </div>
  );
};
