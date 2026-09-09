import React from 'react';
import { FolderOpen } from 'lucide-react';

export const EmptyState: React.FC<{
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}> = ({ title, description, actionText, onAction, icon }) => {
  return (
    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-white/70">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
        {icon || <FolderOpen className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      {description && <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">{description}</p>}
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex items-center px-4 py-2 bg-gov-navy text-white text-sm font-semibold rounded-md hover:bg-blue-900 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-gov-navy"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
