import React from 'react';
import { Code, CheckCircle2, Circle, Clock, Layers, Award } from 'lucide-react';

export default function Projects({ currentAnalysis, history, progress, saveProgress }) {
  const latest = currentAnalysis || history[0];

  if (!latest) {
    return (
      <div className="p-8 rounded-2xl glass-panel text-center text-zinc-500 max-w-lg mx-auto mt-12">
        <Code size={48} className="mx-auto mb-3 text-zinc-650" />
        <h3 className="text-lg font-bold text-zinc-100">No Recommendations Yet</h3>
        <p className="text-sm text-zinc-400 mt-2">
          Perform a skill gap analysis in the **Analyzer** tab to generate custom portfolio project recommendations.
        </p>
      </div>
    );
  }

  const projects = latest.projectRecommendations || [];
  const completedProjects = progress.completedProjects || [];

  const handleToggleProject = (projectTitle) => {
    let updated;
    if (completedProjects.includes(projectTitle)) {
      updated = completedProjects.filter(p => p !== projectTitle);
    } else {
      updated = [...completedProjects, projectTitle];
    }
    saveProgress({
      ...progress,
      completedProjects: updated
    });
  };

  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'beginner': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'intermediate': return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'advanced': return 'bg-red-500/10 border-red-500/20 text-red-400';
      default: return 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Recommended Portfolio Projects</h1>
        <p className="text-zinc-400 mt-1">
          Add these technical projects to your resume to demonstrate hands-on experience in missing technologies.
        </p>
      </div>

      {/* Grid Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project, index) => {
          const isCompleted = completedProjects.includes(project.title);
          
          return (
            <div 
              key={index}
              className={`p-6 rounded-2xl glass-panel flex flex-col justify-between transition-all ${
                isCompleted ? 'border-violet-500/30' : 'hover:border-zinc-700'
              }`}
            >
              <div className="space-y-4">
                {/* Title Line */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-100 leading-snug">{project.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getDifficultyColor(project.difficulty)}`}>
                        {project.difficulty}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 border border-zinc-800 text-zinc-400 inline-flex items-center gap-1">
                        <Clock size={10} />
                        {project.duration}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleToggleProject(project.title)}
                    className="p-1 text-zinc-500 hover:text-zinc-100 transition-all cursor-pointer"
                    title={isCompleted ? "Mark as Incomplete" : "Mark as Completed"}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={24} className="text-violet-400" />
                    ) : (
                      <Circle size={24} className="text-zinc-700 hover:text-zinc-500" />
                    )}
                  </button>
                </div>

                {/* Description */}
                <p className="text-sm text-zinc-400 leading-relaxed">{project.description}</p>

                {/* Tech Skills Badges */}
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Core Tech Stack</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {project.skills?.map((skill, sIdx) => (
                      <span key={sIdx} className="px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60 text-xs text-zinc-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Features & Arch */}
                <div className="space-y-3 pt-3 border-t border-zinc-850">
                  <div>
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <Layers size={10} />
                      Key Features to Build
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-xs text-zinc-400">
                      {project.features?.map((feat, fIdx) => (
                        <li key={fIdx} className="leading-relaxed">{feat}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Code size={10} />
                      Architecture / Setup
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed bg-slate-950/30 p-2.5 rounded-lg border border-zinc-850">
                      {project.architecture}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status CTA */}
              <div className="mt-6 pt-3 border-t border-zinc-850/80 flex items-center justify-between">
                <span className="text-xs text-zinc-500">
                  {isCompleted ? "🎉 Portfolio item finalized!" : "Complete this to boost your match score."}
                </span>
                <button
                  onClick={() => handleToggleProject(project.title)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    isCompleted 
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' 
                      : 'bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/10'
                  }`}
                >
                  {isCompleted ? "Mark Incomplete" : "Mark as Completed"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
