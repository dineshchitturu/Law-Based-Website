import React, { useState } from 'react';
import {
  HelpCircle, ShieldCheck, AlertCircle, PhoneCall,
  ExternalLink, ChevronRight, CheckCircle2
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

export const FilingGuidancePage: React.FC<{
  onNavigate: (page: string) => void;
}> = ({ onNavigate }) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>('cyber');

  const guidanceData: Record<string, any> = {
    cyber: {
      title: "Online & Financial Cyber Fraud Guidance",
      tag: "Time-Sensitive (Golden Hour)",
      summary: "Reporting unauthorized UPI or bank debits within the first 2-24 hours gives cyber police the best chance to freeze destination accounts.",
      steps: [
        {
          title: "Preserve Transaction Data",
          desc: "Note down the 12-digit UTR (Unique Transaction Reference) number, time of debit, and destination UPI VPA or account number."
        },
        {
          title: "Intimate Your Bank Immediately",
          desc: "Call your bank's dedicated 24x7 fraud helpline to report an unauthorized electronic debit and demand an official dispute ticket number."
        },
        {
          title: "Lodge Complaint on National Cyber Crime Portal (1930)",
          desc: "Dial 1930 (Citizen Financial Cyber Fraud Helpline) or register at https://cybercrime.gov.in immediately. An acknowledgment SMS with Complaint ID will be sent."
        },
        {
          title: "Submit Written Complaint to Local Police",
          desc: "Print the Cyber Crime Incident Report draft from LawBot AI and submit it along with your bank statement to the nearest Cyber Crime Police Station."
        }
      ],
      portal: "https://cybercrime.gov.in",
      portalLabel: "National Cyber Crime Reporting Portal (1930)"
    },

    theft: {
      title: "Theft & Stolen Property Guidance",
      tag: "Police Reporting (BNSS Section 173)",
      summary: "Under the new Bharatiya Nagarik Suraksha Sanhita 2023, police have a statutory duty to register an FIR for cognizable theft without delay.",
      steps: [
        {
          title: "Preserve Proof of Ownership",
          desc: "Collect the purchase receipt, invoice, original product box, IMEI number (for phones), or RC book (for vehicles)."
        },
        {
          title: "Identify & Secure Neighborhood CCTV",
          desc: "Request premises security or nearby shopkeepers to preserve camera recordings before footage is auto-deleted."
        },
        {
          title: "Report to the Jurisdictional Police Station",
          desc: "Submit your written complaint to the Station House Officer (SHO). You are legally entitled to receive a signed, free copy of the registered First Information Report (FIR)."
        },
        {
          title: "Block Stolen Mobile (CEIR Portal)",
          desc: "For stolen phones, block the device immediately across all telecom networks in India using the official CEIR portal (https://www.ceir.gov.in)."
        }
      ],
      portal: "https://www.ceir.gov.in",
      portalLabel: "Central Equipment Identity Register (CEIR)"
    },

    assault: {
      title: "Physical Assault & Injury Guidance",
      tag: "Immediate Safety & Evidence",
      summary: "Your physical health and safety comes first. Securing medical documentation (MLC) is vital for legal substantiation.",
      steps: [
        {
          title: "Seek Hospital Examination (MLC)",
          desc: "Visit a government or registered hospital for treatment. Inform the examining doctor that the injury arose from an assault so a Medico-Legal Case (MLC) is recorded."
        },
        {
          title: "Photograph Injuries & Retain Clothing",
          desc: "Take clear photographs of all cuts, bruises, or lacerations. Preserve torn or stained clothing in a clean paper bag."
        },
        {
          title: "Lodging Police Complaint",
          desc: "Present your incident statement at the jurisdictional police station under Bharatiya Nyaya Sanhita Sections 115 / 351."
        },
        {
          title: "Emergency Life Protection",
          desc: "If receiving active death threats or facing ongoing intimidation, immediately dial 112 or contact the Magistrate for protection orders."
        }
      ],
      portal: "https://112.gov.in",
      portalLabel: "National Emergency Support System (112)"
    },

    consumer: {
      title: "Consumer Grievance & Defective Products",
      tag: "Consumer Protection Act 2019",
      summary: "Consumer Commissions handle disputes against sellers, manufacturers, and service providers for deficiency and unfair trade practices.",
      steps: [
        {
          title: "Preserve All Transaction Records",
          desc: "Retain tax invoice, warranty cards, repair service slips, and email communications."
        },
        {
          title: "Lodge Grievance with National Consumer Helpline",
          desc: "Call 1915 or register online at https://consumerhelpline.gov.in for government mediation."
        },
        {
          title: "Send Formal Legal Notice to Seller",
          desc: "Send the Consumer Grievance Notice draft generated by LawBot AI granting 15 days to remedy or refund."
        },
        {
          title: "File Online Complaint via e-Daakhil",
          desc: "If unresolved, file an e-complaint before the District Consumer Commission directly via https://edaakhil.nic.in without paying excessive lawyer fees."
        }
      ],
      portal: "https://edaakhil.nic.in",
      portalLabel: "e-Daakhil Online Consumer Commission"
    },

    property: {
      title: "Property Encroachment & Disputes",
      tag: "Civil & Revenue Remedies",
      summary: "Property disputes require clear demarcation between criminal trespass (police jurisdiction) and title disputes (Civil Court / Revenue Authority).",
      steps: [
        {
          title: "Gather Certified Title Records",
          desc: "Obtain certified copies of Registered Sale Deed, Encumbrance Certificate (EC), and Revenue Passbook / Patta."
        },
        {
          title: "Apply for Official Survey & Demarcation",
          desc: "Submit an application to the local Tahsildar / Revenue Mandal Officer for formal boundary measurement."
        },
        {
          title: "Police Complaint for Criminal Trespass",
          desc: "If the opposing party is actively destroying boundary pillars or committing illegal entry, lodge a complaint under Section 329 BNS."
        },
        {
          title: "Injunction Suit in Civil Court",
          desc: "Consult an advocate to file a suit for Permanent Injunction to restrain illegal construction or dispossession."
        }
      ],
      portal: "https://ecourts.gov.in",
      portalLabel: "e-Courts Case Status Portal"
    }
  };

  const current = guidanceData[selectedCategory];

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      
      {/* Title */}
      <div>
        <span className="text-xs font-bold text-gov-navy uppercase tracking-wider block mb-1">
          Citizen Action Roadmap
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          What Can I Do Next?
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
          Step-by-step practical guidance tailored to your situation. LawBot AI provides procedural clarity but does not claim jurisdiction.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Guidance categories">
        {Object.entries(guidanceData).map(([key, data]) => {
          const isSelected = selectedCategory === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedCategory(key)}
              role="tab"
              aria-selected={isSelected}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition border ${
                isSelected
                  ? 'bg-gov-navy text-white border-gov-navy shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {key === 'cyber' && 'Cyber Fraud'}
              {key === 'theft' && 'Theft'}
              {key === 'assault' && 'Assault / Injury'}
              {key === 'consumer' && 'Consumer Grievance'}
              {key === 'property' && 'Property Dispute'}
            </button>
          );
        })}
      </div>

      {/* Current Guidance Detail Card */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
        
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            {current.title}
          </h2>
          <span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300">
            {current.tag}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-3 rounded-lg border border-slate-200">
          {current.summary}
        </p>

        {/* Steps Roadmap */}
        <div className="space-y-3 pt-2">
          {current.steps.map((step: any, idx: number) => (
            <div key={idx} className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200 bg-white hover:border-gov-navy transition">
              <span className="w-6 h-6 rounded-full bg-gov-navy text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {step.title}
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Official Portal Link */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Authorized Public Redressal Service:
          </span>
          <a
            href={current.portal}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 text-gov-navy hover:bg-blue-100 rounded-lg text-xs font-bold transition border border-blue-200"
          >
            <span>{current.portalLabel}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>

    </div>
  );
};
