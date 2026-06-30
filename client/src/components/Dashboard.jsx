import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Award, Briefcase, CheckSquare, Code, TrendingUp, Calendar } from 'lucide-react';

export default function Dashboard({ profile, progress, history, setActiveTab, currentAnalysis }) {
  // Format history for the chart
  const chartData = [...history]
    .reverse() // show oldest to newest
    .map(item => ({
      date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: item.matchScore,
      ats: item.atsScore
    }));

  const latest = currentAnalysis || history[0];

  // Calculate statistics
  const totalSkillsLearned = progress.completedSkills?.length || 0;
  const totalProjectsCompleted = progress.completedProjects?.length || 0;
  const latestMatchScore = latest?.matchScore || 0;
  const latestAtsScore = latest?.atsScore || 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative p-6 rounded-2xl overflow-hidden glass-panel glow-violet">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-600/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Welcome back, {profile.name || 'Guest Developer'}!</h1>
            <p className="text-zinc-400 mt-1">Target Role: <span className="text-violet-400 font-semibold">{profile.targetRole || 'Software Developer'}</span></p>
          </div>
          <button 
            onClick={() => setActiveTab('analyzer')}
            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 font-medium text-white shadow-lg shadow-violet-600/20 transition-all cursor-pointer"
          >
            Start New Analysis
          </button>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Skill Match */}
        <div className="p-5 rounded-2xl glass-panel glass-panel-hover flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Skill Match Score</p>
            <h3 className="text-3xl font-extrabold mt-1 text-zinc-100">{latestMatchScore}%</h3>
            <p className="text-xs text-zinc-500 mt-1">Based on latest job profile</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 glow-cyan">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* ATS Score */}
        <div className="p-5 rounded-2xl glass-panel glass-panel-hover flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">ATS Score Check</p>
            <h3 className="text-3xl font-extrabold mt-1 text-zinc-100">{latestAtsScore}/100</h3>
            <p className="text-xs text-zinc-500 mt-1">Formatting & readability</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 glow-violet">
            <Award size={24} />
          </div>
        </div>

        {/* Skills Tracked */}
        <div className="p-5 rounded-2xl glass-panel glass-panel-hover flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Skills Acquired</p>
            <h3 className="text-3xl font-extrabold mt-1 text-zinc-100">{totalSkillsLearned}</h3>
            <p className="text-xs text-zinc-500 mt-1">Marked in roadmap</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 glow-green">
            <CheckSquare size={24} />
          </div>
        </div>

        {/* Projects Completed */}
        <div className="p-5 rounded-2xl glass-panel glass-panel-hover flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Projects Built</p>
            <h3 className="text-3xl font-extrabold mt-1 text-zinc-100">{totalProjectsCompleted}</h3>
            <p className="text-xs text-zinc-500 mt-1">Suggested portfolio assets</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Code size={24} />
          </div>
        </div>
      </div>

      {/* Main Charts & Quick Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Match Percentage Over Time */}
        <div className="lg:col-span-2 p-5 rounded-2xl glass-panel flex flex-col">
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <TrendingUp size={20} className="text-violet-400" />
            Skill Match Progress History
          </h2>
          
          <div className="h-64 mt-4 flex-1">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="atsColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--zinc-800)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--zinc-400)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--zinc-400)" fontSize={11} domain={[0, 100]} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--panel-bg)', border: '1px solid var(--zinc-800)', borderRadius: '12px' }}
                    labelStyle={{ color: 'var(--zinc-100)', fontWeight: 'bold' }}
                    itemStyle={{ color: 'var(--zinc-100)' }}
                  />
                  <Area name="Skill Match %" type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#scoreColor)" />
                  <Area name="ATS Score" type="monotone" dataKey="ats" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#atsColor)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500">
                <Calendar size={48} className="mb-2 text-zinc-600" />
                <p>Run multiple analyses to view progress charts here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Task Summary */}
        <div className="p-5 rounded-2xl glass-panel flex flex-col">
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <CheckSquare size={20} className="text-cyan-400" />
            Learning Checklist
          </h2>

          <div className="mt-4 flex-1 flex flex-col justify-between">
            {latest ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Target Missing Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {latest.missingSkills?.slice(0, 5).map((skill, index) => (
                      <span 
                        key={index}
                        onClick={() => setActiveTab('roadmap')}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-500/10 border border-red-500/20 text-red-400 hover:border-red-500/50 cursor-pointer transition-all"
                      >
                        Learn {skill}
                      </span>
                    ))}
                    {latest.missingSkills?.length === 0 && (
                      <span className="text-xs text-emerald-400">No missing skills detected! Ready to apply.</span>
                    )}
                  </div>
                </div>

                <div className="border-t border-zinc-800/80 pt-3">
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Active Roadmap Progress</h4>
                  <div className="space-y-2">
                    {Object.entries(latest.roadmap || {}).slice(0, 2).map(([key, week]) => (
                      <div key={key} className="p-2.5 rounded-lg bg-slate-900/30 border border-zinc-800 text-xs flex items-center justify-between">
                        <span className="text-zinc-300 font-medium truncate pr-2">{week.title}</span>
                        <button 
                          onClick={() => setActiveTab('roadmap')}
                          className="text-[10px] font-bold text-violet-400 hover:text-violet-300 cursor-pointer whitespace-nowrap"
                        >
                          View Plan
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-500 p-4">
                <Briefcase size={36} className="mb-2 text-zinc-700" />
                <p className="text-sm">Run your first analysis to generate learning targets.</p>
              </div>
            )}

            {latest && (
              <div className="mt-4 pt-3 border-t border-zinc-800/80 text-center">
                <span className="text-xs text-zinc-400">
                  Keep building projects and completing weekly goals to track your stats.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
