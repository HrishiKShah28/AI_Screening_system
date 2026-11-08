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
  HelpCircle,
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
  const [showCitation, setShowCitation] = useState(true);

  // Reset state on question change
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
    <div className="max-w-[1500px] w-full mx-auto py-10 px-4 sm:px-6 lg:px-10">
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 uppercase tracking-wider">
            Question {question.question_index} of {question.total_questions}
          </span>
          <span
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border uppercase tracking-wider ${getDifficultyBadge(
              question.difficulty
            )}`}
          >
            {question.difficulty}
          </span>
          {question.target_competency && (
            <span className="hidden md:inline-block text-xs text-slate-400 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              Evaluating: <strong className="text-slate-200">{question.target_competency}</strong>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2 text-slate-300 text-xs font-mono bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 shadow-inner">
          <Clock className="h-4 w-4 text-indigo-400" />
          <span className="text-sm font-semibold">{formatTime(seconds)}</span>
        </div>
      </div>

      {/* Main 2-Column Cockpit Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Question & Grounded Context */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-7 sm:p-8 backdrop-blur-md shadow-xl">
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">
              {question.topic}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
              {question.question_text}
            </h2>

            {/* Grounded Citation Preview Box */}
            {source && source.book_title && (
              <div className="mt-6 pt-5 border-t border-slate-800">
                <button
                  onClick={() => setShowCitation(!showCitation)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-indigo-400" />
                    <span>Authoritative Textbook Citation</span>
                  </span>
                  {showCitation ? (
                    <ChevronUp className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  )}
                </button>

                {showCitation && (
                  <div className="mt-3 p-5 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans shadow-inner">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 pb-2 border-b border-slate-900">
                      <span className="font-semibold text-slate-200">
                        {source.book_title} {source.page_number && `(p. ${source.page_number})`}
                      </span>
                      {source.similarity_score && (
                        <span className="text-emerald-400 font-mono text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Match: {(source.similarity_score * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                    {source.author && (
                      <div className="text-[10px] text-slate-500 mb-2">Author: {source.author}</div>
                    )}
                    <p className="italic text-slate-300/90 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-900">
                      "{source.excerpt}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Answering Guidance Card */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-300">
              <HelpCircle className="h-4 w-4 text-indigo-400" />
              <span>Assessment Guidance</span>
            </div>
            <p className="leading-relaxed">
              Your answer will be objectively graded against the textbook reference. Address both the conceptual mechanism and practical implementation trade-offs for full marks.
            </p>
          </div>
        </div>

        {/* Right Column: Answer Input OR Instant Rubric Evaluation */}
        <div className="lg:col-span-7">
          {!evaluatedResult ? (
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-7 sm:p-8 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Your Technical Response
                </label>
                <span className="text-xs text-slate-500 font-mono">
                  {answerText.trim() ? `${answerText.trim().split(/\s+/).length} words` : '0 words'}
                </span>
              </div>

              <textarea
                rows={11}
                placeholder="Type your explanation detailing concepts, trade-offs, and implementation considerations..."
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                disabled={submitting}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans placeholder:text-slate-600 shadow-inner"
              />

              <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-800">
                <span className="text-xs text-slate-500">
                  Take your time to structure your thoughts clearly.
                </span>

                <button
                  onClick={handleSubmit}
                  disabled={submitting || !answerText.trim()}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-xl shadow-indigo-600/25 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Evaluating Response with Ground Truth...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Answer</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Instant Rubric Evaluation Card */
            <div className="bg-slate-900/95 border border-indigo-500/40 rounded-3xl p-7 sm:p-8 shadow-2xl animate-fadeIn">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-6 w-6 text-indigo-400" />
                  <div>
                    <h3 className="text-lg font-bold text-white">Answer Evaluation</h3>
                    <p className="text-xs text-slate-400">Grounded against textbook reference</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Score:</span>
                  <span className="text-2xl font-black text-indigo-400 font-mono">
                    {evaluatedResult.evaluation.score}
                    <span className="text-sm text-slate-500 font-normal">/10</span>
                  </span>
                </div>
              </div>

              {/* Metric Breakdown Progress Bars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-400 font-medium">Conceptual Accuracy</span>
                    <span className="text-indigo-300 font-bold font-mono">
                      {evaluatedResult.evaluation.conceptual_accuracy}/10
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 transition-all duration-500"
                      style={{ width: `${evaluatedResult.evaluation.conceptual_accuracy * 10}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-400 font-medium">Practical Depth</span>
                    <span className="text-violet-300 font-bold font-mono">
                      {evaluatedResult.evaluation.practical_depth}/10
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 transition-all duration-500"
                      style={{ width: `${evaluatedResult.evaluation.practical_depth * 10}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Qualitative Feedback */}
              <div className="mb-6 p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Evaluator Feedback:
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-sans">
                  {evaluatedResult.evaluation.feedback}
                </p>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6 text-xs">
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  <div className="font-bold text-emerald-400 mb-2.5 flex items-center gap-1.5 uppercase tracking-wider">
                    <CheckCircle2 className="h-4 w-4" />
                    Strengths
                  </div>
                  <ul className="space-y-2 text-slate-300">
                    {evaluatedResult.evaluation.strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-500 mt-0.5">•</span>
                        <span className="leading-relaxed">{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  <div className="font-bold text-amber-400 mb-2.5 flex items-center gap-1.5 uppercase tracking-wider">
                    <AlertTriangle className="h-4 w-4" />
                    Missing Nuances / Gaps
                  </div>
                  <ul className="space-y-2 text-slate-300">
                    {evaluatedResult.evaluation.areas_for_improvement.map((gap, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span className="leading-relaxed">{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action CTA */}
              <div className="flex justify-end pt-5 border-t border-slate-800">
                {evaluatedResult.next_action === 'FETCH_NEXT_QUESTION' ? (
                  <button
                    onClick={onProceedNext}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-xl shadow-indigo-600/25 cursor-pointer"
                  >
                    <span>Proceed to Next Question</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={onCompleteInterview}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all shadow-xl shadow-emerald-600/25 cursor-pointer"
                  >
                    <span>Complete Interview & View Final Report</span>
                    <TrendingUp className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
