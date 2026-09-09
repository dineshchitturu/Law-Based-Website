import React from 'react';
import { Scale, ArrowRight, HelpCircle, BookOpen, Briefcase, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { Disclaimer } from '../components/common/Disclaimer';

export const WelcomePage: React.FC<{
  onNavigate: (page: string) => void;
}> = ({ onNavigate }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[calc(100vh-10rem)] flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      
      {/* Hero Container */}
      <div className="text-center my-auto py-8">
        
        {/* Emblem / Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-gov-navy text-xs font-bold mb-6 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-gov-navy" aria-hidden="true" />
          <span>AI-Assisted Citizen Legal Intake & Information</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {t('welcome.hero')}
        </h1>

        {/* Hero Description */}
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          {t('welcome.desc')}
        </p>

        {/* Primary & Secondary Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => onNavigate('start_case')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gov-navy text-white text-base font-bold rounded-lg hover:bg-blue-900 active:scale-98 transition shadow-sm focus:outline-none focus:ring-3 focus:ring-gov-navy focus:ring-offset-2"
          >
            <span>{t('welcome.startBtn')}</span>
            <ArrowRight className="w-5 h-5 text-amber-300" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('how_it_works')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white border-2 border-slate-300 text-slate-800 text-base font-bold rounded-lg hover:bg-slate-50 hover:border-slate-400 active:scale-98 transition shadow-2xs focus:outline-none focus:ring-2 focus:ring-gov-navy"
          >
            <HelpCircle className="w-5 h-5 text-slate-500" aria-hidden="true" />
            <span>{t('welcome.howItWorksBtn')}</span>
          </button>
        </div>

        {/* Quick Additional Navigation Links */}
        <div className="mt-8 pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-semibold text-slate-600">
          <button
            onClick={() => onNavigate('search_laws')}
            className="inline-flex items-center gap-1.5 hover:text-gov-navy transition hover:underline"
          >
            <BookOpen className="w-4 h-4 text-gov-navy" />
            <span>{t('welcome.searchLawsLink')}</span>
          </button>

          <span className="text-slate-300">•</span>

          <button
            onClick={() => onNavigate('my_cases')}
            className="inline-flex items-center gap-1.5 hover:text-gov-navy transition hover:underline"
          >
            <Briefcase className="w-4 h-4 text-gov-navy" />
            <span>{t('welcome.myCasesLink')}</span>
          </button>

          <span className="text-slate-300">•</span>

          <button
            onClick={() => onNavigate('official_resources')}
            className="inline-flex items-center gap-1.5 hover:text-gov-navy transition hover:underline"
          >
            <ShieldCheck className="w-4 h-4 text-gov-navy" />
            <span>{t('welcome.helpLink')}</span>
          </button>
        </div>

        {/* 3 Value Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-10 text-left">
          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 text-gov-navy font-bold text-xs uppercase mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Simple English & Indian Languages</span>
            </div>
            <p className="text-xs text-slate-600">
              No legal terminology needed. Explain your issue naturally.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 text-gov-navy font-bold text-xs uppercase mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Verified Legislation</span>
            </div>
            <p className="text-xs text-slate-600">
              Directly grounded in BNS 2023, BNSS, BSA, IT Act, and CPA.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 text-gov-navy font-bold text-xs uppercase mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Structured Complaint Drafts</span>
            </div>
            <p className="text-xs text-slate-600">
              Organizes your facts and generates editable complaints ready for review.
            </p>
          </div>
        </div>

      </div>

      {/* Bottom Mandatory Legal Safety Notice */}
      <div className="mt-8">
        <Disclaimer />
      </div>

    </div>
  );
};
