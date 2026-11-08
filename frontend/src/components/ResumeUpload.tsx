import React, { useState, useRef } from 'react';
import type { ResumeData } from '../types';
import { apiClient } from '../api/client';
import { UploadCloud, FileText, AlertCircle, ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';

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
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          Candidate Resume Ingestion
        </h2>
        <p className="mt-3 text-sm text-slate-400 max-w-xl mx-auto">
          Upload your resume PDF or paste your credentials. The system parses your background to dynamically formulate grounded interview scenarios.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Upload Controls */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
          {/* Tab Selection */}
          <div className="flex border-b border-slate-800 mb-6 pb-2 space-x-6 text-sm">
            <button
              onClick={() => setTab('upload')}
              className={`pb-2 font-medium cursor-pointer transition-colors relative ${
                tab === 'upload' ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Upload PDF
              {tab === 'upload' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />}
            </button>
            <button
              onClick={() => setTab('paste')}
              className={`pb-2 font-medium cursor-pointer transition-colors relative ${
                tab === 'paste' ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Paste Text
              {tab === 'paste' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
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
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-slate-700/80 hover:border-slate-600 bg-slate-950/40'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileInput}
              />
              <div className="h-12 w-12 rounded-full bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center mb-3">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-slate-200">
                {file ? file.name : 'Click to upload or drag & drop PDF'}
              </p>
              <p className="text-xs text-slate-500 mt-1">Supports standard PDF resumes up to 10MB</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Candidate Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Resume Content
                </label>
                <textarea
                  rows={8}
                  placeholder="Paste experience, skills, frameworks, and education..."
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                />
              </div>
              <button
                onClick={handleTextSubmit}
                disabled={loading || pastedText.length < 30}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Extract Profile</span>
              </button>
            </div>
          )}

          {loading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-indigo-400 font-medium">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Analyzing resume entities & technical competencies...</span>
            </div>
          )}
        </div>

        {/* Right Side: Parsed Entities Preview */}
        <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Parsed Candidate Profile
            </h3>
          </div>

          {parsedResume ? (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                <div className="text-slate-400 text-[10px] uppercase font-semibold">Candidate</div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {parsedResume.candidate_name || 'Applicant'}
                </div>
                {parsedResume.email && (
                  <div className="text-slate-400 text-[11px] mt-0.5">{parsedResume.email}</div>
                )}
                {parsedResume.extracted_data.experience_level && (
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-semibold">
                    {parsedResume.extracted_data.experience_level}
                  </span>
                )}
              </div>

              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Identified Core Skills
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {parsedResume.extracted_data.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-medium text-[11px]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Tools & Technologies
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {parsedResume.extracted_data.technologies.map((tech, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 text-[10px]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500 text-xs">
              <FileText className="h-8 w-8 mb-2 stroke-1" />
              <p>Upload a resume to inspect extracted skills and competencies.</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="mt-8 flex justify-between items-center pt-4 border-t border-slate-800">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Roles</span>
        </button>

        <button
          onClick={onStartInterview}
          disabled={!parsedResume}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          <span>Start Technical Interview</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
