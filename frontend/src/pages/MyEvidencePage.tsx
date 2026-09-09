import React, { useEffect, useState } from 'react';
import { Paperclip, Search, Trash2, Camera, Video, Mic, FileText, Image, Folder } from 'lucide-react';
import { api } from '../services/api';
import { EvidenceItem } from '../types';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';

export const MyEvidencePage: React.FC<{
  onSelectCase: (caseId: number) => void;
}> = ({ onSelectCase }) => {
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const fetchEvidence = async () => {
    try {
      const items = await api.getAllEvidence();
      setEvidenceList(items);
    } catch (err) {
      console.error('Failed to load all evidence:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await api.deleteEvidence(id);
      setEvidenceList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Failed to delete evidence:', err);
    }
  };

  const filtered = evidenceList.filter((item) => {
    const matchesType = selectedType === 'all' || item.file_type === selectedType;
    const matchesSearch =
      !search.trim() ||
      item.original_filename.toLowerCase().includes(search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const filterTabs = [
    { id: 'all', label: 'All Exhibits' },
    { id: 'photo', label: 'Photos' },
    { id: 'document', label: 'Documents' },
    { id: 'screenshot', label: 'Screenshots' },
    { id: 'video', label: 'Videos' },
  ];

  if (loading) {
    return <LoadingState message="Loading your evidence gallery..." />;
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      
      {/* Title */}
      <div>
        <span className="text-xs font-bold text-gov-navy uppercase tracking-wider block mb-1">
          Evidence Library
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          My Evidence Exhibits
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
          Central repository of all photos, receipts, CCTV clips, and PDFs uploaded across your cases.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-3">
        <div className="relative">
          <label htmlFor="search-evidence" className="sr-only">Search evidence</label>
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            id="search-evidence"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search evidence by filename or description..."
            className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-navy"
          />
        </div>

        <div className="flex flex-wrap gap-1.5" role="tablist">
          {filterTabs.map((tab) => {
            const isSelected = selectedType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedType(tab.id)}
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

      {/* Gallery Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No evidence items found"
          description="Upload receipts, photos, and screenshots during case intake."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-gov-navy flex items-center justify-center flex-shrink-0">
                <Paperclip className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate" title={item.original_filename}>
                    {item.original_filename}
                  </h4>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {item.file_type}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                  {item.description || 'Supporting exhibit'}
                </p>

                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <button
                    onClick={() => onSelectCase(item.case_id)}
                    className="font-bold text-gov-navy hover:underline"
                  >
                    View Case #{item.case_id}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Remove exhibit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
