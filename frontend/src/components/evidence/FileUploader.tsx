import React, { useState, useRef } from 'react';
import { Camera, Video, Mic, FileText, Image, Folder, UploadCloud, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';
import { api } from '../../services/api';
import { EvidenceItem } from '../../types';

interface FileUploaderProps {
  caseId: number;
  onUploaded: (item: EvidenceItem) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ caseId, onUploaded }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedType, setSelectedType] = useState<string>('photo');
  const [description, setDescription] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const categoryButtons = [
    { id: 'photo', label: t('evidence.photos'), icon: Camera },
    { id: 'video', label: t('evidence.videos'), icon: Video },
    { id: 'audio', label: t('evidence.audio'), icon: Mic },
    { id: 'document', label: t('evidence.documents'), icon: FileText },
    { id: 'screenshot', label: t('evidence.screenshots'), icon: Image },
    { id: 'other', label: t('evidence.other'), icon: Folder },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 25 * 1024 * 1024) {
        setErrorMsg('File size exceeds 25 MB limit.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setErrorMsg(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('case_id', String(caseId));
      formData.append('file_type', selectedType);
      formData.append('description', description);
      formData.append('file', selectedFile);

      const item = await api.uploadEvidence(formData);
      onUploaded(item);
      setSelectedFile(null);
      setDescription('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "We couldn't upload this file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <h3 className="text-base font-bold text-slate-900 mb-1">
        {t('evidence.title')}
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 mb-4">
        {t('evidence.subtitle')}
      </p>

      {/* Category selector buttons */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4" role="radiogroup" aria-label="Evidence category">
        {categoryButtons.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedType === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedType(cat.id)}
              className={`p-3 rounded-lg border text-center flex flex-col items-center justify-center gap-1.5 transition ${
                isSelected
                  ? 'border-gov-navy bg-blue-50/80 text-gov-navy font-bold shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
              }`}
              role="radio"
              aria-checked={isSelected}
            >
              <Icon className={`w-5 h-5 ${isSelected ? 'text-gov-navy' : 'text-slate-500'}`} aria-hidden="true" />
              <span className="text-[11px] font-medium leading-tight">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* File input and description form */}
      <form onSubmit={handleUpload} className="space-y-3">
        <div>
          <label htmlFor="evidence-file" className="block text-xs font-semibold text-slate-700 mb-1">
            Choose File (Image, PDF, Video, Audio — Max 25 MB):
          </label>
          <input
            id="evidence-file"
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gov-navy file:text-white hover:file:bg-blue-900 cursor-pointer border border-slate-300 rounded-md p-1.5 bg-slate-50"
          />
        </div>

        {selectedFile && (
          <div className="text-xs text-slate-600 bg-slate-100 p-2 rounded flex items-center justify-between">
            <span className="truncate max-w-xs font-medium">Selected: {selectedFile.name}</span>
            <span className="font-bold text-slate-500">{Math.round(selectedFile.size / 1024)} KB</span>
          </div>
        )}

        <div>
          <label htmlFor="evidence-desc" className="block text-xs font-semibold text-slate-700 mb-1">
            Description of Evidence:
          </label>
          <input
            id="evidence-desc"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('evidence.descriptionPlaceholder')}
            className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gov-navy focus:border-gov-navy"
          />
        </div>

        {errorMsg && (
          <div className="text-xs text-red-600 flex items-center gap-1.5 font-medium bg-red-50 p-2 rounded border border-red-200">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={!selectedFile || uploading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gov-navy text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-blue-900 active:scale-98 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{uploading ? t('evidence.uploading') : 'Upload Evidence File'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
