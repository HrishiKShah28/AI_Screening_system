import React, { useState } from 'react';
import type { AssessmentReport } from '../types';
import {
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileCheck,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';

interface AssessmentReportViewProps {
  report: AssessmentReport;
  onReset: () => void;
}

export const AssessmentReportView: React.FC<AssessmentReportViewProps> = ({
  report,
  onReset,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const getRecommendationBadge = (rec: string) => {
    switch (rec) {
      case 'STRONG_HIRE':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 ring-1 ring-emerald-500/20',
          label: 'Strong Hire',
        };
      case 'HIRE':
        return {
          bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30 ring-1 ring-blue-500/20',
          label: 'Hire',
        };
      case 'LEANING_NO':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30 ring-1 ring-amber-500/20',
          label: 'Leaning No',
        };
      default:
        return {
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30 ring-1 ring-rose-500/20',
          label: 'No Hire',
        };
    }
  };

  const recBadge = getRecommendationBadge(report.recommendation);

  return (
    <div className="max-w-[1500px] w-full mx-auto py-10 px-4 sm:px-6 lg:px-10 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 mb-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2.5">
              <FileCheck className="h-4 w-4" />
              <span>Screening Assessment Completed</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {report.candidate_name || 'Candidate Evaluation'}
            </h1>
            <p className="text-base text-slate-400 mt-1.5 font-medium">{report.role_title}</p>
          </div>

          <div className="flex items-center gap-6 bg-slate-950/90 px-6 py-4 rounded-2xl border border-slate-800 shadow-xl">
            <div className="text-right">
              <div className="text-xs text-slate-400 uppercase font-semibold">Overall Rating</div>
              <div className="text-4xl font-black text-indigo-400 font-mono mt-0.5">
                {report.overall_score}
                <span className="text-base text-slate-500 font-normal">/10</span>
              </div>
            </div>
            <div className="h-12 w-[1px] bg-slate-800" />
            <div>
              <div className="text-xs text-slate-400 uppercase font-semibold mb-1.5">Decision</div>
              <span className={`text-sm font-bold px-4 py-1.5 rounded-xl border uppercase tracking-wider ${recBadge.bg}`}>
                {recBadge.label}
              </span>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mt-8 pt-8 border-t border-slate-800/80">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>Executive Assessment Summary</span>
          </div>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans max-w-5xl">
            {report.executive_summary}
          </p>
        </div>
      </div>

      {/* Dimensional Competencies Grid */}
      <div className="mb-10">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-indigo-400" />
          <span>Dimensional Competencies</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Conceptual Accuracy', value: report.competency_breakdown.conceptual_accuracy, color: 'bg-indigo-500' },
            { label: 'Applied Engineering', value: report.competency_breakdown.applied_engineering, color: 'bg-violet-500' },
            { label: 'Depth of Knowledge', value: report.competency_breakdown.depth_of_knowledge, color: 'bg-cyan-500' },
            { label: 'Communication Clarity', value: report.competency_breakdown.communication_clarity, color: 'bg-emerald-500' },
          ].map((comp, idx) => (
            <div key={idx} className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl shadow-lg">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-slate-400 font-medium">{comp.label}</span>
                <span className="text-white font-bold font-mono text-base">{comp.value}/10</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className={`h-full ${comp.color} rounded-full transition-all duration-700`}
                  style={{ width: `${comp.value * 10}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-7 sm:p-8 shadow-xl">
          <div className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            <span>Key Strengths</span>
          </div>
          <ul className="space-y-3 text-sm text-slate-300">
            {report.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="text-emerald-500 mt-1">•</span>
                <span className="leading-relaxed">{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-7 sm:p-8 shadow-xl">
          <div className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Actionable Areas for Growth</span>
          </div>
          <ul className="space-y-3 text-sm text-slate-300">
            {report.areas_for_improvement.map((gap, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="text-amber-500 mt-1">•</span>
                <span className="leading-relaxed">{gap}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Question-by-Question Audit Accordion */}
      <div className="mb-10">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-indigo-400" />
          <span>Detailed Question Audit & Grounded Proof</span>
        </h3>

        <div className="space-y-4">
          {report.questions_summary.map((q, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div
                key={idx}
                className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden transition-all shadow-md"
              >
                <div
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-900/90 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="h-8 w-8 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-xs font-bold font-mono">
                      Q{q.order}
                    </span>
                    <div>
                      <div className="text-xs text-indigo-400 font-semibold uppercase">{q.topic}</div>
                      <div className="text-sm sm:text-base font-semibold text-slate-200 mt-0.5 line-clamp-1">
                        {q.question}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-mono font-bold text-indigo-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                      {q.score}/10
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-slate-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-500" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-800/80 space-y-5 text-sm animate-fadeIn">
                    <div>
                      <div className="font-semibold text-slate-400 mb-1.5 text-xs uppercase tracking-wider">
                        Full Question Prompt:
                      </div>
                      <p className="text-slate-200 leading-relaxed bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                        {q.question}
                      </p>
                    </div>

                    <div>
                      <div className="font-semibold text-slate-400 mb-1.5 text-xs uppercase tracking-wider">
                        Candidate's Response:
                      </div>
                      <p className="text-slate-300 leading-relaxed bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                        {q.candidate_answer}
                      </p>
                    </div>

                    <div>
                      <div className="font-semibold text-slate-400 mb-1.5 text-xs uppercase tracking-wider">
                        Evaluator Feedback:
                      </div>
                      <p className="text-indigo-200 leading-relaxed bg-indigo-950/25 p-4 rounded-2xl border border-indigo-900/40">
                        {q.feedback}
                      </p>
                    </div>

                    {q.grounded_source && q.grounded_source.book_title && (
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-indigo-400" />
                          Grounded in:{' '}
                          <strong className="text-slate-200">{q.grounded_source.book_title}</strong>{' '}
                          {q.grounded_source.page_number && `(p. ${q.grounded_source.page_number})`}
                        </span>
                        {q.time_taken_seconds > 0 && (
                          <span className="font-mono text-slate-400 flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            Time taken: {q.time_taken_seconds}s
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-center pt-6">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-base font-semibold transition-all shadow-2xl shadow-indigo-600/30 cursor-pointer"
        >
          <RotateCcw className="h-5 w-5" />
          <span>Conduct Another Screening</span>
        </button>
      </div>
    </div>
  );
};
