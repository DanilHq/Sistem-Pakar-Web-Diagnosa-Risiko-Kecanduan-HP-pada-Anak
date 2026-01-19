export interface Symptom {
  id?: number;
  code: string;
  text: string;
  help_text?: string;
  active: boolean;
}

export interface Rule {
  id?: number;
  code: string;
  conditions: string[]; // Array of symptom codes
  result: string; // Category code (K01, K02, K03, K04)
  priority: number; // 1 = highest priority
  description: string;
  recommendation: string;
  active: boolean;
}

export interface Category {
  id?: number;
  code: string;
  name: string;
  level: number; // 0=Normal, 1=Ringan, 2=Sedang, 3=Berat
  color: string;
  description: string;
}

export interface Article {
  id?: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id?: number;
  name: string;
  email: string;
  password_hash?: string;
  role: 'user' | 'admin';
  created_at?: string;
}

export interface Diagnosis {
  id?: number;
  user_id: number | null;
  selected_symptoms: string[]; // Array of symptom codes
  result: string; // Category code
  matched_rule_code: string | null;
  trace: RuleTrace[];
  created_at?: string;
}

export interface RuleTrace {
  rule_code: string;
  conditions: string[];
  matched: boolean;
  priority: number;
}

export interface DiagnosisRequest {
  user_id?: number;
  selected_symptoms: string[];
}

export interface DiagnosisResponse {
  result_code: string;
  matched_rule_code: string | null;
  matched_description?: string;
  recommendation?: string;
  trace: RuleTrace[];
  active_symptoms: string[];
  category?: Category;
}

export interface AuthRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}
