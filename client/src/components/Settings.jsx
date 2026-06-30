import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Key, Info, HelpCircle, Save, Check } from 'lucide-react';

export default function Settings({ profile, setProfile, clientApiKey, setClientApiKey, apiBaseUrl }) {
  const [name, setName] = useState(profile.name || '');
  const [targetRole, setTargetRole] = useState(profile.targetRole || '');
  const [apiKey, setApiKey] = useState(clientApiKey || '');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('success');

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setStatusMessage('');
    try {
      const response = await fetch(`${apiBaseUrl}/api/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, targetRole })
      });
      if (response.ok) {
        const updated = await response.json();
        setProfile(updated);
        triggerStatus('Profile configuration saved successfully.', 'success');
      } else {
        triggerStatus('Failed to save profile settings.', 'error');
      }
    } catch (err) {
      console.error(err);
      triggerStatus('Error connecting to database backend.', 'error');
    }
  };

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    setStatusMessage('');
    const trimmed = apiKey.trim();
    setClientApiKey(trimmed);
    localStorage.setItem('gemini_api_key', trimmed);
    triggerStatus(
      trimmed 
        ? 'API Key saved successfully. Live Gemini AI mode is now ACTIVE.' 
        : 'API Key removed. Skill Gap Analyzer has reverted to local Simulator mode.', 
      'success'
    );
  };

  const triggerStatus = (msg, type) => {
    setStatusMessage(msg);
    setStatusType(type);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Platform Settings</h1>
        <p className="text-zinc-400 mt-1">Configure your target job expectations and customize the AI execution provider.</p>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
          statusType === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {statusType === 'success' ? <Check size={16} /> : <Info size={16} />}
          <span>{statusMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Profile */}
        <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl glass-panel space-y-4">
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <User size={20} className="text-violet-400" />
            Candidate Profile
          </h2>
          <p className="text-xs text-zinc-400">
            Define your name and career target role. These are stored on the server database to tailor dashboard metrics.
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">Your Full Name</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mahendran DM"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/40 border border-zinc-800 text-zinc-200 placeholder-zinc-700 text-sm focus:outline-none focus:border-violet-500/50"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">Target Job Title</label>
              <input 
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Full Stack Developer"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/40 border border-zinc-800 text-zinc-200 placeholder-zinc-700 text-sm focus:outline-none focus:border-violet-500/50"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full mt-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <Save size={14} />
            Save Profile Configuration
          </button>
        </form>

        {/* AI Key Config */}
        <form onSubmit={handleSaveApiKey} className="p-6 rounded-2xl glass-panel space-y-4">
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Key size={20} className="text-cyan-400" />
            AI Provider Options
          </h2>
          <p className="text-xs text-zinc-400">
            Provide a Google Gemini API Key to unlock real-time structured analysis, custom roadmaps, and wording revisions.
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">Google Gemini API Key</label>
              <input 
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste AI API Key (AIzaSy...)"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/40 border border-zinc-800 text-zinc-200 placeholder-zinc-700 text-sm focus:outline-none focus:border-cyan-500/50 font-mono"
              />
            </div>

            {/* Indicator of mode */}
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-zinc-850 space-y-1.5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Active Analysis Engine</span>
              {clientApiKey ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Gemini AI Active
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Local Dynamic Simulator Active (Free Mode)
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full mt-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <Save size={14} />
            Save AI Provider Key
          </button>
        </form>
      </div>

      {/* Guide Info */}
      <div className="p-5 rounded-2xl glass-panel flex gap-4 items-start">
        <Info className="text-violet-400 flex-shrink-0 mt-0.5" size={20} />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-zinc-100">How to obtain a free Google Gemini API Key?</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Google provides developer API keys through the **Google AI Studio**. Visit 
            <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline mx-1 inline-flex items-center gap-0.5">
              Google AI Studio website
            </a> 
            to sign in with your Google account, click "Get API Key", and copy your credentials.
          </p>
        </div>
      </div>
    </div>
  );
}
