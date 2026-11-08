import { useState, useEffect } from 'react';
import type { Role, ResumeData, SessionData, QuestionData, AssessmentReport } from './types';
import { apiClient } from './api/client';
import { Navbar } from './components/Navbar';
import { RoleSelector } from './components/RoleSelector';
import { ResumeUpload } from './components/ResumeUpload';
import { InterviewConsole } from './components/InterviewConsole';
import { AssessmentReportView } from './components/AssessmentReportView';
import { AlertCircle, Loader2 } from 'lucide-react';

export function App() {
  const [step, setStep] = useState<number>(1);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('ai_ml_engineer');
  const [parsedResume, setParsedResume] = useState<ResumeData | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [report, setReport] = useState<AssessmentReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load available roles on initial mount
  useEffect(() => {
    const loadRoles = async () => {
      setLoading(true);
      try {
        const fetchedRoles = await apiClient.getRoles();
        setRoles(fetchedRoles);
        if (fetchedRoles.length > 0) {
          setSelectedRoleId(fetchedRoles[0].id);
        }
      } catch (err: any) {
        console.error('Failed to load roles:', err);
        setError('Failed to connect to backend server. Make sure FastAPI is running on port 8000.');
      } finally {
        setLoading(false);
      }
    };
    loadRoles();
  }, []);

  // Handler: Start Interview Session
  const handleStartInterview = async () => {
    if (!parsedResume || !selectedRoleId) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Create interview session
      const newSession = await apiClient.createSession(parsedResume.id, selectedRoleId, 3);
      setSession(newSession);

      // 2. Fetch first question
      const qResult = await apiClient.getNextQuestion(newSession.session_id);
      if (qResult.question) {
        setCurrentQuestion(qResult.question);
        setStep(3);
      } else {
        setError(qResult.message || 'Failed to generate initial question.');
      }
    } catch (err: any) {
      console.error('Error starting interview session:', err);
      setError(err.response?.data?.message || 'Failed to initialize session.');
    } finally {
      setLoading(false);
    }
  };

  // Handler: Submit Answer
  const handleSubmitAnswer = async (answerText: string, timeTakenSeconds: number) => {
    if (!session || !currentQuestion) {
      throw new Error('No active session or question');
    }
    return await apiClient.submitAnswer(
      session.session_id,
      currentQuestion.question_id,
      answerText,
      timeTakenSeconds
    );
  };

  // Handler: Proceed to Next Question
  const handleProceedNextQuestion = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const qResult = await apiClient.getNextQuestion(session.session_id);
      if (qResult.status === 'QUESTION_GENERATED' && qResult.question) {
        setCurrentQuestion(qResult.question);
      } else {
        await handleCompleteInterview();
      }
    } catch (err: any) {
      console.error('Failed to fetch next question:', err);
      setError('Failed to fetch next question.');
    } finally {
      setLoading(false);
    }
  };

  // Handler: Complete Interview & Generate Report
  const handleCompleteInterview = async () => {
    if (!session) return;
    setLoading(true);
    try {
      await apiClient.completeSession(session.session_id);
      const rep = await apiClient.getAssessmentReport(session.session_id);
      setReport(rep);
      setStep(4);
    } catch (err: any) {
      console.error('Failed to complete interview:', err);
      setError('Failed to generate final report.');
    } finally {
      setLoading(false);
    }
  };

  // Handler: Reset Entire Workflow
  const handleReset = () => {
    setParsedResume(null);
    setSession(null);
    setCurrentQuestion(null);
    setReport(null);
    setError(null);
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar currentStep={step} />

      <main className="flex-1">
        {error && (
          <div className="max-w-4xl mx-auto px-4 mt-6">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-rose-400 hover:text-rose-300 font-bold ml-4 cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {loading && step === 3 && !currentQuestion && (
          <div className="max-w-4xl mx-auto py-24 px-4 text-center">
            <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white">Synthesizing Grounded Question...</h3>
            <p className="text-xs text-slate-400 mt-1">
              Querying role textbook corpus and formulating tailored technical assessment scenario.
            </p>
          </div>
        )}

        {step === 1 && (
          <RoleSelector
            roles={roles}
            selectedRoleId={selectedRoleId}
            onSelectRole={setSelectedRoleId}
            onNext={() => setStep(2)}
            loading={loading && roles.length === 0}
          />
        )}

        {step === 2 && (
          <ResumeUpload
            onBack={() => setStep(1)}
            onResumeParsed={setParsedResume}
            onStartInterview={handleStartInterview}
            parsedResume={parsedResume}
          />
        )}

        {step === 3 && currentQuestion && (
          <InterviewConsole
            question={currentQuestion}
            onSubmitAnswer={handleSubmitAnswer}
            onProceedNext={handleProceedNextQuestion}
            onCompleteInterview={handleCompleteInterview}
          />
        )}

        {step === 4 && report && (
          <AssessmentReportView
            report={report}
            onReset={handleReset}
          />
        )}
      </main>

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>AI-Powered Role-Based Candidate Screening System • PG-AGI 48-Hour Assignment</p>
      </footer>
    </div>
  );
}

export default App;
