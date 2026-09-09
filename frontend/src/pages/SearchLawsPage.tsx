import React, { useState } from 'react';
import { Search, BookOpen, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { LegalSection } from '../types';
import { SectionModal } from '../components/legal/SectionModal';
import { LoadingState } from '../components/common/LoadingState';

export const SearchLawsPage: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<LegalSection[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedSection, setSelectedSection] = useState<LegalSection | null>(null);

  const sampleKeywords = ['Theft', 'UPI Cyber Fraud', 'Section 303 BNS', 'Assault', 'Consumer Defect', 'Trespass'];

  const handleSearch = async (searchStr: string) => {
    const q = searchStr.trim();
    if (!q) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await api.searchLaws(q);
      setResults(res.results);
    } catch (err) {
      console.error('Failed to search laws:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      
      {/* Detail Modal */}
      <SectionModal section={selectedSection} onClose={() => setSelectedSection(null)} />

      {/* Header */}
      <div>
        <span className="text-xs font-bold text-gov-navy uppercase tracking-wider block mb-1">
          Indian Legislation Explorer
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Search Laws & Sections
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
          Search by keyword, section number, or Act (Bharatiya Nyaya Sanhita, IT Act, Consumer Protection Act).
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white border-2 border-slate-300 focus-within:border-gov-navy rounded-xl p-3 sm:p-4 shadow-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="flex items-center gap-2"
        >
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by keyword, section or Act (e.g. theft, cyber fraud, BNS 303)..."
            className="flex-1 text-xs sm:text-base text-slate-900 focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 sm:px-5 sm:py-2.5 bg-gov-navy text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-blue-900 transition shadow-2xs"
          >
            Search
          </button>
        </form>

        {/* Quick Sample Queries */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-500">
          <span className="font-semibold">Quick Search:</span>
          {sampleKeywords.map((kw, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setQuery(kw);
                handleSearch(kw);
              }}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
            >
              {kw}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div>
        {loading ? (
          <LoadingState message="Searching verified statutory database..." />
        ) : hasSearched && results.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
            <BookOpen className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="font-bold text-slate-700">No exact statutory provisions found</p>
            <p className="text-xs text-slate-500 mt-1">Try searching with common terms like "theft", "upi", "assault", or "303".</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {results.map((sec) => (
              <div
                key={sec.id}
                className="bg-white border border-slate-200 hover:border-gov-navy rounded-xl p-4 sm:p-5 shadow-2xs transition"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 text-gov-navy border border-blue-200">
                      {sec.act_short_code} — Section {sec.section_number}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {sec.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedSection(sec)}
                    className="text-xs font-bold text-gov-navy hover:text-blue-900 inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 transition flex-shrink-0"
                  >
                    <span>Full Details</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mt-2 font-medium bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {sec.simple_explanation}
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 text-[11px] text-slate-500 font-medium">
                  {sec.punishment && (
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      Penalty: {sec.punishment.slice(0, 70)}...
                    </span>
                  )}
                  {sec.cognizable && (
                    <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded">
                      {sec.cognizable}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
