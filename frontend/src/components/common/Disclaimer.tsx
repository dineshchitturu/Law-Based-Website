import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';

export const Disclaimer: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { t } = useTranslation();

  if (compact) {
    return (
      <div className="bg-slate-100 border-t border-slate-300 px-4 py-2 text-center text-xs text-slate-600 font-medium flex items-center justify-center gap-1.5" role="note">
        <ShieldCheck className="w-3.5 h-3.5 text-gov-navy flex-shrink-0" aria-hidden="true" />
        <span>{t('disclaimerBar')}</span>
      </div>
    );
  }

  return (
    <aside 
      className="bg-amber-50/90 border border-amber-300/80 rounded-lg p-3 text-xs sm:text-sm text-slate-700 flex items-start gap-2.5 shadow-sm"
      role="note"
      aria-label="Legal Disclaimer"
    >
      <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div>
        <strong className="font-semibold text-slate-900 block sm:inline mr-1">Official Legal Notice:</strong>
        LawBot AI provides informational legal guidance and case-structuring assistance. It does not provide judicial advice, does not file complaints automatically, and does not replace an advocate or competent police authority.
      </div>
    </aside>
  );
};
