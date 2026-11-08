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
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          Select Target Technical Role
        </h2>
        <p className="mt-3 text-sm text-slate-400 max-w-xl mx-auto">
          Choose the position to calibrate technical depth, syllabus topics, and textbook-grounded evaluation rubrics.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-900 border border-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = getRoleIcon(role.id);
            const isSelected = selectedRoleId === role.id;

            return (
              <div
                key={role.id}
                onClick={() => onSelectRole(role.id)}
                className={`relative flex flex-col justify-between p-6 rounded-2xl cursor-pointer transition-all duration-200 border ${
                  isSelected
                    ? 'bg-slate-900/90 border-indigo-500 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-500/20'
                    : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-md">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                )}

                <div>
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${
                    isSelected ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{role.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">{role.description}</p>
                </div>

                <div>
                  <div className="pt-4 border-t border-slate-800/80">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <BookOpen className="h-3 w-3 text-indigo-400" />
                      Evaluated Topics
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {role.primary_topics.slice(0, 3).map((topic, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/50"
                        >
                          {topic}
                        </span>
                      ))}
                      {role.primary_topics.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md text-slate-500">
                          +{role.primary_topics.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-10 flex justify-end">
        <button
          onClick={onNext}
          disabled={!selectedRoleId || loading}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          <span>Proceed to Resume Ingestion</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
