import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw, ArrowRight, Clipboard, Award } from 'lucide-react';

export default function Analyzer({ currentAnalysis, setCurrentAnalysis, setHistory, setActiveTab, apiBaseUrl, clientApiKey }) {
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // File drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
      if (validTypes.includes(droppedFile.type)) {
        setFile(droppedFile);
        setError('');
      } else {
        setError('Please drop a valid PDF or DOCX file.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const clearFile = () => {
    setFile(null);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file && !resumeText.trim()) {
      setError('Please upload a resume file or paste your resume text.');
      return;
    }
    if (!jobDescription.trim()) {
      setError('Please enter the target job description.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('jobDescription', jobDescription);
      
      if (file) {
        formData.append('resumeFile', file);
      } else {
        formData.append('resumeText', resumeText);
      }

      const headers = {};
      if (clientApiKey) {
        headers['x-gemini-key'] = clientApiKey;
      }

      const response = await fetch(`${apiBaseUrl}/api/analyze`, {
        method: 'POST',
        headers: headers,
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze resume.');
      }

      const data = await response.json();
      setCurrentAnalysis(data);

      // Refresh history list
      const histResponse = await fetch(`${apiBaseUrl}/api/analyses`);
      if (histResponse.ok) {
        const histData = await histResponse.json();
        setHistory(histData);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Skill Gap Analyzer</h1>
        <p className="text-zinc-400 mt-1">Compare your credentials against target job descriptions using AI.</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl glass-panel glow-violet min-h-[400px]">
          <RefreshCw className="animate-spin text-violet-400 mb-4" size={48} />
          <h3 className="text-lg font-bold text-zinc-100">Analyzing Resume & Job Requirements...</h3>
          <p className="text-sm text-zinc-400 text-center max-w-md mt-2">
            Extracting skills, comparing keywords, calculating ATS criteria, and formulating your learning roadmap. This can take up to 10 seconds.
          </p>
        </div>
      ) : currentAnalysis ? (
        /* Results Section */
        <div className="space-y-6">
          {/* Action Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/40 border border-zinc-800">
            <span className="text-sm text-zinc-400">Analysis completed successfully.</span>
            <button 
              onClick={() => setCurrentAnalysis(null)}
              className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition-all cursor-pointer shadow-md shadow-violet-600/10"
            >
              Analyze Another Job
            </button>
          </div>

          {/* Scores Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Match Card */}
            <div className="p-6 rounded-2xl glass-panel glow-violet flex flex-col items-center justify-center text-center">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Skill Match Rating</span>
              <div className="relative flex items-center justify-center my-4">
                {/* SVG Circular Progress */}
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle cx="72" cy="72" r="60" stroke="var(--zinc-800)" strokeWidth="12" fill="transparent" />
                  <circle cx="72" cy="72" r="60" stroke="#8b5cf6" strokeWidth="12" fill="transparent" 
                    strokeDasharray={2 * Math.PI * 60}
                    strokeDashoffset={2 * Math.PI * 60 * (1 - currentAnalysis.matchScore / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-3xl font-extrabold text-zinc-100">{currentAnalysis.matchScore}%</div>
              </div>
              <p className="text-sm text-zinc-400 max-w-sm">
                Your credentials cover {currentAnalysis.matchedSkills?.length} of the required skills. You are missing {currentAnalysis.missingSkills?.length} skills.
              </p>
            </div>

            {/* ATS Score Card */}
            <div className="p-6 rounded-2xl glass-panel glow-cyan flex flex-col items-center justify-center text-center">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">ATS Readiness Score</span>
              <div className="relative flex items-center justify-center my-4">
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle cx="72" cy="72" r="60" stroke="var(--zinc-800)" strokeWidth="12" fill="transparent" />
                  <circle cx="72" cy="72" r="60" stroke="#06b6d4" strokeWidth="12" fill="transparent" 
                    strokeDasharray={2 * Math.PI * 60}
                    strokeDashoffset={2 * Math.PI * 60 * (1 - currentAnalysis.atsScore / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-3xl font-extrabold text-zinc-100">{currentAnalysis.atsScore}</div>
              </div>
              <p className="text-sm text-zinc-400 max-w-sm">
                ATS parser validation rating. Check the Optimizer section for formatted bullet updates and suggestions.
              </p>
            </div>
          </div>

          {/* Detailed Skill Breakdown */}
          <div className="p-6 rounded-2xl glass-panel">
            <h3 className="text-lg font-bold text-zinc-100 mb-4">Skills Comparison</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Matched Skills */}
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  Matched Skills ({currentAnalysis.matchedSkills?.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {currentAnalysis.matchedSkills?.map((skill, index) => (
                    <span key={index} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 glow-green">
                      {skill}
                    </span>
                  ))}
                  {currentAnalysis.matchedSkills?.length === 0 && (
                    <span className="text-xs text-zinc-500 italic">No direct matches found.</span>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                  <AlertCircle size={16} />
                  Missing Skills ({currentAnalysis.missingSkills?.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {currentAnalysis.missingSkills?.map((skill, index) => (
                    <span key={index} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-500/10 border border-red-500/20 text-red-400">
                      {skill}
                    </span>
                  ))}
                  {currentAnalysis.missingSkills?.length === 0 && (
                    <span className="text-xs text-emerald-400 font-medium italic">Perfect match! No missing skills.</span>
                  )}
                </div>
              </div>

              {/* Soft Skills */}
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <h4 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                  <Award size={16} />
                  Preferred / Soft Skills ({currentAnalysis.softSkills?.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {currentAnalysis.softSkills?.map((skill, index) => (
                    <span key={index} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      {skill}
                    </span>
                  ))}
                  {currentAnalysis.softSkills?.length === 0 && (
                    <span className="text-xs text-zinc-500 italic">None detected.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Road to Improvement CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-zinc-100">1. Study Plan</h4>
                <p className="text-xs text-zinc-400 mt-1">Get a custom 4-week timeline covering missing topics and study guides.</p>
              </div>
              <button 
                onClick={() => setActiveTab('roadmap')}
                className="mt-4 flex items-center justify-center gap-2 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white cursor-pointer transition-all"
              >
                Go to Roadmap
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="p-5 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-zinc-100">2. Portfolio Upgrades</h4>
                <p className="text-xs text-zinc-400 mt-1">View tailored project recommendations utilizing your missing skills.</p>
              </div>
              <button 
                onClick={() => setActiveTab('projects')}
                className="mt-4 flex items-center justify-center gap-2 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white cursor-pointer transition-all"
              >
                View Projects
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="p-5 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-zinc-100">3. Resume Revisions</h4>
                <p className="text-xs text-zinc-400 mt-1">Improve weak sentence wording to pass ATS filters and stand out.</p>
              </div>
              <button 
                onClick={() => setActiveTab('optimizer')}
                className="mt-4 flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white cursor-pointer transition-all"
              >
                Optimize Resume
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Form Section */
        <form onSubmit={handleAnalyze} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Form inputs grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resume Upload Area */}
            <div className="p-5 rounded-2xl glass-panel flex flex-col space-y-4">
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <FileText size={20} className="text-violet-400" />
                1. Upload or Paste Resume
              </h2>

              {/* Drag Drop Area */}
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all min-h-[160px] ${
                  isDragOver ? 'border-violet-500 bg-violet-600/5' : 'border-zinc-800 hover:border-zinc-700 bg-slate-950/20'
                }`}
              >
                {file ? (
                  <div className="text-center space-y-2">
                    <FileText size={40} className="text-violet-400 mx-auto" />
                    <p className="text-sm font-semibold text-zinc-100">{file.name}</p>
                    <p className="text-xs text-zinc-500">{(file.size / 1024).toFixed(1)} KB</p>
                    <button 
                      type="button"
                      onClick={clearFile}
                      className="text-xs font-bold text-red-400 hover:text-red-300 underline cursor-pointer"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <Upload size={32} className="text-zinc-500 mx-auto" />
                    <p className="text-sm text-zinc-300">
                      Drag & drop your resume file, or <label className="text-violet-400 hover:underline font-semibold cursor-pointer">browse <input type="file" onChange={handleFileChange} className="hidden" accept=".pdf,.docx" /></label>
                    </p>
                    <p className="text-xs text-zinc-500">Supports PDF or DOCX (Max 5MB)</p>
                  </div>
                )}
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-zinc-800/80"></div>
                <span className="flex-shrink mx-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest">or paste text</span>
                <div className="flex-grow border-t border-zinc-800/80"></div>
              </div>

              {/* Textarea Paste */}
              <div className="flex-1 flex flex-col">
                <textarea 
                  value={resumeText}
                  onChange={(e) => {
                    setResumeText(e.target.value);
                    if (e.target.value.trim() && file) clearFile();
                  }}
                  placeholder="Paste raw resume text here..."
                  className="w-full flex-1 min-h-[180px] p-4 rounded-xl bg-slate-950/40 border border-zinc-800 text-zinc-200 placeholder-zinc-600 text-sm focus:outline-none focus:border-violet-500/50 resize-y"
                />
              </div>
            </div>

            {/* Job Description Area */}
            <div className="p-5 rounded-2xl glass-panel flex flex-col space-y-4">
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Clipboard size={20} className="text-cyan-400" />
                2. Target Job Description
              </h2>

              <div className="flex-1 flex flex-col">
                <textarea 
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the target job description here (responsibilities, required skills, degree qualifications)..."
                  className="w-full flex-1 min-h-[360px] p-4 rounded-xl bg-slate-950/40 border border-zinc-800 text-zinc-200 placeholder-zinc-600 text-sm focus:outline-none focus:border-cyan-500/50 resize-y"
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="text-center pt-2">
            <button 
              type="submit"
              className="px-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition-all cursor-pointer inline-flex items-center gap-2 hover:scale-[1.02]"
            >
              Analyze Skill Gap
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
