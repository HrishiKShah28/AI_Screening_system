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
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          label: 'Strong Hire',
        };
      case 'HIRE':
        return {
          bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          label: 'Hire',
        };
      case 'LEANING_NO':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          label: 'Leaning No',
        };
      default:
        return {
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          label: 'No Hire',
        };
    }
  };

  const recBadge = getRecommendationBadge(report.recommendation);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
              <FileCheck className="h-4 w-4" />
              <span>Screening Assessment Completed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {report.candidate_name || 'Candidate Evaluation'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">{report.role_title}</p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Overall Rating</div>
              <div className="text-3xl font-black text-indigo-400 font-mono">
                {report.overall_score}
                <span className="text-sm text-slate-500">/10</span>
              </div>
            </div>
            <div className="h-10 w-[1px] bg-slate-800" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold mb-1">Decision</div>
              <span className={`text-xs font-bold px-3 py-1 rounded-lg border uppercase tracking-wider ${recBadge.bg}`}>
                {recBadge.label}
              </span>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mt-6 pt-6 border-t border-slate-800/80">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Executive Summary
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            {report.executive_summary}
          </p>
        </div>
      </div>

      {/* Competency Breakdown Grid */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-indigo-400" />
          <span>Dimensional Competencies</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Conceptual Accuracy', value: report.competency_breakdown.conceptual_accuracy, color: 'bg-indigo-500' },
            { label: 'Applied Engineering', value: report.competency_breakdown.applied_engineering, color: 'bg-violet-500' },
            { label: 'Depth of Knowledge', value: report.competency_breakdown.depth_of_knowledge, color: 'bg-cyan-500' },
            { label: 'Communication Clarity', value: report.competency_breakdown.communication_clarity, color: 'bg-emerald-500' },
          ].map((comp, idx) => (
            <div key={idx} className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-400 font-medium">{comp.label}</span>
                <span className="text-white font-bold font-mono">{comp.value}/10</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span>Key Strengths</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {report.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span className="leading-relaxed">{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Actionable Areas for Growth</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {report.areas_for_improvement.map((gap, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <span className="leading-relaxed">{gap}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Question-by-Question Audit Accordion */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-indigo-400" />
          <span>Detailed Question Audit & Grounded Proof</span>
        </h3>

        <div className="space-y-4">
          {report.questions_summary.map((q, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div
                key={idx}
                className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden transition-all"
              >
                <div
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-900/90 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-xs font-bold font-mono">
                      Q{q.order}
                    </span>
                    <div>
                      <div className="text-[11px] text-slate-400 font-semibold uppercase">{q.topic}</div>
                      <div className="text-xs sm:text-sm font-semibold text-slate-200 mt-0.5 line-clamp-1">
                        {q.question}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono font-bold text-indigo-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      {q.score}/10
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-500" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-4 text-xs animate-fadeIn">
                    <div>
                      <div className="font-semibold text-slate-400 mb-1">Full Question:</div>
                      <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                        {q.question}
                      </p>
                    </div>

                    <div>
                      <div className="font-semibold text-slate-400 mb-1">Candidate's Response:</div>
                      <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                        {q.candidate_answer}
                      </p>
                    </div>

                    <div>
                      <div className="font-semibold text-slate-400 mb-1">Evaluator Feedback:</div>
                      <p className="text-indigo-300 leading-relaxed bg-indigo-950/20 p-3 rounded-xl border border-indigo-900/30">
                        {q.feedback}
                      </p>
                    </div>

                    {q.grounded_source && q.grounded_source.book_title && (
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                          Grounded in:{' '}
                          <strong className="text-slate-200">{q.grounded_source.book_title}</strong>{' '}
                          {q.grounded_source.page_number && `(p. ${q.grounded_source.page_number})`}
                        </span>
                        {q.time_taken_seconds > 0 && (
                          <span className="font-mono text-slate-500">
                            Time: {q.time_taken_seconds}s
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
      <div className="flex justify-center pt-4">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-xl shadow-indigo-600/25 cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Conduct Another Screening</span>
        </button>
      </div>
    </div>
  );
};
