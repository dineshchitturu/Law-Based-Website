import React from 'react';
import { MessageSquare, HelpCircle, Paperclip, FileCheck2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

export const HowItWorksPage: React.FC<{
  onNavigate: (page: string) => void;
}> = ({ onNavigate }) => {
  const { t } = useTranslation();

  const steps = [
    {
      number: 'STEP 1',
      title: t('howItWorks.step1Title'),
      desc: t('howItWorks.step1Desc'),
      icon: MessageSquare,
      color: 'bg-blue-600',
    },
    {
      number: 'STEP 2',
      title: t('howItWorks.step2Title'),
      desc: t('howItWorks.step2Desc'),
      icon: HelpCircle,
      color: 'bg-indigo-600',
    },
    {
      number: 'STEP 3',
      title: t('howItWorks.step3Title'),
      desc: t('howItWorks.step3Desc'),
      icon: Paperclip,
      color: 'bg-amber-600',
    },
    {
      number: 'STEP 4',
      title: t('howItWorks.step4Title'),
      desc: t('howItWorks.step4Desc'),
      icon: FileCheck2,
      color: 'bg-emerald-600',
    },
  ];

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      
      {/* Title */}
      <div className="text-center mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-gov-navy bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Process Transparency
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
          {t('howItWorks.title')}
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-lg mx-auto">
          A predictable, accessible 4-step workflow designed to protect your rights and organize facts accurately.
        </p>
      </div>

      {/* 4 Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="bg-white border-2 border-slate-200 rounded-xl p-5 shadow-xs hover:border-gov-navy transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black tracking-wider text-gov-navy uppercase px-2 py-0.5 bg-slate-100 rounded">
                    {s.number}
                  </span>
                  <div className={`w-9 h-9 rounded-lg ${s.color} text-white flex items-center justify-center shadow-xs`}>
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1.5">
                  {s.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {s.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-gov-navy" />
                <span>Citizen-centric guidance</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Structured Organization Note */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
        <p className="text-sm font-semibold text-slate-800">
          "{t('howItWorks.organizeNote')}"
        </p>
      </div>

      {/* Start Action */}
      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={() => onNavigate('start_case')}
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-gov-navy text-white text-base font-bold rounded-lg hover:bg-blue-900 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-gov-navy"
        >
          <span>{t('welcome.startBtn')}</span>
          <ArrowRight className="w-5 h-5 text-amber-300" aria-hidden="true" />
        </button>
      </div>

    </div>
  );
};
