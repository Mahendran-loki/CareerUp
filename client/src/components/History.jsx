import React from 'react';
import { Clock, Eye, Trash2, ShieldAlert } from 'lucide-react';

export default function History({ history, setHistory, currentAnalysis, setCurrentAnalysis, setActiveTab, apiBaseUrl }) {

  const handleLoadAnalysis = (analysis) => {
    setCurrentAnalysis(analysis);
    setActiveTab('analyzer');
  };

  const handleDeleteAnalysis = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this analysis report from your history?')) {
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/analyses/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        // Update state
        setHistory(prev => prev.filter(item => item._id !== id));
        if (currentAnalysis && currentAnalysis._id === id) {
          setCurrentAnalysis(null);
        }
      } else {
        alert('Failed to delete history record.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Analysis History</h1>
        <p className="text-zinc-400 mt-1">Review your previously run resume assessments and track your scoring evolution.</p>
      </div>

      <div className="space-y-3">
        {history.map((item) => (
          <div 
            key={item._id}
            onClick={() => handleLoadAnalysis(item)}
            className="p-4 rounded-xl glass-panel glass-panel-hover flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
          >
            {/* Left: Info */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-zinc-500" />
                <span className="text-xs text-zinc-400">
                  {new Date(item.date).toLocaleDateString(undefined, { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <h3 className="text-sm font-bold text-zinc-100 max-w-md truncate">
                {item.jobDescriptionText ? item.jobDescriptionText.slice(0, 75).trim() + '...' : 'Job Assessment'}
              </h3>
            </div>

            {/* Right: Scores & Actions */}
            <div className="flex items-center justify-between sm:justify-end gap-6">
              <div className="flex gap-4">
                {/* Match */}
                <div className="text-right">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase block">Match</span>
                  <span className="text-sm font-extrabold text-violet-400">{item.matchScore}%</span>
                </div>
                {/* ATS */}
                <div className="text-right">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase block">ATS Check</span>
                  <span className="text-sm font-extrabold text-cyan-400">{item.atsScore}/100</span>
                </div>
              </div>

              <div className="flex gap-2 border-l border-zinc-800/85 pl-4">
                <button
                  onClick={() => handleLoadAnalysis(item)}
                  className="p-2 rounded-lg bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-400 hover:text-zinc-100 cursor-pointer transition-all"
                  title="View Assessment"
                >
                  <Eye size={14} />
                </button>
                <button
                  onClick={(e) => handleDeleteAnalysis(item._id, e)}
                  className="p-2 rounded-lg bg-zinc-900/60 hover:bg-red-500/10 border border-zinc-800 hover:border-red-500/20 text-zinc-500 hover:text-red-400 cursor-pointer transition-all"
                  title="Delete Assessment"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {history.length === 0 && (
          <div className="p-8 rounded-2xl glass-panel text-center text-zinc-500 flex flex-col items-center justify-center min-h-[220px]">
            <ShieldAlert size={36} className="text-zinc-600 mb-2" />
            <p className="text-sm">No analysis reports stored in history yet.</p>
            <button
              onClick={() => setActiveTab('analyzer')}
              className="mt-3 px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white cursor-pointer transition-all"
            >
              Analyze Your First Resume
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
