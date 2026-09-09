import React, { useEffect, useState } from 'react';
import { History as HistoryIcon, Trash2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';

export const HistoryPage: React.FC = () => {
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [confirmClear, setConfirmClear] = useState<boolean>(false);

  const fetchHistory = async () => {
    try {
      const data = await api.getHistory();
      setHistoryItems(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteItem = async (id: number) => {
    try {
      await api.deleteHistoryItem(id);
      setHistoryItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  };

  const handleClearAll = async () => {
    try {
      await api.clearHistory();
      setHistoryItems([]);
      setConfirmClear(false);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  if (loading) {
    return <LoadingState message="Loading activity history..." />;
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-gov-navy uppercase tracking-wider block mb-1">
            Audit Trail
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Activity History
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            Chronological audit log of your case creations, answered questions, uploaded evidence, and draft generation.
          </p>
        </div>

        {historyItems.length > 0 && !confirmClear && (
          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            className="px-3.5 py-2 text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-lg transition border border-red-200"
          >
            Clear History
          </button>
        )}
      </div>

      {/* Confirmation Box */}
      {confirmClear && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-center justify-between gap-3 text-xs sm:text-sm">
          <span className="text-amber-950 font-bold">
            Are you sure you want to clear your entire activity audit history?
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition"
            >
              Yes, Clear All
            </button>
            <button
              onClick={() => setConfirmClear(false)}
              className="px-3 py-1.5 bg-slate-200 text-slate-800 font-semibold rounded hover:bg-slate-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* History Items List */}
      <div>
        {historyItems.length === 0 ? (
          <EmptyState
            title="No activity history yet"
            description="Your case creations, answers, uploads, and drafts will be logged here."
            icon={<HistoryIcon className="w-6 h-6" />}
          />
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-2xs overflow-hidden">
            {historyItems.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-gov-navy flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-gov-navy" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {item.description}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(item.timestamp).toLocaleString()}</span>
                      <span>•</span>
                      <span className="uppercase font-semibold">{item.action_type}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  className="text-slate-400 hover:text-red-600 p-1.5 rounded transition"
                  title="Delete log"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
