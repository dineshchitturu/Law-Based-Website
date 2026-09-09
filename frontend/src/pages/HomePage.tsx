import React, { useEffect, useState } from 'react';
import {
  PlusCircle, ArrowRight, BookOpen, Briefcase, Paperclip,
  FileText, ShieldAlert, Sparkles, Clock, AlertTriangle
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { CaseItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingState } from '../components/common/LoadingState';

export const HomePage: React.FC<{
  onNavigate: (page: string, caseId?: number) => void;
}> = ({ onNavigate }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [recentCases, setRecentCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const cases = await api.listCases();
        setRecentCases(cases.slice(0, 3)); // show only top 2-3 recent cases
      } catch (err) {
        console.error('Failed to load cases:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <div>
          <span className="text-xs font-bold text-gov-navy uppercase tracking-wider block">
            Welcome, {user?.full_name || 'Citizen'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('home.heading')}
          </h1>
        </div>

        {/* Hackathon Innovation Badge */}
        <button
          type="button"
          onClick={() => onNavigate('transparency')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-gov-navy border border-blue-200 rounded-md text-xs font-bold transition shadow-2xs self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-gov-saffron" />
          <span>How AI Works (Judges & Citizens)</span>
        </button>
      </div>

      {/* Primary Hero Action Card: START A NEW CASE */}
      <div className="bg-white border-2 border-gov-navy rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-12 -mt-12 pointer-events-none" />
        
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gov-navy text-white mb-3">
            <span>Primary Service</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
            {t('home.startCardTitle')}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 font-medium">
            {t('home.startCardDesc')} Explain in simple everyday words — no legal sections or jargon needed.
          </p>

          <button
            type="button"
            onClick={() => onNavigate('start_case')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gov-navy text-white text-sm sm:text-base font-bold rounded-xl hover:bg-blue-900 active:scale-98 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-gov-navy"
          >
            <span>{t('home.startBtn')}</span>
            <ArrowRight className="w-5 h-5 text-amber-300" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Quick Services Grid */}
      <div>
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
          {t('home.quickServices')}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          <button
            onClick={() => onNavigate('search_laws')}
            className="bg-white border border-slate-200 hover:border-gov-navy hover:bg-blue-50/40 p-4 rounded-xl text-left transition shadow-2xs group"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-gov-navy mb-2.5 group-hover:bg-gov-navy group-hover:text-white transition">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Search Laws</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">BNS, IT Act, CPA</p>
          </button>

          <button
            onClick={() => onNavigate('my_cases')}
            className="bg-white border border-slate-200 hover:border-gov-navy hover:bg-blue-50/40 p-4 rounded-xl text-left transition shadow-2xs group"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 mb-2.5 group-hover:bg-indigo-700 group-hover:text-white transition">
              <Briefcase className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">{t('nav.cases')}</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">View saved cases</p>
          </button>

          <button
            onClick={() => onNavigate('evidence')}
            className="bg-white border border-slate-200 hover:border-gov-navy hover:bg-blue-50/40 p-4 rounded-xl text-left transition shadow-2xs group"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 mb-2.5 group-hover:bg-amber-700 group-hover:text-white transition">
              <Paperclip className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">My Evidence</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Files & screenshots</p>
          </button>

          <button
            onClick={() => onNavigate('official_resources')}
            className="bg-white border border-slate-200 hover:border-gov-navy hover:bg-blue-50/40 p-4 rounded-xl text-left transition shadow-2xs group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 mb-2.5 group-hover:bg-emerald-700 group-hover:text-white transition">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Helplines & Portals</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">112, 1930, 1915</p>
          </button>

        </div>
      </div>

      {/* Recent Cases Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
            {t('home.recentCases')}
          </h3>
          {recentCases.length > 0 && (
            <button
              onClick={() => onNavigate('my_cases')}
              className="text-xs font-bold text-gov-navy hover:underline"
            >
              {t('home.viewAll')}
            </button>
          )}
        </div>

        {loading ? (
          <LoadingState message="Loading recent cases..." />
        ) : recentCases.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-5 text-center text-sm text-slate-500">
            {t('home.noCases')}
          </div>
        ) : (
          <div className="space-y-3">
            {recentCases.map((c) => (
              <div
                key={c.id}
                onClick={() => onNavigate('case_details', c.id)}
                className="bg-white border border-slate-200 hover:border-slate-300 p-4 rounded-xl flex items-center justify-between cursor-pointer transition shadow-2xs hover:shadow-xs group"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-gov-navy uppercase">
                      {c.category}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate group-hover:text-gov-navy transition">
                    {c.title}
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{c.incident_date || 'Date recorded'}</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">Completeness: {c.completeness_score}%</span>
                  </p>
                </div>

                <div className="flex items-center text-slate-400 group-hover:text-gov-navy transition">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
