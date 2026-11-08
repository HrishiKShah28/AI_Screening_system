import React from 'react';
import { Bot, CheckCircle, FileText, Award, ChevronRight } from 'lucide-react';

interface NavbarProps {
  currentStep: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentStep }) => {
  const steps = [
    { num: 1, label: 'Role Selection', icon: Bot },
    { num: 2, label: 'Resume Ingestion', icon: FileText },
    { num: 3, label: 'Interactive Screening', icon: CheckCircle },
    { num: 4, label: 'Assessment Report', icon: Award },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-[1500px] w-full mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              PG-AGI Screening System
              <span className="text-[10px] font-semibold tracking-wider uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                RAG Grounded
              </span>
            </h1>
            <p className="text-xs text-slate-400">AI/ML & Backend Candidate Evaluation</p>
          </div>
        </div>

        {/* Step Indicator */}
        <nav className="hidden md:flex items-center space-x-3">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isActive = currentStep === s.num;
            const isCompleted = currentStep > s.num;
            return (
              <React.Fragment key={s.num}>
                <div
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                      : isCompleted
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : 'text-slate-500'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-indigo-400' : isCompleted ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span>{s.label}</span>
                </div>
                {idx < steps.length - 1 && (
                  <ChevronRight className="h-3 w-3 text-slate-700" />
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
