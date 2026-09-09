export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  phone_number?: string;
  city?: string;
  state?: string;
  language_pref: string;
  text_size_pref: string;
  created_at: string;
}

export interface CaseFact {
  id: number;
  case_id: number;
  fact_key: string;
  fact_value: string;
  confidence: number;
  is_extracted: boolean;
  source: string;
  created_at: string;
}

export interface CaseItem {
  id: number;
  user_id: number;
  title: string;
  category: string;
  status: 'draft' | 'in_progress' | 'ready_for_review' | 'closed';
  initial_description?: string;
  incident_date?: string;
  incident_time?: string;
  incident_location?: string;
  complainant_name?: string;
  suspect_info?: string;
  loss_damage?: string;
  completeness_score: number;
  emergency_flag: boolean;
  created_at: string;
  updated_at: string;
  facts?: CaseFact[];
  evidence_count?: number;
  legal_matches_count?: number;
  documents_count?: number;
}

export interface ChatMessage {
  id: number;
  session_id: number;
  role: 'assistant' | 'user' | 'system';
  content: string;
  step_number: number;
  question_id?: string;
  options?: string[];
  input_type?: string;
  created_at: string;
}

export interface ChatSession {
  id: number;
  case_id: number;
  current_step: number;
  total_steps: number;
  is_active: boolean;
  emergency_detected: boolean;
  messages: ChatMessage[];
  extracted_facts: Record<string, string>;
}

export interface EvidenceItem {
  id: number;
  case_id: number;
  user_id: number;
  original_filename: string;
  stored_filename: string;
  file_type: 'photo' | 'video' | 'audio' | 'document' | 'screenshot' | 'other';
  file_size: number;
  mime_type: string;
  description?: string;
  file_url?: string;
  created_at: string;
}

export interface LegalSection {
  id: string;
  act_id: string;
  act_short_code: string;
  section_number: string;
  title: string;
  category: string;
  description: string;
  simple_explanation: string;
  punishment?: string;
  bailable?: string;
  cognizable?: string;
  compoundable?: string;
  keywords: string[];
  source_url?: string;
  last_verified?: string;
}

export interface LegalMatch {
  id: number;
  case_id: number;
  section: LegalSection;
  relevance_score: number;
  reason_explanation: string;
  matched_facts: string[];
}

export interface LegalAnalysisResponse {
  case_id: number;
  status: string;
  case_category: string;
  completeness_score: number;
  possible_legal_areas: string[];
  possible_provisions: LegalMatch[];
  information_used: string[];
  information_still_needed: string[];
  recommended_next_steps: string[];
  disclaimer: string;
}

export interface GeneratedDocument {
  id: number;
  case_id: number;
  doc_type: 'police_complaint' | 'cybercrime_report' | 'consumer_notice' | 'incident_statement' | 'evidence_list' | 'chronology';
  title: string;
  content_markdown: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CaseReport {
  id: number;
  case_id: number;
  summary_text: string;
  completeness_score: number;
  used_facts: string[];
  missing_facts: string[];
  recommended_steps: string[];
  created_at: string;
}

export interface OfficialResourceItem {
  title: string;
  authority: string;
  phone: string;
  url: string;
  description: string;
  is_official: boolean;
}

export interface OfficialResourceCategory {
  category: string;
  items: OfficialResourceItem[];
}
