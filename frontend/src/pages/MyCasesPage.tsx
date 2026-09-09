import React, { useEffect, useState } from 'react';
import {
  Briefcase, Search, PlusCircle, ArrowRight, Clock,
  Filter, AlertCircle, FileText
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { api } from '../services/api';
import { CaseItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';

export const MyCasesPage: React.FC<{
  onSelectCase: (caseId: number) => void;
  onNewCase: () => void;
}> = ({ onSelectCase, onNewCase }) => {
  const { t } = useTranslation();

  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filterTabs = [
    { id: 'all', label: 'All Cases' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'ready_for_review', label: 'Ready for Review' },
    { id: 'draft', label: 'Draft' },
  ];

  const fetchCases = async () => {
    setLoading(true);
    try {
      const data = await api.listCases({
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        search: searchQuery.trim() || undefined
      });
      setCases(data);
    } catch (err) {
      console.error('Failed to load cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCases();
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-gov-navy uppercase tracking-wider block mb-1">
            Citizen Case Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {t('nav.cases')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Track, review, and organize your ongoing and completed legal case summaries.
          </p>
        </div>

        <button
          type="button"
          onClick={onNewCase}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gov-navy text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-blue-900 transition shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-amber-300" />
          <span>{t('welcome.startBtn')}</span>
        </button>
      </div>

      {/* Search & Status Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-3">
        
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <label htmlFor="search-cases" className="sr-only">Search cases</label>
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            id="search-cases"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cases by title, keyword, or description..."
            className="w-full text-xs sm:text-sm pl-9 pr-20 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-navy"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded"
          >
            Search
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1" role="tablist">
          {filterTabs.map((tab) => {
            const isSelected = selectedStatus === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedStatus(tab.id)}
                role="tab"
                aria-selected={isSelected}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                  isSelected
                    ? 'bg-gov-navy text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

      </div>

      {/* Case List */}
      <div>
        {loading ? (
          <LoadingState message="Loading your cases..." />
        ) : cases.length === 0 ? (
          <EmptyState
            title="No cases found"
            description="You don't have any cases matching the selected filter."
            actionText="Start a New Case"
            onAction={onNewCase}
          />
        ) : (
          <div className="space-y-3">
            {cases.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectCase(c.id)}
                className="bg-white border border-slate-200 hover:border-gov-navy rounded-xl p-4 sm:p-5 transition shadow-2xs hover:shadow-xs cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold uppercase text-gov-navy bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {c.category}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-gov-navy transition truncate">
                    {c.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                    {c.initial_description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {c.incident_date || 'Date logged'}
                    </span>
                    <span>•</span>
                    <span className="font-bold text-slate-700">
                      Completeness: {c.completeness_score}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="text-xs font-bold text-gov-navy group-hover:underline">
                    View Case Dossier
                  </span>
                  <ArrowRight className="w-4 h-4 text-gov-navy" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
