import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState: React.FC<{ message?: string }> = ({
  message = "Organizing your information..."
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center" role="status" aria-live="polite">
      <Loader2 className="w-8 h-8 text-gov-navy animate-spin mb-3" aria-hidden="true" />
      <p className="text-sm font-medium text-slate-700">{message}</p>
      <span className="sr-only">Loading content, please wait</span>
    </div>
  );
};
