import axios from 'axios';
import type {
  Role,
  ResumeData,
  SessionData,
  NextQuestionResult,
  AnswerResponse,
  AssessmentReport,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiClient = {
  // Roles
  async getRoles(): Promise<Role[]> {
    const res = await api.get<{ roles: Role[] }>('/roles');
    return res.data.roles;
  },

  // Resumes
  async uploadResumePdf(file: File): Promise<ResumeData> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<ResumeData>('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async parseResumeText(rawText: string, candidateName?: string): Promise<ResumeData> {
    const res = await api.post<ResumeData>('/resumes/parse-text', {
      raw_text: rawText,
      candidate_name: candidateName,
    });
    return res.data;
  },

  // Interview Sessions
  async createSession(resumeId: string, roleId: string, totalQuestions = 5): Promise<SessionData> {
    const res = await api.post<SessionData>('/interviews/sessions', {
      resume_id: resumeId,
      role_id: roleId,
      total_questions: totalQuestions,
    });
    return res.data;
  },

  async getNextQuestion(sessionId: string): Promise<NextQuestionResult> {
    const res = await api.post<NextQuestionResult>(`/interviews/sessions/${sessionId}/questions/next`);
    return res.data;
  },

  async submitAnswer(
    sessionId: string,
    questionId: string,
    answerText: string,
    timeTakenSeconds: number
  ): Promise<AnswerResponse> {
    const res = await api.post<AnswerResponse>(`/interviews/sessions/${sessionId}/answers`, {
      question_id: questionId,
      answer_text: answerText,
      time_taken_seconds: timeTakenSeconds,
    });
    return res.data;
  },

  async completeSession(sessionId: string): Promise<{ session_id: string; status: string; report_url: string }> {
    const res = await api.post(`/interviews/sessions/${sessionId}/complete`);
    return res.data;
  },

  async getAssessmentReport(sessionId: string): Promise<AssessmentReport> {
    const res = await api.get<AssessmentReport>(`/interviews/sessions/${sessionId}/report`);
    return res.data;
  },
};
