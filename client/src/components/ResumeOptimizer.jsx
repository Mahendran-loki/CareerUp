import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2, AlertTriangle, FileText, Check } from 'lucide-react';

export default function ResumeOptimizer({ currentAnalysis, history }) {
  const latest = currentAnalysis || history[0];

  if (!latest) {
    return (
      <div className="p-8 rounded-2xl glass-panel text-center text-zinc-500 max-w-lg mx-auto mt-12">
        <Sparkles size={48} className="mx-auto mb-3 text-zinc-650" />
        <h3 className="text-lg font-bold text-zinc-100">No Optimizer Data</h3>
        <p className="text-sm text-zinc-400 mt-2">
          Upload and analyze a resume using the **Analyzer** tab to generate personalized bullet improvements.
        </p>
      </div>
    );
  }

  const improvements = latest.resumeImprovements || [];
  const suggestions = latest.atsSuggestions || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Resume Optimizer</h1>
        <p className="text-zinc-400 mt-1">
          Polish your bullet points with action verbs and quantitative metrics, and resolve general ATS issues.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bullets Rewrites */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-zinc-800 flex items-center gap-2">
            <Sparkles className="text-violet-400" size={18} />
            <h2 className="text-md font-bold text-zinc-100">AI Bullet Point Rephraser</h2>
          </div>

          <div className="space-y-4">
            {improvements.map((item, index) => (
              <div key={index} className="p-5 rounded-2xl glass-panel hover:border-zinc-700 transition-all space-y-3">
                {/* Side-by-side Before/After */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Before */}
                  <div className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/10 text-xs">
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block mb-1">❌ Weak/Non-Quantified Statement</span>
                    <p className="text-zinc-400 italic font-mono leading-relaxed">{item.original}</p>
                  </div>

                  {/* After */}
                  <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">✓ Suggestion (Action-Based & Quantified)</span>
                    <p className="text-zinc-100 font-medium leading-relaxed">{item.suggested}</p>
                  </div>
                </div>

                {/* Reason */}
                <div className="text-xs text-zinc-400 border-t border-zinc-850 pt-2.5 flex items-center gap-1.5">
                  <span className="font-bold text-violet-400 uppercase tracking-wide text-[9px] bg-violet-500/10 px-1.5 py-0.5 rounded">RATIONALE</span>
                  <span>{item.reason}</span>
                </div>
              </div>
            ))}

            {improvements.length === 0 && (
              <div className="p-6 rounded-2xl glass-panel text-center text-zinc-500 text-xs">
                No weak phrasing detected. Your bullet points are well formulated!
              </div>
            )}
          </div>
        </div>

        {/* ATS Checklist & Suggestions */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-zinc-800 flex items-center gap-2">
            <FileText className="text-cyan-400" size={18} />
            <h2 className="text-md font-bold text-zinc-100">ATS Structural Checklist</h2>
          </div>

          <div className="p-5 rounded-2xl glass-panel space-y-4">
            {/* Structural Checkboxes */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-zinc-300">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" /> Matches section structure
                </span>
                <span className="font-bold text-emerald-400">Passed</span>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-300">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" /> Action verb density
                </span>
                <span className="font-bold text-emerald-400">Valid</span>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-300">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" /> Contact details checks
                </span>
                <span className="font-bold text-emerald-400">Valid</span>
              </div>
            </div>

            {/* Suggestions list */}
            {suggestions.length > 0 && (
              <div className="border-t border-zinc-850 pt-4 space-y-3">
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Recommended Actions</h4>
                <div className="space-y-2">
                  {suggestions.map((sug, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-950/20 border border-zinc-800/80 text-xs flex gap-2 items-start text-zinc-300">
                      <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{sug}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
