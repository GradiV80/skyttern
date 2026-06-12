import React, { useState, useEffect } from 'react';
import { Weapon, SavedResult, ProgramType } from './types.ts';
import { DEFAULT_WEAPONS, DEFAULT_RESULTS } from './mockData.ts';

// Component Imports
import WeaponsTab from './components/WeaponsTab.tsx';
import ProgramRunner from './components/ProgramRunner.tsx';
import ResultsTab from './components/ResultsTab.tsx';
import GraphTab from './components/GraphTab.tsx';
import RulesTab from './components/RulesTab.tsx';

// Icons
import { Crosshair, Shield, ClipboardList, BarChart3, HelpCircle, Target } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('programs');
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [results, setResults] = useState<SavedResult[]>([]);

  // Load from LocalStorage on mount
  useEffect(() => {
    const storedWeapons = localStorage.getItem('skytterapp_weapons');
    const storedResults = localStorage.getItem('skytterapp_results');

    if (storedWeapons) {
      setWeapons(JSON.parse(storedWeapons));
    } else {
      // Use defaults if empty
      setWeapons(DEFAULT_WEAPONS);
      localStorage.setItem('skytterapp_weapons', JSON.stringify(DEFAULT_WEAPONS));
    }

    if (storedResults) {
      setResults(JSON.parse(storedResults));
    } else {
      // Use defaults if empty
      setResults(DEFAULT_RESULTS);
      localStorage.setItem('skytterapp_results', JSON.stringify(DEFAULT_RESULTS));
    }
  }, []);

  // Update weapons catalog
  const handleUpdateWeapons = (newWeapons: Weapon[]) => {
    setWeapons(newWeapons);
    localStorage.setItem('skytterapp_weapons', JSON.stringify(newWeapons));
  };

  // Log new score result session
  const handleAddResult = (newResult: SavedResult) => {
    const updated = [newResult, ...results];
    setResults(updated);
    localStorage.setItem('skytterapp_results', JSON.stringify(updated));
  };

  // Remove history item
  const handleDeleteResult = (id: string) => {
    const updated = results.filter(r => r.id !== id);
    setResults(updated);
    localStorage.setItem('skytterapp_results', JSON.stringify(updated));
  };

  // Switch tab trigger helper
  const handleSwitchTab = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col md:flex-row overflow-x-hidden" id="applet-viewport">
      
      {/* Sidebar - Desktop Layout */}
      <nav className="w-full md:w-64 shrink-0 bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col p-5 md:p-6 md:h-screen md:sticky md:top-0 gap-6 md:gap-8 justify-between">
        
        {/* Top brand header plus mobile toggle/row */}
        <div className="flex flex-col gap-4 md:gap-8">
          <div className="flex items-center justify-between md:justify-start gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-zinc-950 font-bold shadow-md shadow-emerald-500/10">
                <Crosshair size={22} className="animate-pulse" />
              </div>
              <span className="text-xl font-black tracking-tight text-white select-none">
                SKYTTER<span className="text-emerald-400">APP</span>
              </span>
            </div>
            
            {/* V1.5 badge on mobile */}
            <span className="text-[10px] uppercase font-bold text-emerald-300 px-1.5 py-0.5 bg-zinc-950 rounded border border-zinc-800 md:hidden">
              V1.5
            </span>
          </div>

          {/* Quick horizontal nav under mobile brand or vertical block on desktop */}
          <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none" id="main-navigation-menu">
            {[
              { id: 'programs', label: 'Skyteprogram', icon: <Target size={18} /> },
              { id: 'weapons', label: 'Mine Våpen', icon: <Shield size={18} /> },
              { id: 'results', label: 'Historikk', icon: <ClipboardList size={18} /> },
              { id: 'graphs', label: 'Graf / Trend', icon: <BarChart3 size={18} /> },
              { id: 'rules', label: 'Reglement', icon: <HelpCircle size={18} /> }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSwitchTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 shrink-0 cursor-pointer text-sm font-semibold select-none ${
                    isActive
                      ? 'bg-zinc-850 border border-zinc-750 text-emerald-400 shadow-inner'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850/60'
                  }`}
                  id={`nav-tab-${tab.id}`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer - Active Weapon Card (Only on desktop md:flex) */}
        <div className="hidden md:flex flex-col gap-4">
          {weapons.length > 0 && (
            <div className="bg-zinc-950/60 border border-zinc-800 p-4 rounded-2xl">
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-bold">Aktivt Våpen</div>
              <div className="font-bold text-zinc-100 text-sm truncate">{weapons[0].brand} {weapons[0].model}</div>
              <div className="text-xs text-zinc-500 mt-0.5 truncate">SN: {weapons[0].serialNumber || '#Uregistrert'}</div>
              
              <div className="mt-3.5">
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono mb-1">
                  <span>Totale skudd:</span>
                  <span className="text-zinc-300 font-bold">{weapons[0].shotsFired}</span>
                </div>
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-300" 
                    style={{ width: `${Math.min(100, (weapons[0].shotsFired % 2000) / 20)}%` }}
                  />
                </div>
                <div className="text-[9px] mt-1 text-zinc-500 uppercase tracking-tight font-mono">
                  Service om {2000 - (weapons[0].shotsFired % 2000)} skudd
                </div>
              </div>
            </div>
          )}

          <div className="text-[10px] text-zinc-600 font-mono text-center">
            &copy; {new Date().getFullYear()} Skytterapp V1.5
          </div>
        </div>

      </nav>

      {/* Main Grid Viewport Canvas */}
      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 gap-6 max-w-full overflow-hidden" id="applet-main-canvas">
        
        {/* Bento Dashboard Section Headers */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-5 md:p-6 gap-4" id="bento-layout-header">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold mb-1">Bane 4 • Sivilpistolklubben</div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              {activeTab === 'programs' && 'Skyteprogram'}
              {activeTab === 'weapons' && 'Mine Våpen'}
              {activeTab === 'results' && 'Skyteresultater'}
              {activeTab === 'graphs' && 'Statistikk / Graf'}
              {activeTab === 'rules' && 'Skytereglement'}
            </h1>
            <p className="text-zinc-400 text-xs mt-0.5 max-w-lg">
              {activeTab === 'programs' && 'Baneøvelser, tidsintervaller og direkte loggføring.'}
              {activeTab === 'weapons' && 'Registrer og vedlikehold din personlige skytevåpen-portefølje.'}
              {activeTab === 'results' && 'Historisk oversikt og dypdykk i lagrede serier med snittskår.'}
              {activeTab === 'graphs' && 'Eksponentiell progresjon eller trender over tid.'}
              {activeTab === 'rules' && 'NSF og NROF regelverksoversikt. Avstander, skiver og skytetider.'}
            </p>
          </div>

          <div className="flex gap-4 items-center bg-zinc-950/40 border border-zinc-800 px-4 py-3 rounded-xl max-sm:justify-between shrink-0">
            <div className="text-left sm:text-right">
              <div className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Sum Resultater</div>
              <div className="text-xl font-mono font-black text-emerald-400">{results.length}</div>
            </div>
            <div className="w-px bg-zinc-800 h-8"></div>
            <div className="text-left sm:text-right">
              <div className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Aktive Våpen</div>
              <div className="text-xl font-mono font-black text-zinc-100">{weapons.length}</div>
            </div>
          </div>
        </div>

        {/* Selected Component Container with Fade-in motion feel (using bento containers) */}
        <div className="flex flex-col gap-6" id="bento-content-box">
          {activeTab === 'programs' && (
            <ProgramRunner
              weapons={weapons}
              onAddResult={handleAddResult}
              onUpdateWeapons={handleUpdateWeapons}
              onSwitchTab={handleSwitchTab}
            />
          )}

          {activeTab === 'weapons' && (
            <WeaponsTab
              weapons={weapons}
              onUpdateWeapons={handleUpdateWeapons}
            />
          )}

          {activeTab === 'results' && (
            <ResultsTab
              results={results}
              onDeleteResult={handleDeleteResult}
            />
          )}

          {activeTab === 'graphs' && (
            <GraphTab
              results={results}
            />
          )}

          {activeTab === 'rules' && (
            <RulesTab />
          )}
        </div>

        {/* Mobile-only humble footer */}
        <footer className="text-center py-2 md:hidden text-[10px] text-zinc-600 font-mono mt-auto">
          &copy; {new Date().getFullYear()} Skytterapp. Norges Skytterforbund / NROF Regler.
        </footer>
      </main>
    </div>
  );
}
