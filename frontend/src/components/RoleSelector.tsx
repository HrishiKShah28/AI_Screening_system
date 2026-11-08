import React from 'react';
import type { Role } from '../types';
import { Cpu, Database, Server, Check, ArrowRight, BookOpen } from 'lucide-react';

interface RoleSelectorProps {
  roles: Role[];
  selectedRoleId: string;
  onSelectRole: (roleId: string) => void;
  onNext: () => void;
  loading: boolean;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  roles,
  selectedRoleId,
  onSelectRole,
  onNext,
  loading,
}) => {
  const getRoleIcon = (roleId: string) => {
    switch (roleId) {
      case 'ai_ml_engineer':
        return Cpu;
      case 'data_science_applied_ml':
        return Database;
      default:
        return Server;
    }
  };

  return (
    <div className="max-w-[1500px] w-full mx-auto py-10 px-4 sm:px-6 lg:px-10">
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Select Target Technical Role
        </h2>
        <p className="mt-3 text-base text-slate-400 max-w-2xl mx-auto">
          Choose the position to calibrate technical depth, syllabus topics, and textbook-grounded evaluation rubrics.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 rounded-2xl bg-slate-900 border border-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role) => {
            const Icon = getRoleIcon(role.id);
            const isSelected = selectedRoleId === role.id;

            return (
              <div
                key={role.id}
                onClick={() => onSelectRole(role.id)}
                className={`relative flex flex-col justify-between p-7 rounded-2xl cursor-pointer transition-all duration-200 border ${
                  isSelected
                    ? 'bg-slate-900/95 border-indigo-500 shadow-2xl shadow-indigo-500/15 ring-2 ring-indigo-500/30'
                    : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/70 hover:shadow-lg'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-5 right-5 h-7 w-7 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-md">
                    <Check className="h-4 w-4" />
                  </div>
                )}

                <div>
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-5 ${
                    isSelected ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <Icon className="h-7 w-7" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{role.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6">{role.description}</p>
                </div>

                <div>
                  <div className="pt-5 border-t border-slate-800/80">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                      Evaluated Syllabus Topics
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {role.primary_topics.map((topic, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2.5 py-1 rounded-md bg-slate-800/90 text-slate-300 border border-slate-700/60 font-medium"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-12 flex justify-end">
        <button
          onClick={onNext}
          disabled={!selectedRoleId || loading}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-xl shadow-indigo-600/25 cursor-pointer"
        >
          <span>Proceed to Resume Ingestion</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
