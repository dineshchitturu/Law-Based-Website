import axios from 'axios';
import {
  UserProfile, CaseItem, ChatSession, EvidenceItem,
  LegalAnalysisResponse, LegalSection, GeneratedDocument,
  CaseReport, OfficialResourceCategory
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('lawbot_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth
  demoLogin: async () => {
    const res = await apiClient.post<{ access_token: string; user: UserProfile }>('/api/auth/demo-login');
    localStorage.setItem('lawbot_token', res.data.access_token);
    return res.data;
  },
  login: async (email: string, password: string) => {
    const res = await apiClient.post<{ access_token: string; user: UserProfile }>('/api/auth/login', { email, password });
    localStorage.setItem('lawbot_token', res.data.access_token);
    return res.data;
  },
  register: async (userData: any) => {
    const res = await apiClient.post<{ access_token: string; user: UserProfile }>('/api/auth/register', userData);
    localStorage.setItem('lawbot_token', res.data.access_token);
    return res.data;
  },
  getProfile: async () => {
    const res = await apiClient.get<UserProfile>('/api/auth/me');
    return res.data;
  },
  updateProfile: async (data: Partial<UserProfile>) => {
    const res = await apiClient.put<UserProfile>('/api/auth/me', data);
    return res.data;
  },

  // Cases
  createCase: async (payload: { category: string; initial_description: string; title?: string; complainant_name?: string }) => {
    const res = await apiClient.post<CaseItem>('/api/cases', payload);
    return res.data;
  },
  listCases: async (params?: { status?: string; category?: string; search?: string }) => {
    const res = await apiClient.get<CaseItem[]>('/api/cases', { params });
    return res.data;
  },
  getCaseDetail: async (id: number) => {
    const res = await apiClient.get<CaseItem>(`/api/cases/${id}`);
    return res.data;
  },
  updateCase: async (id: number, payload: Partial<CaseItem>) => {
    const res = await apiClient.put<CaseItem>(`/api/cases/${id}`, payload);
    return res.data;
  },
  deleteCase: async (id: number) => {
    const res = await apiClient.delete(`/api/cases/${id}`);
    return res.data;
  },

  // Chat Intake
  startChat: async (case_id: number) => {
    const res = await apiClient.post<ChatSession>('/api/chat/start', { case_id });
    return res.data;
  },
  sendChatMessage: async (payload: { case_id: number; content: string; question_code?: string; is_skip?: boolean }) => {
    const res = await apiClient.post<ChatSession>('/api/chat/message', payload);
    return res.data;
  },
  getChatSession: async (case_id: number) => {
    const res = await apiClient.get<ChatSession>(`/api/chat/${case_id}`);
    return res.data;
  },

  // Evidence
  uploadEvidence: async (formData: FormData) => {
    const res = await apiClient.post<EvidenceItem>('/api/evidence/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  getCaseEvidence: async (case_id: number) => {
    const res = await apiClient.get<EvidenceItem[]>(`/api/evidence/case/${case_id}`);
    return res.data;
  },
  getAllEvidence: async () => {
    const res = await apiClient.get<EvidenceItem[]>('/api/evidence/all');
    return res.data;
  },
  deleteEvidence: async (id: number) => {
    const res = await apiClient.delete(`/api/evidence/${id}`);
    return res.data;
  },

  // Legal
  analyzeCase: async (case_id: number) => {
    const res = await apiClient.post<LegalAnalysisResponse>('/api/legal/analyze', { case_id });
    return res.data;
  },
  searchLaws: async (q: string) => {
    const res = await apiClient.get<{ query: string; total_results: number; results: LegalSection[] }>(`/api/legal/search?q=${encodeURIComponent(q)}`);
    return res.data;
  },
  getSectionDetail: async (id: string) => {
    const res = await apiClient.get<LegalSection>(`/api/legal/section/${id}`);
    return res.data;
  },
  getActs: async () => {
    const res = await apiClient.get<any[]>('/api/legal/acts');
    return res.data;
  },

  // Documents & Drafts
  generateDraft: async (payload: { case_id: number; doc_type: string }) => {
    const res = await apiClient.post<GeneratedDocument>('/api/documents/generate', payload);
    return res.data;
  },
  getCaseDocuments: async (case_id: number) => {
    const res = await apiClient.get<GeneratedDocument[]>(`/api/documents/case/${case_id}`);
    return res.data;
  },
  getDocument: async (id: number) => {
    const res = await apiClient.get<GeneratedDocument>(`/api/documents/${id}`);
    return res.data;
  },
  updateDocument: async (id: number, content_markdown: string) => {
    const res = await apiClient.put<GeneratedDocument>(`/api/documents/${id}`, { content_markdown });
    return res.data;
  },
  getCaseReport: async (case_id: number) => {
    const res = await apiClient.get<CaseReport>(`/api/documents/report/${case_id}`);
    return res.data;
  },

  // Resources & Helplines
  getOfficialResources: async () => {
    const res = await apiClient.get<OfficialResourceCategory[]>('/api/resources');
    return res.data;
  },
  checkEmergency: async (text: string) => {
    const res = await apiClient.post<{ is_emergency: boolean; message: string; helpline_numbers: any[] }>('/api/resources/check-emergency', { text });
    return res.data;
  },

  // History
  getHistory: async () => {
    const res = await apiClient.get<any[]>('/api/history');
    return res.data;
  },
  deleteHistoryItem: async (id: number) => {
    const res = await apiClient.delete(`/api/history/${id}`);
    return res.data;
  },
  clearHistory: async () => {
    const res = await apiClient.delete('/api/history/clear/all');
    return res.data;
  }
};
