import React from 'react';
import { Calendar, CheckCircle2, Circle, ExternalLink, GraduationCap } from 'lucide-react';

export default function Roadmap({ currentAnalysis, history, progress, saveProgress }) {
  const latest = currentAnalysis || history[0];

  if (!latest) {
    return (
      <div className="p-8 rounded-2xl glass-panel text-center text-zinc-500 max-w-lg mx-auto mt-12">
        <GraduationCap size={48} className="mx-auto mb-3 text-zinc-650" />
        <h3 className="text-lg font-bold text-zinc-100">No Roadmap Available</h3>
        <p className="text-sm text-zinc-400 mt-2">
          Run a skill gap analysis using the **Analyzer** tab to generate a custom 4-week learning roadmap.
        </p>
      </div>
    );
  }

  const roadmap = latest.roadmap || {};
  const completedSkills = progress.completedSkills || [];

  const handleToggleTopic = (topicName) => {
    let updated;
    if (completedSkills.includes(topicName)) {
      updated = completedSkills.filter(t => t !== topicName);
    } else {
      updated = [...completedSkills, topicName];
    }
    saveProgress({
      ...progress,
      completedSkills: updated
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Learning Roadmap</h1>
        <p className="text-zinc-400 mt-1">Structured 4-week study plan targeting your identified skill gaps.</p>
      </div>

      {/* Week Timeline */}
      <div className="space-y-6">
        {Object.entries(roadmap).map(([weekKey, week]) => {
          // Calculate week completion
          const weekTopics = week.topics || [];
          const completedInWeek = weekTopics.filter(t => completedSkills.includes(t)).length;
          const completionPercentage = weekTopics.length > 0 ? Math.round((completedInWeek / weekTopics.length) * 100) : 0;

          return (
            <div key={weekKey} className="relative p-6 rounded-2xl glass-panel hover:border-zinc-700 transition-all flex flex-col md:flex-row gap-6">
              {/* Left Column: Week Status */}
              <div className="md:w-1/4 flex flex-col justify-between">
                <div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-500/10 border border-violet-500/20 text-violet-400 uppercase tracking-wider">
                    {weekKey.toUpperCase().replace('WEEK', 'Week ')}
                  </span>
                  <h3 className="text-lg font-bold text-zinc-100 mt-3 leading-snug">{week.title}</h3>
                </div>
                
                {/* Progress bar */}
                <div className="mt-4 md:mt-0">
                  <div className="flex justify-between text-xs text-zinc-400 font-medium mb-1">
                    <span>Completion</span>
                    <span className="text-violet-400 font-bold">{completionPercentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-violet-500 rounded-full transition-all duration-500" 
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Divider for MD+ screens */}
              <div className="hidden md:block w-px bg-zinc-800/80 self-stretch"></div>

              {/* Right Column: Topics & Resources */}
              <div className="flex-1 space-y-5">
                {/* Topics checklist */}
                <div>
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Milestone Objectives</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {weekTopics.map((topic, index) => {
                      const isCompleted = completedSkills.includes(topic);
                      return (
                        <div 
                          key={index}
                          onClick={() => handleToggleTopic(topic)}
                          className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                            isCompleted 
                              ? 'bg-violet-950/10 border-violet-500/30 text-zinc-300' 
                              : 'bg-slate-950/20 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            {isCompleted ? (
                              <CheckCircle2 size={16} className="text-violet-400" />
                            ) : (
                              <Circle size={16} className="text-zinc-600" />
                            )}
                          </div>
                          <span className="text-xs leading-relaxed font-medium select-none">{topic}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Study resources */}
                {week.resources && week.resources.length > 0 && (
                  <div className="border-t border-zinc-800/80 pt-4">
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Curated Reference Materials</h4>
                    <div className="flex flex-wrap gap-3">
                      {week.resources.map((resource, index) => (
                        <a 
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-zinc-800 text-xs text-zinc-300 font-medium inline-flex items-center gap-1.5 transition-all"
                        >
                          <ExternalLink size={12} className="text-cyan-400" />
                          <span>{resource.name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
