import React, { useState } from 'react';
import { User, Mail, MapPin, Globe, Type, Shield, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../i18n/LanguageContext';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { TextSizeControl } from '../components/common/TextSizeControl';
import { api } from '../services/api';

export const ProfilePage: React.FC<{
  onLogout: () => void;
}> = ({ onLogout }) => {
  const { user, refreshUser, loginAsDemo } = useAuth();
  const { t } = useTranslation();

  const [name, setName] = useState<string>(user?.full_name || '');
  const [city, setCity] = useState<string>(user?.city || '');
  const [phone, setPhone] = useState<string>(user?.phone_number || '');
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<boolean>(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateProfile({
        full_name: name,
        city: city,
        phone_number: phone
      });
      await refreshUser();
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 2500);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
      
      {/* Title */}
      <div>
        <span className="text-xs font-bold text-gov-navy uppercase tracking-wider block mb-1">
          Citizen Settings
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          User Profile & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
          Manage your personal details for complaint drafts and interface accessibility preferences.
        </p>
      </div>

      {/* Profile Form Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
          <User className="w-4 h-4 text-gov-navy" />
          <span>Complainant Particulars</span>
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Full Legal Name:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gov-navy font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Registered Email:
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-md bg-slate-100 text-slate-500 font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Contact Phone:
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gov-navy font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                City / State:
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Hyderabad, Telangana"
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gov-navy font-medium"
              />
            </div>
          </div>

          {successMsg && (
            <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-300 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Profile details updated successfully!</span>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-gov-navy text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-blue-900 transition shadow-xs disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Accessibility & Language Preferences */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Globe className="w-4 h-4 text-gov-navy" />
          <span>Language & Accessibility Preferences</span>
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Portal Language</h4>
            <p className="text-xs text-slate-500">English, Telugu (తెలుగు), or Hindi (हिन्दी)</p>
          </div>
          <LanguageSelector />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Text Size (Screen Legibility)</h4>
            <p className="text-xs text-slate-500">Adjust font scaling for comfortable reading</p>
          </div>
          <TextSizeControl />
        </div>
      </div>

      {/* Privacy Notice Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Citizen Privacy & Safe Storage Notice</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
          Do NOT upload bank account passwords, OTPs, UPI PINs, or confidential personal keys. 
          Case details and attached exhibits are restricted strictly to your authenticated session.
        </p>
      </div>

      {/* Evaluation / Quick Reset */}
      <div className="bg-slate-100 border border-slate-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-bold text-slate-800 block">Judge / Hackathon Evaluator Quick Switch</span>
          <span className="text-slate-500">Reset or log in as default citizen tester (Rajesh Kumar).</span>
        </div>
        <button
          type="button"
          onClick={loginAsDemo}
          className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 font-bold rounded-lg text-gov-navy transition shadow-2xs"
        >
          Reset Demo Citizen
        </button>
      </div>

      {/* Logout */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs sm:text-sm font-bold rounded-lg transition border border-red-200"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('nav.logout')}</span>
        </button>
      </div>

    </div>
  );
};
