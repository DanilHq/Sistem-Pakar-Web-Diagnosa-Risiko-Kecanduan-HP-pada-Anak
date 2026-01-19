export interface Symptom {
  id: number;
  code: string;
  text: string;
  help_text?: string;
  active?: boolean;
}

export interface Rule {
  id: number;
  code: string;
  conditions: string[];
  result: string;
  priority: number;
  description: string;
  recommendation: string;
  active: boolean;
}

export interface Category {
  id: number;
  code: string;
  name: string;
  level: number;
  color: string;
  description: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
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
  diagnosis_id: number;
  result_code: string;
  matched_rule_code: string | null;
  matched_description?: string;
  recommendation?: string;
  trace: RuleTrace[];
  active_symptoms: string[];
  category?: Category;
  message: string;
}

export interface Diagnosis {
  id: number;
  user_id: number | null;
  selected_symptoms: string[];
  result: string;
  matched_rule_code: string | null;
  trace: RuleTrace[];
  created_at: string;
  category?: Category;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Statistics {
  users: {
    total: number;
  };
  diagnoses: {
    total: number;
    recent_7_days: number;
    distribution: Array<{ code: string; name: string; count: number }>;
  };
  symptoms: {
    active: number;
    top_10: Array<{ code: string; count: number }>;
  };
  rules: {
    active: number;
  };
  articles: {
    published: number;
  };
}
