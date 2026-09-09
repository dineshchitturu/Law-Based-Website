import React, { useState } from 'react';
import { ArrowRight, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { api } from '../services/api';
import { EmergencyAlert } from '../components/common/EmergencyAlert';

export const StartCasePage: React.FC<{
  onCaseCreated: (caseId: number) => void;
}> = ({ onCaseCreated }) => {
  const { t } = useTranslation();

  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>("I don't know");
  const [complainantName, setComplainantName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showEmergency, setShowEmergency] = useState<boolean>(false);

  const categories = [
    { label: 'Theft', value: 'Theft' },
    { label: 'Money / Online Fraud', value: 'Cyber Fraud' },
    { label: 'Property Dispute', value: 'Property Dispute' },
    { label: 'Assault / Injury', value: 'Assault / Injury' },
    { label: 'Consumer Problem', value: 'Consumer Problem' },
    { label: 'Family / Domestic Issue', value: 'Family / Domestic Issue' },
    { label: 'Work / Employment', value: 'Work / Employment' },
    { label: 'Online / Cyber Issue', value: 'Cyber Fraud' },
    { label: 'Other', value: 'Other' },
    { label: "I don't know (AI will identify)", value: "I don't know" }
  ];

  // Emergency heuristic check while typing
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setDescription(val);
    const dangerTerms = ["immediate danger", "life threat", "threat to kill", "killing me", "weapons", "holding knife", "holding gun"];
    const isDanger = dangerTerms.some(term => val.toLowerCase().includes(term));
    if (isDanger) {
      setShowEmergency(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('Please enter a short description of what happened.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const newCase = await api.createCase({
        category: category === "I don't know" ? "I don't know" : category,
        initial_description: description,
        complainant_name: complainantName || undefined
      });

      onCaseCreated(newCase.id);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'We encountered a connection issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="mb-6">
        <span className="text-xs font-bold text-gov-navy uppercase tracking-wider block mb-1">
          Intake Step 1 of 4
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          {t('startCase.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
          {t('startCase.desc')}
        </p>
      </div>

      {/* Emergency Alert Banner if danger detected */}
      {showEmergency && (
        <EmergencyAlert onDismiss={() => setShowEmergency(false)} />
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Large Textarea */}
        <div className="bg-white border-2 border-slate-300 focus-within:border-gov-navy rounded-xl p-4 shadow-xs">
          <label htmlFor="case-description" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
            Tell us what happened in your own words: <span className="text-red-500">*</span>
          </label>
          <textarea
            id="case-description"
            rows={5}
            value={description}
            onChange={handleDescriptionChange}
            placeholder={t('startCase.placeholder')}
            className="w-full text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none resize-y leading-relaxed font-normal"
            required
          />
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>Minimum information: what, when, or where</span>
            <span>{description.length} characters</span>
          </div>
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-2">
            {t('startCase.categoryLabel')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="radiogroup" aria-label="Problem Category">
            {categories.map((cat, idx) => {
              const isSelected = category === cat.value;
              const isUnknown = cat.value === "I don't know";
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`p-3 rounded-lg border text-left text-xs sm:text-sm transition font-semibold flex items-center justify-between ${
                    isSelected
                      ? 'border-gov-navy bg-blue-50/80 text-gov-navy ring-1 ring-gov-navy font-bold'
                      : isUnknown
                      ? 'border-dashed border-amber-400 bg-amber-50/50 text-amber-900 hover:bg-amber-100/60'
                      : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                  role="radio"
                  aria-checked={isSelected}
                >
                  <span>{cat.label}</span>
                  {isUnknown && <Sparkles className="w-3.5 h-3.5 text-gov-saffron flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Complainant Name */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
          <label htmlFor="complainant-name" className="block text-xs font-semibold text-slate-700 mb-1">
            Complainant Full Name (Optional — will be used for draft complaints):
          </label>
          <input
            id="complainant-name"
            type="text"
            value={complainantName}
            onChange={(e) => setComplainantName(e.target.value)}
            placeholder="e.g. Rajesh Kumar"
            className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-gov-navy"
          />
        </div>

        {errorMsg && (
          <div className="text-xs sm:text-sm text-red-600 flex items-center gap-1.5 font-medium bg-red-50 p-3 rounded-lg border border-red-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Private & Confidential</span>
          </div>

          <button
            type="submit"
            disabled={loading || !description.trim()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gov-navy text-white text-sm sm:text-base font-bold rounded-lg hover:bg-blue-900 active:scale-98 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm focus:outline-none focus:ring-2 focus:ring-gov-navy"
          >
            <span>{loading ? 'Creating Case Session...' : t('startCase.continueBtn')}</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </button>
        </div>

      </form>

    </div>
  );
};
