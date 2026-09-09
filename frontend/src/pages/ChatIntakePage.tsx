import React, { useEffect, useState, useRef } from 'react';
import {
  Send, ArrowRight, ShieldCheck, AlertCircle, FileCheck,
  ChevronRight, Sparkles, AlertOctagon, RotateCcw
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { api } from '../services/api';
import { ChatSession, ChatMessage } from '../types';
import { ChatBubble } from '../components/chat/ChatBubble';
import { QuestionOption } from '../components/chat/QuestionOption';
import { FactCard } from '../components/chat/FactCard';
import { LoadingState } from '../components/common/LoadingState';
import { EmergencyAlert } from '../components/common/EmergencyAlert';

export const ChatIntakePage: React.FC<{
  caseId: number;
  onProceedToEvidence: () => void;
  onProceedToReview: () => void;
}> = ({ caseId, onProceedToEvidence, onProceedToReview }) => {
  const { t } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [session, setSession] = useState<ChatSession | null>(null);
  const [inputText, setInputText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [caseCategory, setCaseCategory] = useState<string>('Theft');
  const [emergencyActive, setEmergencyActive] = useState<boolean>(false);

  // Auto scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const initChat = async () => {
      try {
        const caseDetail = await api.getCaseDetail(caseId);
        setCaseCategory(caseDetail.category);
        setEmergencyActive(caseDetail.emergency_flag);

        const chatSession = await api.startChat(caseId);
        setSession(chatSession);
      } catch (err) {
        console.error('Failed to init chat session:', err);
      } finally {
        setLoading(false);
      }
    };
    initChat();
  }, [caseId]);

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages]);

  // Find the last assistant message with an active question
  const lastAssistantMsg = session?.messages
    ?.slice()
    ?.reverse()
    ?.find((m) => m.role === 'assistant' && m.question_id);

  const isCompleted = session?.messages?.some((m) => m.input_type === 'completed');

  const handleSend = async (contentToSend?: string, isSkip: boolean = false) => {
    const text = contentToSend !== undefined ? contentToSend : inputText.trim();
    if (!text && !isSkip) return;

    setSending(true);
    try {
      const qCode = lastAssistantMsg?.question_id;
      const updatedSession = await api.sendChatMessage({
        case_id: caseId,
        content: text,
        question_code: qCode,
        is_skip: isSkip
      });
      setSession(updatedSession);
      if (updatedSession.emergency_detected) {
        setEmergencyActive(true);
      }
      setInputText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <LoadingState message="Connecting to Case Information Assistant..." />;
  }

  const currentStep = session?.current_step || 1;
  const totalSteps = session?.total_steps || 6;
  const progressPercent = Math.min(100, Math.round((currentStep / totalSteps) * 100));

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto px-3 sm:px-4">
      
      {/* Top Assistant Header & Progress Bar */}
      <div className="bg-white border-b border-slate-200 py-3 px-4 rounded-t-xl shadow-2xs">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <h2 className="text-xs sm:text-sm font-extrabold text-gov-navy uppercase tracking-wide">
              {t('chat.headerTitle')} ({caseCategory})
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {t('chat.stepProgress', { current: currentStep, total: totalSteps })}
          </span>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gov-navy h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Emergency Alert if active */}
      {emergencyActive && (
        <div className="px-1 py-1">
          <EmergencyAlert onDismiss={() => setEmergencyActive(false)} />
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50 border-x border-slate-200">
        
        {/* Real-time Extracted Facts Card */}
        {session?.extracted_facts && Object.keys(session.extracted_facts).length > 0 && (
          <FactCard facts={session.extracted_facts} category={caseCategory} />
        )}

        {/* Message Stream */}
        {session?.messages?.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {/* Display Current Question Options if available and not completed */}
        {!isCompleted && lastAssistantMsg?.options && lastAssistantMsg.options.length > 0 && (
          <QuestionOption
            options={lastAssistantMsg.options}
            onSelect={(opt) => handleSend(opt, false)}
            disabled={sending}
          />
        )}

        {/* Completed Intake Action Bar */}
        {isCompleted && (
          <div className="my-6 p-4 bg-white border-2 border-emerald-500 rounded-xl shadow-xs text-center space-y-3">
            <h3 className="text-base font-bold text-slate-900">
              Information Gathering Completed!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              We have compiled your answers. You can now add supporting evidence or review your case summary.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={onProceedToEvidence}
                className="w-full sm:w-auto px-5 py-2.5 bg-gov-navy text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-blue-900 transition flex items-center justify-center gap-1.5"
              >
                <span>Add Evidence (Photos / Bills)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onProceedToReview}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 text-slate-800 border border-slate-300 text-xs sm:text-sm font-bold rounded-lg hover:bg-slate-200 transition"
              >
                <span>Review Case & Legal Options</span>
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Footer */}
      {!isCompleted ? (
        <div className="bg-white border border-slate-200 rounded-b-xl p-3 shadow-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t('chat.inputPlaceholder')}
              disabled={sending}
              className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-navy bg-slate-50/50"
            />

            <button
              type="submit"
              disabled={sending || !inputText.trim()}
              className="px-4 py-2.5 bg-gov-navy text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-blue-900 active:scale-98 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-2xs"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">{t('chat.sendBtn')}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSend(undefined, true)}
              disabled={sending}
              className="px-3 py-2.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg font-semibold transition flex-shrink-0"
              title="Skip this question"
            >
              {t('chat.skipBtn')}
            </button>
          </form>

          {/* Quick jump to review if user already answered enough */}
          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[11px] text-slate-400">
            <span>One question at a time. No legal terminology required.</span>
            <button
              type="button"
              onClick={onProceedToReview}
              className="text-gov-navy font-bold hover:underline"
            >
              Skip to Review & Legal Analysis &rarr;
            </button>
          </div>
        </div>
      ) : null}

    </div>
  );
};
