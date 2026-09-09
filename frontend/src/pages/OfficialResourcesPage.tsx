import React, { useEffect, useState } from 'react';
import { ShieldCheck, PhoneCall, ExternalLink, Building2, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { api } from '../services/api';
import { OfficialResourceCategory } from '../types';
import { LoadingState } from '../components/common/LoadingState';

export const OfficialResourcesPage: React.FC = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<OfficialResourceCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await api.getOfficialResources();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load official resources:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  if (loading) {
    return <LoadingState message="Loading verified official government resources..." />;
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-gov-navy text-xs font-bold mb-1 border border-blue-200">
          <ShieldCheck className="w-3.5 h-3.5 text-gov-navy" />
          <span>Verified Government Portals & Helplines</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Official Government Resources
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
          Authoritative portals and emergency lines maintained by Central and State Ministries in India. No third-party commercial links.
        </p>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {categories.map((cat, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gov-navy" />
              <span>{cat.category}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cat.items.map((item, iIdx) => (
                <div
                  key={iIdx}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex flex-col justify-between hover:border-slate-300 transition"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {item.title}
                      </h4>
                      {item.is_official && (
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 flex-shrink-0">
                          Official Source
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] font-semibold text-gov-navy mb-1.5">
                      {item.authority}
                    </p>

                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    {item.phone && item.phone !== 'N/A' ? (
                      <a
                        href={`tel:${item.phone.split('/')[0].trim()}`}
                        className="inline-flex items-center gap-1 font-bold text-red-700 hover:text-red-900"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Helpline: {item.phone}</span>
                      </a>
                    ) : (
                      <span className="text-slate-400">Web Portal</span>
                    )}

                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-gov-navy hover:underline"
                      >
                        <span>Visit Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
