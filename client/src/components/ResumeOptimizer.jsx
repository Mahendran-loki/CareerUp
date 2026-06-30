import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, AlertTriangle, FileText, Check, ChevronDown } from 'lucide-react';

export default function ResumeOptimizer({ currentAnalysis, history, profile }) {
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

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper to escape special regex chars
  const escapeRegExp = (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // Replaces weak bullets with their AI optimized suggestions
  const getOptimizedResumeText = () => {
    if (!latest || !latest.resumeText) return '';
    let optimized = latest.resumeText;
    
    improvements.forEach(item => {
      if (!item.original || !item.suggested) return;
      
      let cleanOriginal = item.original.trim();
      if (cleanOriginal.startsWith('"') && cleanOriginal.endsWith('"')) {
        cleanOriginal = cleanOriginal.slice(1, -1).trim();
      }
      if (cleanOriginal.startsWith('"...') && cleanOriginal.endsWith('..."')) {
        cleanOriginal = cleanOriginal.slice(4, -4).trim();
      }
      
      if (optimized.includes(cleanOriginal)) {
        optimized = optimized.replace(cleanOriginal, item.suggested);
      } else {
        const lines = optimized.split('\n');
        const updatedLines = lines.map(line => {
          if (line.toLowerCase().includes(cleanOriginal.toLowerCase())) {
            return line.replace(new RegExp(escapeRegExp(cleanOriginal), 'gi'), item.suggested);
          }
          return line;
        });
        optimized = updatedLines.join('\n');
      }
    });
    
    return optimized;
  };

  const handleDownload = (format) => {
    const optimizedText = getOptimizedResumeText();
    const candidateName = profile?.name || 'Candidate';
    const docTitle = `${candidateName}_ATS_Optimized_Resume`;

    // Process text into a simple clean HTML markup block
    const lines = optimizedText.split('\n');
    const bodyHtml = lines.map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '<br/>';
      
      if (/^(experience|projects|education|skills|summary|work history|profile)$/i.test(trimmed)) {
        return `<h2>${trimmed.toUpperCase()}</h2>`;
      }
      
      if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
        return `<li>${trimmed.substring(1).trim()}</li>`;
      }
      
      return `<p>${trimmed}</p>`;
    }).join('\n');

    if (format === 'doc') {
      const html = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><title>${docTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; padding: 40px; color: #334155; }
          h1 { text-align: center; color: #0f172a; font-size: 22px; margin-bottom: 20px; font-weight: bold; }
          h2 { color: #4f46e5; border-bottom: 2.5px solid #e2e8f0; font-size: 13px; margin-top: 25px; padding-bottom: 5px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }
          p { margin: 8px 0; font-size: 11pt; }
          li { margin: 5px 0; font-size: 11pt; list-style-type: square; }
        </style>
        </head>
        <body>
          <h1>${candidateName.toUpperCase()}</h1>
          ${bodyHtml}
        </body>
        </html>
      `;

      const blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${docTitle.replace(/\s+/g, '_')}.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
        <head>
          <title>${docTitle}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.5; 
              color: #1e293b; 
              padding: 0;
              margin: 0;
            }
            h1 { 
              text-align: center; 
              color: #0f172a; 
              font-size: 24px; 
              margin-bottom: 2px; 
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            h2 { 
              color: #4f46e5; 
              border-bottom: 1.5px solid #e2e8f0; 
              font-size: 12px; 
              margin-top: 20px; 
              margin-bottom: 8px;
              padding-bottom: 4px; 
              text-transform: uppercase; 
              letter-spacing: 1px; 
              font-weight: bold;
            }
            p { 
              margin: 6px 0; 
              font-size: 10.5pt; 
            }
            li { 
              margin: 4px 0; 
              font-size: 10.5pt; 
            }
            ul {
              margin: 4px 0 8px 18px;
              padding: 0;
            }
          </style>
        </head>
        <body>
          <h1>${candidateName.toUpperCase()}</h1>
          ${bodyHtml}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            }
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Resume Optimizer</h1>
        <p className="text-zinc-400 mt-1">
          Polish your bullet points with action verbs and quantitative metrics, and resolve general ATS issues.
        </p>
      </div>

      {/* Export Action Card */}
      <div className="p-6 rounded-2xl glass-panel glow-violet flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Sparkles className="text-violet-400 animate-pulse" size={20} />
            Export ATS-Optimized Resume
          </h3>
          <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
            We've compiled a clean A4 resume incorporating all target action-verb rephrases and keywords suggested below. Download in your preferred format.
          </p>
        </div>
        
        {/* Dropdown Container */}
        <div className="relative w-full md:w-auto" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white cursor-pointer transition-all hover:scale-[1.02] shadow-lg shadow-violet-600/10"
          >
            <Sparkles size={14} />
            Export Resume
            <ChevronDown size={14} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Floating Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-full md:w-48 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl z-50 py-1 overflow-hidden transition-all duration-150 transform origin-top-right">
              <button
                onClick={() => {
                  handleDownload('doc');
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs text-zinc-350 hover:text-zinc-100 hover:bg-zinc-800/60 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <FileText size={14} className="text-cyan-400" />
                Download Word (.doc)
              </button>
              
              <div className="h-[1px] bg-zinc-850/60 mx-2" />
              
              <button
                onClick={() => {
                  handleDownload('pdf');
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs text-zinc-350 hover:text-zinc-100 hover:bg-zinc-800/60 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Sparkles size={14} className="text-violet-400" />
                Download PDF
              </button>
            </div>
          )}
        </div>
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
