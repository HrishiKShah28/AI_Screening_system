import React, { useState, useEffect } from 'react';
import type { QuestionData, AnswerResponse } from '../types';
import {
  Clock,
  BookOpen,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface InterviewConsoleProps {
  question: QuestionData;
  onSubmitAnswer: (answerText: string, timeTakenSeconds: number) => Promise<AnswerResponse>;
  onProceedNext: () => void;
  onCompleteInterview: () => void;
}

export const InterviewConsole: React.FC<InterviewConsoleProps> = ({
  question,
  onSubmitAnswer,
  onProceedNext,
  onCompleteInterview,
}) => {
  const [answerText, setAnswerText] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [evaluatedResult, setEvaluatedResult] = useState<AnswerResponse | null>(null);
  const [showCitation, setShowCitation] = useState(false);

  // Timer
  useEffect(() => {
    setSeconds(0);
    setAnswerText('');
    setEvaluatedResult(null);

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [question.question_id]);

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'advanced':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'beginner':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
  };

  const handleSubmit = async () => {
    if (!answerText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await onSubmitAnswer(answerText, seconds);
      setEvaluatedResult(res);
    } catch (err) {
      console.error('Failed to submit answer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const source = question.source_traceability;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Question {question.question_index} of {question.total_questions}
          </span>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${getDifficultyBadge(
              question.difficulty
            )}`}
          >
            {question.difficulty}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-slate-400 text-xs font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <Clock className="h-3.5 w-3.5 text-indigo-400" />
          <span>{formatTime(seconds)}</span>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md mb-6 shadow-xl">
        <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
          {question.topic}
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
          {question.question_text}
        </h2>

        {/* Grounded Citation Preview Accordion */}
        {source && source.book_title && (
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <button
              onClick={() => setShowCitation(!showCitation)}
              className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
              <span>
                Grounded in: <strong className="text-slate-200">{source.book_title}</strong>{' '}
                {source.page_number && `(p. ${source.page_number})`}
              </span>
              {showCitation ? (
                <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
              )}
            </button>

            {showCitation && (
              <div className="mt-3 p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans animate-fadeIn">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                  <span>Author: {source.author || 'Authoritative Technical Literature'}</span>
                  {source.similarity_score && (
                    <span className="text-emerald-400 font-mono">
                      Relevance: {(source.similarity_score * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
                <p className="italic text-slate-300/90">"{source.excerpt}"</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Answer Input or Evaluated Card */}
      {!evaluatedResult ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <label className="block text-xs font-semibold text-slate-400 mb-2">
            Your Technical Response:
          </label>
          <textarea
            rows={7}
            placeholder="Type your explanation detailing concepts, trade-offs, and implementation considerations..."
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            disabled={submitting}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans placeholder:text-slate-600"
          />

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {answerText.trim() ? `${answerText.trim().split(/\s+/).length} words` : '0 words'}
            </span>

            <button
              onClick={handleSubmit}
              disabled={submitting || !answerText.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Evaluating Response with Ground Truth...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Answer</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Instant Rubric Evaluation Card */
        <div className="bg-slate-900/90 border border-indigo-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Answer Evaluation</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Score:</span>
              <span className="text-xl font-extrabold text-indigo-400 font-mono">
                {evaluatedResult.evaluation.score}
                <span className="text-xs text-slate-500">/10</span>
              </span>
            </div>
          </div>

          {/* Metric Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 font-medium">Conceptual Accuracy</span>
                <span className="text-indigo-300 font-bold">{evaluatedResult.evaluation.conceptual_accuracy}/10</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${evaluatedResult.evaluation.conceptual_accuracy * 10}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 font-medium">Practical Depth</span>
                <span className="text-violet-300 font-bold">{evaluatedResult.evaluation.practical_depth}/10</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 transition-all duration-500"
                  style={{ width: `${evaluatedResult.evaluation.practical_depth * 10}%` }}
                />
              </div>
            </div>
          </div>

          {/* Qualitative Feedback */}
          <div className="mb-6 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-xs font-semibold text-slate-400 mb-1">Evaluator Feedback:</div>
            <p className="text-xs text-slate-300 leading-relaxed">{evaluatedResult.evaluation.feedback}</p>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs">
            <div>
              <div className="font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Strengths
              </div>
              <ul className="space-y-1.5 text-slate-300">
                {evaluatedResult.evaluation.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                Missing Nuances / Areas to Deepen
              </div>
              <ul className="space-y-1.5 text-slate-300">
                {evaluatedResult.evaluation.areas_for_improvement.map((gap, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action CTA */}
          <div className="flex justify-end pt-4 border-t border-slate-800">
            {evaluatedResult.next_action === 'FETCH_NEXT_QUESTION' ? (
              <button
                onClick={onProceedNext}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <span>Next Question</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={onCompleteInterview}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <span>Complete Interview & View Final Report</span>
                <TrendingUp className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
