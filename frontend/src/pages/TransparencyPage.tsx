import React from 'react';
import {
  Sparkles, ShieldCheck, Cpu, Database, CheckCircle2,
  FileCheck2, Users, ArrowRight, BookOpen, AlertCircle
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

export const TransparencyPage: React.FC<{
  onStartCase: () => void;
}> = ({ onStartCase }) => {
  const { t } = useTranslation();

  const pipelineSteps = [
    {
      step: '1',
      title: 'Natural Language Input',
      desc: 'Citizen explains the incident in everyday language (e.g. "My phone was stolen yesterday from my room").',
      icon: Users,
      badge: 'Input Phase'
    },
    {
      step: '2',
      title: 'NLP Fact Extraction',
      desc: 'System automatically extracts Incident Category (Theft), Object (Mobile phone), Time (Yesterday), and Location (Room).',
      icon: Cpu,
      badge: 'Information Structuring'
    },
    {
      step: '3',
      title: 'Adaptive Intake Interview',
      desc: 'Engine skips already-extracted facts and asks one missing question at a time with accessible choice buttons.',
      icon: CheckCircle2,
      badge: 'One Question at a Time'
    },
    {
      step: '4',
      title: 'Evidence Organization',
      desc: 'Citizen attaches digital evidence (photos, receipts, CCTV clips) linked directly to authenticated case facts.',
      icon: FileCheck2,
      badge: 'BSA 2023 Compliance'
    },
    {
      step: '5',
      title: 'Verified Statutory Retrieval',
      desc: 'Deterministic knowledge engine matches structured facts against verified provisions of BNS, BNSS, BSA, IT Act, and CPA (Zero LLM Hallucinations).',
      icon: Database,
      badge: 'Statutory Verification'
    },
    {
      step: '6',
      title: 'Preliminary Assessment',
      desc: 'Presents potentially relevant sections with plain-language explanations, used facts, missing details, and next steps.',
      icon: BookOpen,
      badge: 'Explainable AI'
    },
    {
      step: '7',
      title: 'Draft Preparation & Human Review',
      desc: 'Generates editable complaint drafts (Police FIR, Consumer Notice, Cyber Crime Report) ready for review and printing.',
      icon: Sparkles,
      badge: 'Actionable Output'
    }
  ];

  const whyCards = [
    {
      title: 'Accessible by Design',
      desc: 'Citizens do not need to know sections, legal jargon, or court procedures.',
      color: 'border-blue-300 bg-blue-50/50'
    },
    {
      title: 'Zero Hallucination Architecture',
      desc: 'Sections and penalties are retrieved strictly from verified Indian statutory databases, not generated blindly by an LLM.',
      color: 'border-emerald-300 bg-emerald-50/50'
    },
    {
      title: 'Evidence-Aware Structuring',
      desc: 'Organizes digital records under Section 63 of Bharatiya Sakshya Adhiniyam 2023 for evidentiary admissibility.',
      color: 'border-amber-300 bg-amber-50/50'
    },
    {
      title: 'Human-Centered & Responsible',
      desc: 'Assists citizens and advocates without pretending to be a judge or predicting case win percentages.',
      color: 'border-indigo-300 bg-indigo-50/50'
    }
  ];

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-gov-navy text-xs font-bold mb-2 border border-blue-200">
          <ShieldCheck className="w-4 h-4 text-gov-navy" />
          <span>Technical Architecture & Explainability</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          How LawBot AI Works
        </h1>
        <p className="text-xs sm:text-base text-slate-600 mt-2 font-medium">
          LawBot AI does NOT independently decide the law. It acts as an intelligent, trustworthy public-service legal intake assistant.
        </p>
      </div>

      {/* 7-Stage Architectural Pipeline */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-200">
          <Cpu className="w-5 h-5 text-gov-navy" />
          <span>End-to-End Processing Pipeline</span>
        </h2>

        <div className="relative border-l-2 border-slate-200 ml-4 sm:ml-6 pl-4 sm:pl-6 space-y-6">
          {pipelineSteps.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div key={idx} className="relative group">
                {/* Number bullet */}
                <div className="absolute -left-[27px] sm:-left-[35px] top-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gov-navy text-white text-xs font-bold flex items-center justify-center border-2 border-white shadow-xs">
                  {p.step}
                </div>

                <div className="bg-slate-50 border border-slate-200 group-hover:border-gov-navy rounded-xl p-3.5 sm:p-4 transition shadow-2xs">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {p.title}
                    </h3>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-gov-navy flex-shrink-0">
                      {p.badge}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    {p.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* "Why This Approach?" Cards */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 text-center sm:text-left">
          Why This Approach? (Evaluation Standard)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {whyCards.map((c, i) => (
            <div key={i} className={`p-4 rounded-xl border ${c.color} shadow-2xs`}>
              <h4 className="text-sm font-bold text-slate-900 mb-1">
                {c.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {c.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Core Safety Standard Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
            Public Safety & Ethical AI Commitment
          </span>
          <h3 className="text-base sm:text-lg font-bold mt-1">
            "Understand your legal issue. Organize your case. Know your next step."
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-lg">
            Empowering ordinary Indian citizens with legal literacy and structured documentation while respecting judicial authority.
          </p>
        </div>

        <button
          type="button"
          onClick={onStartCase}
          className="inline-flex items-center gap-2 px-5 py-3 bg-white text-gov-navy font-bold text-xs sm:text-sm rounded-xl hover:bg-slate-100 transition shadow-sm flex-shrink-0"
        >
          <span>Try Complete Case Flow</span>
          <ArrowRight className="w-4 h-4 text-gov-navy" />
        </button>
      </div>

    </div>
  );
};
