import React, { useState, useRef } from 'react';
import type { ResumeData } from '../types';
import { apiClient } from '../api/client';
import { UploadCloud, FileText, AlertCircle, ArrowLeft, ArrowRight, Loader2, Sparkles, User, Briefcase, Mail } from 'lucide-react';

interface ResumeUploadProps {
  onBack: () => void;
  onResumeParsed: (resume: ResumeData) => void;
  onStartInterview: () => void;
  parsedResume: ResumeData | null;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({
  onBack,
  onResumeParsed,
  onStartInterview,
  parsedResume,
}) => {
  const [tab, setTab] = useState<'upload' | 'paste'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a valid PDF document.');
      return;
    }
    setError(null);
    setFile(selectedFile);
    setLoading(true);

    try {
      const data = await apiClient.uploadResumePdf(selectedFile);
      onResumeParsed(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to parse resume PDF. Please try pasting text.');
    } finally {
      setLoading(false);
    }
  };

  const handleTextSubmit = async () => {
    if (pastedText.trim().length < 30) {
      setError('Please provide at least 30 characters of resume content.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await apiClient.parseResumeText(pastedText, candidateName || undefined);
      onResumeParsed(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to extract resume entities.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1500px] w-full mx-auto py-10 px-4 sm:px-6 lg:px-10">
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Candidate Resume Ingestion
        </h2>
        <p className="mt-3 text-base text-slate-400 max-w-2xl mx-auto">
          Upload your resume PDF or paste your credentials. The system parses your background to dynamically formulate grounded interview scenarios.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Upload Controls */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-3xl p-7 sm:p-8 backdrop-blur-sm shadow-xl">
          {/* Tab Selection */}
          <div className="flex border-b border-slate-800 mb-6 pb-3 space-x-8 text-sm">
            <button
              onClick={() => setTab('upload')}
              className={`pb-2 font-medium cursor-pointer transition-colors relative ${
                tab === 'upload' ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Upload PDF File
              {tab === 'upload' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />}
            </button>
            <button
              onClick={() => setTab('paste')}
              className={`pb-2 font-medium cursor-pointer transition-colors relative ${
                tab === 'paste' ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Direct Text Input
              {tab === 'paste' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {tab === 'upload' ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-slate-700/80 hover:border-slate-600 bg-slate-950/50'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileInput}
              />
              <div className="h-16 w-16 rounded-full bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center mb-4 shadow-inner">
                <UploadCloud className="h-8 w-8" />
              </div>
              <p className="text-base font-semibold text-slate-200">
                {file ? file.name : 'Click to select or drag & drop resume PDF'}
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Supports standard PDF resumes up to 10MB
              </p>
              {file && (
                <div className="mt-3 text-xs text-indigo-400 font-mono">
                  {(file.size / 1024).toFixed(1)} KB • Ready to parse
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Candidate Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Resume Content
                </label>
                <textarea
                  rows={9}
                  placeholder="Paste experience, skills, frameworks, and education..."
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>
              <button
                onClick={handleTextSubmit}
                disabled={loading || pastedText.length < 30}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Extract Profile & Technical Skills</span>
              </button>
            </div>
          )}

          {loading && (
            <div className="mt-6 p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 flex items-center justify-center gap-3 text-sm text-indigo-300 font-medium">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
              <span>Analyzing resume entities & technical competencies via LLM...</span>
            </div>
          )}
        </div>

        {/* Right Side: Parsed Entities Preview */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-3xl p-7 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Parsed Candidate Profile
              </h3>
            </div>
            {parsedResume && (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Verified
              </span>
            )}
          </div>

          {parsedResume ? (
            <div className="space-y-6">
              {/* Candidate Info Card */}
              <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-base font-bold text-white">
                      <User className="h-4 w-4 text-indigo-400" />
                      <span>{parsedResume.candidate_name || 'Applicant'}</span>
                    </div>
                    {parsedResume.email && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                        <Mail className="h-3.5 w-3.5 text-slate-500" />
                        <span>{parsedResume.email}</span>
                      </div>
                    )}
                  </div>
                  {parsedResume.extracted_data.experience_level && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold">
                      <Briefcase className="h-3 w-3" />
                      <span>{parsedResume.extracted_data.experience_level}</span>
                    </div>
                  )}
                </div>

                {parsedResume.extracted_data.summary && (
                  <p className="mt-3 text-xs text-slate-300 leading-relaxed pt-3 border-t border-slate-900">
                    {parsedResume.extracted_data.summary}
                  </p>
                )}
              </div>

              {/* Skills */}
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                  Core Technical Skills ({parsedResume.extracted_data.skills.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {parsedResume.extracted_data.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-medium text-xs shadow-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Technologies */}
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                  Tools & Technologies ({parsedResume.extracted_data.technologies.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {parsedResume.extracted_data.technologies.map((tech, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60 text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Domains */}
              {parsedResume.extracted_data.domain_exposure && parsedResume.extracted_data.domain_exposure.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                    Domain Exposure
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {parsedResume.extracted_data.domain_exposure.map((dom, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800 text-[11px]"
                      >
                        {dom}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-72 flex flex-col items-center justify-center text-center text-slate-500 text-sm">
              <FileText className="h-10 w-10 mb-3 stroke-1 text-slate-600" />
              <p className="font-medium text-slate-400">No profile parsed yet.</p>
              <p className="text-xs text-slate-600 mt-1 max-w-xs">
                Upload a resume PDF or paste content to inspect extracted candidate competencies.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="mt-10 flex justify-between items-center pt-6 border-t border-slate-800">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 text-sm font-semibold cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Roles</span>
        </button>

        <button
          onClick={onStartInterview}
          disabled={!parsedResume}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-xl shadow-indigo-600/25 cursor-pointer"
        >
          <span>Start Technical Interview</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
