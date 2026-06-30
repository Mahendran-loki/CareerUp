import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  Compass, 
  GraduationCap, 
  FolderGit2, 
  Sparkles, 
  History as HistoryIcon, 
  Settings as SettingsIcon,
  ShieldCheck,
  Brain,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import Analyzer from './components/Analyzer';
import Roadmap from './components/Roadmap';
import Projects from './components/Projects';
import ResumeOptimizer from './components/ResumeOptimizer';
import History from './components/History';
import Settings from './components/Settings';

const API_BASE_URL = 'http://localhost:5000';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState({ name: 'Guest Developer', targetRole: 'Software Developer' });
  const [progress, setProgress] = useState({ completedSkills: [], completedProjects: [] });
  const [history, setHistory] = useState([]);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [clientApiKey, setClientApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Synchronize theme attribute changes on document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Initialize and load data on component mount
  useEffect(() => {
    async function loadData() {
      try {
        // Load User Profile
        const profResponse = await fetch(`${API_BASE_URL}/api/profile`);
        if (profResponse.ok) {
          const profData = await profResponse.json();
          setProfile(profData);
        }

        // Load Completed Progress
        const progResponse = await fetch(`${API_BASE_URL}/api/progress`);
        if (progResponse.ok) {
          const progData = await progResponse.json();
          setProgress(progData);
        }

        // Load Assessment History
        const histResponse = await fetch(`${API_BASE_URL}/api/analyses`);
        if (histResponse.ok) {
          const histData = await histResponse.json();
          setHistory(histData);
          // Set current analysis to the latest one if exists
          if (histData.length > 0) {
            setCurrentAnalysis(histData[0]);
          }
        }
      } catch (err) {
        console.error('Failed to communicate with Express server API:', err.message);
      }
    }
    loadData();
  }, []);

  const saveProgress = async (updatedProgress) => {
    setProgress(updatedProgress);
    try {
      await fetch(`${API_BASE_URL}/api/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProgress)
      });
    } catch (err) {
      console.error('Failed to sync progress to database:', err);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'analyzer', label: 'Analyzer', icon: Compass },
    { id: 'roadmap', label: 'Roadmap', icon: GraduationCap },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'optimizer', label: 'Resume Optimizer', icon: Sparkles },
    { id: 'history', label: 'History', icon: HistoryIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            profile={profile} 
            progress={progress} 
            history={history} 
            currentAnalysis={currentAnalysis}
            setActiveTab={setActiveTab} 
          />
        );
      case 'analyzer':
        return (
          <Analyzer 
            currentAnalysis={currentAnalysis} 
            setCurrentAnalysis={setCurrentAnalysis} 
            setHistory={setHistory}
            setActiveTab={setActiveTab}
            apiBaseUrl={API_BASE_URL}
            clientApiKey={clientApiKey}
          />
        );
      case 'roadmap':
        return (
          <Roadmap 
            currentAnalysis={currentAnalysis} 
            history={history}
            progress={progress} 
            saveProgress={saveProgress} 
          />
        );
      case 'projects':
        return (
          <Projects 
            currentAnalysis={currentAnalysis} 
            history={history}
            progress={progress} 
            saveProgress={saveProgress} 
          />
        );
      case 'optimizer':
        return (
          <ResumeOptimizer 
            currentAnalysis={currentAnalysis} 
            history={history} 
            profile={profile}
          />
        );
      case 'history':
        return (
          <History 
            history={history} 
            setHistory={setHistory}
            currentAnalysis={currentAnalysis}
            setCurrentAnalysis={setCurrentAnalysis}
            setActiveTab={setActiveTab}
            apiBaseUrl={API_BASE_URL}
          />
        );
      case 'settings':
        return (
          <Settings 
            profile={profile} 
            setProfile={setProfile} 
            clientApiKey={clientApiKey} 
            setClientApiKey={setClientApiKey}
            apiBaseUrl={API_BASE_URL}
          />
        );
      default:
        return <div>Tab not found.</div>;
    }
  };

  return (
    <div className="min-h-screen flex bg-zinc-950 text-zinc-100 antialiased font-sans">
      
      {/* Mobile Sidebar Toggle Button */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 p-4 rounded-full bg-violet-600 hover:bg-violet-500 text-white shadow-xl shadow-violet-600/30 cursor-pointer transition-all hover:scale-105"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-950/85 backdrop-blur-xl border-r border-zinc-900/90 flex flex-col justify-between p-5 transition-transform duration-300
        lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:flex'}
      `}>
        <div className="space-y-6">
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5 px-2 py-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white glow-violet">
              <Brain size={22} className="animate-pulse" />
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-650 bg-clip-text text-transparent">CareerUp</h2>
              <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400/80">Skill Gap AI</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false); // Close sidebar on mobile select
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20' 
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/40'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-white' : 'text-zinc-500'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Theme Switcher and Sidebar Footer */}
        <div className="pt-4 border-t border-zinc-900/80 space-y-3">
          {/* Theme Slide Switch */}
          <div className="w-full px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between text-zinc-400 hover:text-zinc-100 transition-all select-none">
            <span>Theme Mode</span>
            <div 
              onClick={toggleTheme}
              className={`relative w-12 h-6 rounded-full p-0.5 cursor-pointer transition-colors duration-300 flex items-center ${
                theme === 'dark' ? 'bg-zinc-800 border border-zinc-700' : 'bg-violet-600 border border-violet-500'
              }`}
            >
              {/* Sliding knob circle */}
              <div 
                className={`w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-md transition-all duration-300 transform ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                }`}
              >
                {theme === 'dark' ? (
                  <Moon size={11} className="text-zinc-900" />
                ) : (
                  <Sun size={11} className="text-amber-500" />
                )}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-zinc-900 text-[10px] flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-zinc-500 font-bold uppercase tracking-widest">
              <span>AI Engine Status</span>
            </div>
            {clientApiKey ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Gemini Live API Mode
              </span>
            ) : (
              <span className="text-amber-500 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Simulated AI (Free)
              </span>
            )}
          </div>
        </div>
      </aside>

      {/* Main content frame */}
      <main className="flex-1 min-w-0 min-h-screen overflow-y-auto px-6 py-8 md:px-8 lg:px-12 bg-dark-bg relative">
        <div className="max-w-6xl mx-auto space-y-8 animate-[fadeIn_0.3s_ease-out]">
          {renderContent()}
        </div>
      </main>

    </div>
  );
}
