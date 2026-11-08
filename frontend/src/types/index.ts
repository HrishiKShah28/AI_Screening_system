export interface Role {
  id: string;
  title: string;
  description: string;
  primary_topics: string[];
}

export interface ExtractedData {
  summary?: string;
  skills: string[];
  technologies: string[];
  domain_exposure: string[];
  experience_level?: string;
}

export interface ResumeData {
  id: string;
  filename: string;
  candidate_name?: string;
  email?: string;
  extracted_data: ExtractedData;
  created_at: string;
}

export interface SessionData {
  session_id: string;
  candidate_id: string;
  role_id: string;
  role_title: string;
  status: string;
  total_questions: number;
  current_question_index: number;
  created_at: string;
}

export interface SourceTraceability {
  book_title: string;
  author?: string;
  chapter?: string;
  page_number?: number;
  chunk_id?: string;
  similarity_score?: number;
  excerpt?: string;
}

export interface QuestionData {
  question_id: string;
  session_id: string;
  question_index: number;
  total_questions: number;
  question_text: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  target_competency?: string;
  source_traceability: SourceTraceability;
}

export interface NextQuestionResult {
  status: 'QUESTION_GENERATED' | 'ALL_QUESTIONS_COMPLETED';
  question?: QuestionData;
  message?: string;
}

export interface EvaluationDetail {
  score: number;
  conceptual_accuracy: number;
  practical_depth: number;
  feedback: string;
  strengths: string[];
  areas_for_improvement: string[];
}

export interface AnswerResponse {
  answer_id: string;
  question_id: string;
  status: string;
  evaluation: EvaluationDetail;
  next_action: 'FETCH_NEXT_QUESTION' | 'COMPLETE_SESSION';
}

export interface CompetencyBreakdown {
  conceptual_accuracy: number;
  applied_engineering: number;
  depth_of_knowledge: number;
  communication_clarity: number;
}

export interface QuestionReportItem {
  order: number;
  question: string;
  topic: string;
  candidate_answer: string;
  time_taken_seconds: number;
  score: number;
  feedback: string;
  grounded_source: SourceTraceability;
}

export interface AssessmentReport {
  session_id: string;
  candidate_name: string;
  role_id: string;
  role_title: string;
  overall_score: number;
  recommendation: 'STRONG_HIRE' | 'HIRE' | 'LEANING_NO' | 'NO_HIRE';
  executive_summary: string;
  competency_breakdown: CompetencyBreakdown;
  strengths: string[];
  areas_for_improvement: string[];
  questions_summary: QuestionReportItem[];
}
