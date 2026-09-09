import React from 'react';
import { Camera, Video, Mic, FileText, Image, Folder, Trash2, Download } from 'lucide-react';
import { EvidenceItem } from '../../types';

export const EvidenceCard: React.FC<{
  item: EvidenceItem;
  onDelete?: (id: number) => void;
}> = ({ item, onDelete }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'photo': return <Camera className="w-5 h-5 text-blue-600" />;
      case 'video': return <Video className="w-5 h-5 text-purple-600" />;
      case 'audio': return <Mic className="w-5 h-5 text-amber-600" />;
      case 'screenshot': return <Image className="w-5 h-5 text-indigo-600" />;
      case 'document': return <FileText className="w-5 h-5 text-emerald-600" />;
      default: return <Folder className="w-5 h-5 text-slate-600" />;
    }
  };

  const formattedSize = item.file_size > 1024 * 1024
    ? `${(item.file_size / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.round(item.file_size / 1024)} KB`;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex items-start gap-3 shadow-2xs hover:border-slate-300 transition">
      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
        {getIcon(item.file_type)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate" title={item.original_filename}>
            {item.original_filename}
          </h4>
          <span className="text-[10px] font-semibold text-slate-500 uppercase bg-slate-100 px-1.5 py-0.5 rounded flex-shrink-0">
            {item.file_type}
          </span>
        </div>

        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
          {item.description || 'No description provided'}
        </p>

        <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[11px] text-slate-400">
          <span>{formattedSize}</span>

          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition"
                title="Remove evidence file"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
