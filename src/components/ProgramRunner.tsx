import React, { useState, useEffect, useRef } from 'react';
import { Weapon, SavedResult, ProgramType, SeriesConfig, SeriesResult, ShotValue } from '../types.ts';
import { PROGRAM_TEMPLATES } from '../programConfigs.ts';
import { Play, Square, CirclePlus, RotateCcw, CheckCircle2, ChevronRight, AlertCircle, Volume2, ShieldAlert } from 'lucide-react';

interface ProgramRunnerProps {
  weapons: Weapon[];
  onAddResult: (result: SavedResult) => void;
  onUpdateWeapons: (weapons: Weapon[]) => void;
  onSwitchTab: (tabId: string) => void;
}

export default function ProgramRunner({ weapons, onAddResult, onUpdateWeapons, onSwitchTab }: ProgramRunnerProps) {
  // Setup States
  const [selectedProgramType, setSelectedProgramType] = useState<ProgramType | null>(null);
  const [selectedWeaponId, setSelectedWeaponId] = useState<string>('');
  const [isProgramRunning, setIsProgramRunning] = useState(false);

  // Active Session States
  const [seriesList, setSeriesList] = useState<SeriesConfig[]>([]);
  const [currentSeriesIndex, setCurrentSeriesIndex] = useState(0);
  const [shotInputs, setShotInputs] = useState<ShotValue[]>([]);
  const [completedSeriesResults, setCompletedSeriesResults] = useState<SeriesResult[]>([]);
  const [focusedShotIndex, setFocusedShotIndex] = useState<number>(0);

  // Fritrening custom state
  const [freeSeriesCount, setFreeSeriesCount] = useState(0);

  // Sounds & Timer States
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerStage, setTimerStage] = useState<'idle' | 'charging' | 'shooting' | 'finished'>('idle');
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Set default weapon if available
  useEffect(() => {
    if (weapons.length > 0 && !selectedWeaponId) {
      setSelectedWeaponId(weapons[0].id);
    }
  }, [weapons, selectedWeaponId]);

  // Handle Beep Sound using Web Audio API safely
  const playBeep = (frequency: number, duration: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      // Fade out
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.log('Audio contextual permissions blocked: ' + e);
    }
  };

  // Setup program runner on launch
  const handleStartProgram = () => {
    if (!selectedProgramType) return;
    if (!selectedWeaponId) {
      alert('Vennligst velg eller registrer en pistol først.');
      return;
    }

    const template = PROGRAM_TEMPLATES[selectedProgramType];
    let configs: SeriesConfig[] = [];

    if (selectedProgramType === ProgramType.Fritrening) {
      // Create initial series for Free Training
      configs = [{
        id: 1,
        name: 'Serie 1',
        timeLimit: 0, // No time limit by default for free training
        shotsCount: 5,
        isPractice: false
      }];
      setFreeSeriesCount(1);
    } else {
      configs = [...template.series];
    }

    setSeriesList(configs);
    setCurrentSeriesIndex(0);
    setShotInputs([]);
    setCompletedSeriesResults([]);
    setFocusedShotIndex(0);
    setIsProgramRunning(true);
    resetTimer();

    const activeConfig = configs[0];
    if (activeConfig && activeConfig.timeLimit > 0) {
      setTimeLeft(activeConfig.timeLimit);
    } else {
      setTimeLeft(0);
    }
  };

  // Timer Handlers
  const handleStartTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsTimerActive(true);
    setTimerStage('charging');
    
    // Countdown warning: 3 seconds loading command
    let chargingTicks = 3;
    playBeep(440, 0.1); // Short warning beep

    timerIntervalRef.current = setInterval(() => {
      if (chargingTicks > 1) {
        chargingTicks -= 1;
        playBeep(440, 0.08);
      } else {
        // Switch to shooting phase!
        clearInterval(timerIntervalRef.current!);
        setTimerStage('shooting');
        
        const activeSeries = seriesList[currentSeriesIndex];
        const initialLimit = activeSeries ? activeSeries.timeLimit : 60;
        setTimeLeft(initialLimit);
        playBeep(1000, 0.6); // LONG RANGE START BEEP!

        timerIntervalRef.current = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              // Timer finished!
              clearInterval(timerIntervalRef.current!);
              setIsTimerActive(false);
              setTimerStage('finished');
              playBeep(600, 0.8); // LONG END BEEP!
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }, 1000);
  };

  const handleStopTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsTimerActive(false);
    setTimerStage('idle');
    const activeSeries = seriesList[currentSeriesIndex];
    setTimeLeft(activeSeries ? activeSeries.timeLimit : 0);
  };

  const resetTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsTimerActive(false);
    setTimerStage('idle');
    const activeSeries = seriesList[currentSeriesIndex];
    setTimeLeft(activeSeries ? activeSeries.timeLimit : 0);
  };

  const activeSeriesConfig = seriesList[currentSeriesIndex];

  // Scoring handlers
  const handleAddShotScore = (value: ShotValue) => {
    const updatedShots = [...shotInputs];
    updatedShots[focusedShotIndex] = value;
    setShotInputs(updatedShots);

    // Auto focus next shot slot
    if (focusedShotIndex < 4) {
      setFocusedShotIndex(focusedShotIndex + 1);
    }
  };

  const handleClearLastShot = () => {
    if (focusedShotIndex > 0 && shotInputs[focusedShotIndex] === undefined) {
      const updated = [...shotInputs];
      updated[focusedShotIndex - 1] = undefined as any;
      setShotInputs(updated.filter(Boolean));
      setFocusedShotIndex(focusedShotIndex - 1);
    } else {
      const updated = [...shotInputs];
      updated[focusedShotIndex] = undefined as any;
      setShotInputs(updated.filter(Boolean));
    }
  };

  const handleResetSeriesShots = () => {
    setShotInputs([]);
    setFocusedShotIndex(0);
  };

  // Score computation helpers
  const calculateResultStats = (shots: ShotValue[]) => {
    let score = 0;
    let innerTens = 0;
    shots.forEach(s => {
      if (!s) return;
      if (s === 'X') {
        score += 10;
        innerTens += 1;
      } else {
        score += Number(s) || 0;
      }
    });
    return { score, innerTens };
  };

  // Progress to next series
  const handleNextSeries = () => {
    if (shotInputs.length < 5) {
      alert('Vennligst legg inn verdi for alle 5 skudd før du går videre.');
      return;
    }

    const { score, innerTens } = calculateResultStats(shotInputs);
    const seriesRes: SeriesResult = {
      config: activeSeriesConfig,
      shots: [...shotInputs],
      score,
      innerTens
    };

    const nextCompleted = [...completedSeriesResults, seriesRes];
    setCompletedSeriesResults(nextCompleted);

    // Is there a next series?
    if (selectedProgramType === ProgramType.Fritrening) {
      // In Free Training, we manually choose to finish or add next
      // We auto-prepare the next series config automatically
      const nextId = freeSeriesCount + 1;
      const nextConfig: SeriesConfig = {
        id: nextId,
        name: `Serie ${nextId}`,
        timeLimit: 0,
        shotsCount: 5,
        isPractice: false
      };
      setFreeSeriesCount(nextId);
      setSeriesList([...seriesList, nextConfig]);
      setCurrentSeriesIndex(currentSeriesIndex + 1);
      setShotInputs([]);
      setFocusedShotIndex(0);
      resetTimer();
    } else if (currentSeriesIndex + 1 < seriesList.length) {
      // Standard shooting programs
      setCurrentSeriesIndex(currentSeriesIndex + 1);
      setShotInputs([]);
      setFocusedShotIndex(0);
      
      const nextConfig = seriesList[currentSeriesIndex + 1];
      setTimeLeft(nextConfig ? nextConfig.timeLimit : 0);
      resetTimer();
    } else {
      // Program completely typed! Proceed to save summary.
    }
  };

  // Quit and save entire session
  const saveCompletedProgram = () => {
    // Collect last ongoing series if fully filled and not saved yet
    let finalCompleted = [...completedSeriesResults];
    if (shotInputs.length === 5) {
      const { score, innerTens } = calculateResultStats(shotInputs);
      const seriesRes: SeriesResult = {
        config: activeSeriesConfig,
        shots: [...shotInputs],
        score,
        innerTens
      };
      finalCompleted.push(seriesRes);
    }

    if (finalCompleted.length === 0) {
      setIsProgramRunning(false);
      setSelectedProgramType(null);
      return;
    }

    // Identify weapon information
    const gun = weapons.find(w => w.id === selectedWeaponId);
    const gunLabel = gun ? `${gun.brand} ${gun.model}` : 'Ukjent våpen';

    // Calculate total scores (EXCLUDE practice series)
    const officialSeries = finalCompleted.filter(s => !s.config.isPractice);
    const totalScore = selectedProgramType === ProgramType.Fritrening
      ? 0 // Free training scores do not accumulate
      : officialSeries.reduce((acc, s) => acc + s.score, 0);

    const innerTensCount = officialSeries.reduce((acc, s) => acc + s.innerTens, 0);

    // Create saved structure
    const newSave: SavedResult = {
      id: 'res_' + Date.now(),
      date: new Date().toISOString(),
      programType: selectedProgramType!,
      weaponId: selectedWeaponId,
      weaponLabel: gunLabel,
      seriesCount: finalCompleted.length,
      series: finalCompleted.map(s => ({
        name: s.config.name,
        timeLimit: s.config.timeLimit,
        distance: s.config.distance,
        stance: s.config.stance,
        shots: s.shots,
        score: s.score,
        innerTens: s.innerTens,
        isPractice: s.config.isPractice
      })),
      totalScore,
      innerTensCount
    };

    // Trigger save callback (this will add results array state in parent)
    onAddResult(newSave);

    // INCREMENT weapon shots fired counter!
    // Total shots fired = total series * 5 shots
    const totalShotsLog = finalCompleted.length * 5;
    const updatedWeapons = weapons.map(w => {
      if (w.id === selectedWeaponId) {
        return {
          ...w,
          shotsFired: w.shotsFired + totalShotsLog
        };
      }
      return w;
    });
    onUpdateWeapons(updatedWeapons);

    // Show success & jump to results page
    alert(`Gratulerer! Resultat lagret. Det ble registrert ${totalShotsLog} avfyrte skudd på din ${gunLabel}.`);
    setIsProgramRunning(false);
    setSelectedProgramType(null);
    onSwitchTab('results');
  };

  const handleAbandonProgram = () => {
    if (confirm('Er du sikker på at du vil avbryte? Ingen skudd eller poeng blir lagret.')) {
      setIsProgramRunning(false);
      setSelectedProgramType(null);
      resetTimer();
    }
  };

  // Dynamic status details
  const totalFiredShotsLogCount = completedSeriesResults.length * 5 + shotInputs.length;
  const isPracticeActive = activeSeriesConfig?.isPractice;

  // Key Entry listener to support lightning-fast physical keyboard scoring
  useEffect(() => {
    if (!isProgramRunning) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keys if focusing form elements (though there are none in runner)
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const key = e.key.toUpperCase();
      if (key === 'X' || key === '*') {
        handleAddShotScore('X');
      } else if (key === 'P') {
        // Toggle timer stage
        if (isTimerActive) handleStopTimer();
        else handleStartTimer();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleClearLastShot();
      } else if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(key)) {
        handleAddShotScore(key as ShotValue);
      } else if (key === 'A') {
        handleAddShotScore('10'); // Shortcut 'a' or '10' keys
      } else if (e.key === 'Enter') {
        if (shotInputs.length === 5) {
          handleNextSeries();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProgramRunning, focusedShotIndex, shotInputs, currentSeriesIndex, isTimerActive]);


  // RENDER SELECTION LAYOUT
  if (!isProgramRunning) {
    return (
      <div className="space-y-6 animate-fade-in" id="program-runner-container">
        <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
          <h2 className="text-lg font-black text-white tracking-tight">Velg Skyteprogram</h2>
          <p className="text-xs text-zinc-400">Velg type skyting og våpen for å starte registrering med integrert skyteklokke</p>
        </div>

        {/* Weapons validation block */}
        {weapons.length === 0 ? (
          <div className="p-6 bg-amber-500/5 border border-amber-500/20 text-amber-200 rounded-2xl flex items-start gap-4" id="missing-weapons-alert">
            <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-extrabold text-sm text-white">Ingen registrerte våpen</h4>
              <p className="text-xs text-amber-300/80 mt-1">
                Du må registrere en pistol under fliken <strong>Mine Våpen</strong> før du kan gjennomføre et program.
                Dette er nødvendig for å loggføre antall avfyrte skudd på riktig våpen.
              </p>
              <button 
                onClick={() => onSwitchTab('weapons')}
                className="mt-3 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Gå til Mine Våpen
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left selector sidebar */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-5 h-fit lg:col-span-1">
              <h3 className="font-black text-white pb-2 border-b border-zinc-850 text-xs uppercase tracking-wider font-mono">Konfigurasjon</h3>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 block">Velg Våpen for denne økten</label>
                <select
                  value={selectedWeaponId}
                  onChange={e => setSelectedWeaponId(e.target.value)}
                  className="w-full text-xs bg-zinc-950 border border-zinc-800 text-zinc-100 focus:border-emerald-500 rounded-xl px-3 py-2.5 font-semibold [color-scheme:dark]"
                  id="runner-weapon-select"
                >
                  {weapons.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.brand} {w.model} (S/N: {w.serialNumber || 'Uten'})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-zinc-500 font-mono">
                  Valgt våpen vil automatisk krediteres med alle avfyrte skudd fra denne økten.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleStartProgram}
                  disabled={!selectedProgramType}
                  className={`w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    selectedProgramType
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
                      : 'bg-zinc-800 text-zinc-650 cursor-not-allowed'
                  }`}
                  id="start-program-btn"
                >
                  <Play size={13} />
                  Start Skyteprogram
                </button>
              </div>
            </div>

            {/* Program selection list */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="font-black text-zinc-400 text-xs uppercase tracking-widest pl-1 font-mono">Tilgjengelige programmer</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="program-templates-grid">
                {Object.values(PROGRAM_TEMPLATES).map(template => {
                  const isSelected = selectedProgramType === template.type;
                  return (
                    <div
                      key={template.type}
                      onClick={() => setSelectedProgramType(template.type)}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between h-40 ${
                        isSelected
                          ? 'bg-emerald-500/5 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                          : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                      }`}
                      id={`program-card-${template.type}`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-extrabold text-sm sm:text-base text-white">{template.name}</h4>
                          {isSelected && (
                            <span className="bg-emerald-400 text-zinc-950 text-[9px] uppercase font-black px-2.5 py-0.5 rounded-full tracking-wider">
                              Valgt
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed font-sans">
                          {template.description}
                        </p>
                      </div>

                      <div className="border-t border-zinc-800/80 pt-2.5 flex justify-between items-center text-[10px] font-bold text-zinc-500 font-mono">
                        <span>
                          {template.type === ProgramType.Fritrening
                            ? 'Fritt antall skudd'
                            : `${template.series.length} serier x 5 skudd`}
                        </span>
                        <span>
                          {template.type === ProgramType.Fritrening
                            ? 'Fritrening'
                            : `${template.series.filter(s => !s.isPractice).length * 5} tellende skudd`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }


  // RENDER RUNNING PROGRAM SEQUENCE LAYOUT
  const isLastSeries = selectedProgramType !== ProgramType.Fritrening && currentSeriesIndex === seriesList.length - 1;
  const isSeriesFormFilled = shotInputs.length === 5;
  const currentGun = weapons.find(w => w.id === selectedWeaponId);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in" id="program-running-grid">
      {/* Top Header Card */}
      <div className="bg-zinc-900 border border-zinc-805 text-white rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-block text-[9px] text-emerald-400 font-black tracking-widest uppercase bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-md font-mono">
              {activeSeriesConfig?.isPractice ? 'Prøveserie' : 'Konkurranseserie'}
            </span>
            {activeSeriesConfig?.distance && (
              <span className="inline-block text-[9px] text-cyan-400 font-black tracking-widest uppercase bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-md font-mono">
                {activeSeriesConfig.distance}
              </span>
            )}
            {activeSeriesConfig?.stance && (
              <span className="inline-block text-[9px] text-purple-400 font-black tracking-widest uppercase bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-md font-mono">
                {activeSeriesConfig.stance}
              </span>
            )}
          </div>
          <h2 className="text-lg font-black mt-1.5 text-white">
            {PROGRAM_TEMPLATES[selectedProgramType!].name}
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5 font-mono">
            Våpen: <span className="font-semibold text-zinc-200">{currentGun?.brand} {currentGun?.model}</span> | Totalt registrert: {totalFiredShotsLogCount} skudd
          </p>
        </div>

        <button
          onClick={handleAbandonProgram}
          className="text-xs border border-red-500/20 text-red-400 hover:bg-red-500/10 px-3.5 py-1.5 rounded-xl font-bold transition-colors cursor-pointer self-start md:self-center"
        >
          Avbryt skyting
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Range command timer and layout */}
        <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-white text-xs uppercase tracking-wider">
              {selectedProgramType === ProgramType.Fritrening
                ? `Fritrening - Serie ${freeSeriesCount}`
                : `Serie ${currentSeriesIndex + 1} av ${seriesList.length}: ${activeSeriesConfig?.name}`}
            </h3>
            <span className="text-[10px] font-bold text-zinc-400 font-mono">
              Tidskrav: {activeSeriesConfig?.timeLimit === 0 ? 'Fritid' : `${activeSeriesConfig?.timeLimit} sek`}
            </span>
          </div>

          {/* RANGE TIMER DISPLAY & COMMANDS */}
          <div className="relative rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-850 p-6 flex flex-col items-center justify-center min-h-64">
            
            {/* Visual Screen Alert Color */}
            <div className={`absolute inset-0 opacity-12 transition-all duration-300 ${
              timerStage === 'charging' ? 'bg-amber-500' :
              timerStage === 'shooting' ? 'bg-emerald-500' :
              timerStage === 'finished' ? 'bg-red-500' : 'bg-slate-900'
            }`} />

            {/* Range commands feedback text */}
            <span className="text-[9px] font-bold tracking-widest text-zinc-500 uppercase mb-1 font-mono">
              STANDPLASS-KOMMANDO
            </span>

            <span className={`text-xl font-black uppercase tracking-wider mb-3 transition-colors duration-200 ${
              timerStage === 'charging' ? 'text-amber-400 animate-bounce' :
              timerStage === 'shooting' ? 'text-emerald-400 font-mono scale-110' :
              timerStage === 'finished' ? 'text-red-500' : 'text-zinc-500'
            }`}>
              {timerStage === 'charging' ? 'LADING! KLAR...' :
               timerStage === 'shooting' ? 'ILD!' :
               timerStage === 'finished' ? 'STANS! AVFYR' : 'STANDPLASS KLAR'}
            </span>

            {/* Circular time limit mockup */}
            <div className="relative flex items-center justify-center my-2">
              <span className={`text-5xl font-black font-mono transition-all ${
                timerStage === 'shooting' ? 'text-emerald-400' :
                timerStage === 'charging' ? 'text-amber-400' :
                timerStage === 'finished' ? 'text-red-500' : 'text-zinc-200'
              }`}>
                {activeSeriesConfig?.timeLimit === 0 ? '--' : timeLeft}
              </span>
              <span className="text-[10px] text-zinc-500 ml-1 font-mono">sek</span>
            </div>

            {/* Timer quick triggers */}
            {activeSeriesConfig?.timeLimit > 0 && (
              <div className="flex gap-2 mt-5 relative z-10">
                {!isTimerActive ? (
                  <button
                    onClick={handleStartTimer}
                    className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs px-4 py-2 rounded-xl transition-transform flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play size={12} />
                    Start timer
                  </button>
                ) : (
                  <button
                    onClick={handleStopTimer}
                    className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 font-bold text-xs px-4 py-2 rounded-xl transition-transform flex items-center gap-1.5 cursor-pointer"
                  >
                    <Square size={12} />
                    Stopp / Nullstill
                  </button>
                )}
                <button
                  onClick={resetTimer}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs px-3 py-2 rounded-xl transition-colors cursor-pointer"
                  title="Nullstill timer"
                >
                  <RotateCcw size={12} />
                </button>
              </div>
            )}

            {/* Range feedback sound tip */}
            <div className="mt-4 flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
              <Volume2 size={11} className="text-zinc-500" />
              <span>Syntetiske beeps simuleres for serie-kommandoer (lading og stans)</span>
            </div>
          </div>

          {/* ACCUMULATED SCORE INFORMATION */}
          {selectedProgramType !== ProgramType.Fritrening && (
            <div className="bg-zinc-950 border border-zinc-850 p-4 grid grid-cols-2 gap-4 rounded-xl">
              <div className="text-center border-r border-zinc-800/80">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Løpende sum</span>
                <span className="text-2xl font-mono font-black text-white inline-block mt-0.5">
                  {completedSeriesResults.filter(s => !s.config.isPractice).reduce((acc, s) => acc + s.score, 0)}
                </span>
                <span className="text-[10px] text-zinc-500 block font-bold">poeng</span>
              </div>
              <div className="text-center">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Innertiere</span>
                <span className="text-2xl font-mono font-black text-emerald-400 inline-block mt-0.5">
                  {completedSeriesResults.filter(s => !s.config.isPractice).reduce((acc, s) => acc + s.innerTens, 0)} X
                </span>
                <span className="text-[10px] text-zinc-500 block font-bold">innertiere</span>
              </div>
            </div>
          )}

          {/* Quick instructions / tips */}
          <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-4 text-xs text-zinc-400 space-y-1 font-sans">
            <span className="font-bold text-emerald-400 block">💡 Hurtigtaster for skåring:</span>
            <p className="leading-relaxed">
              Bruk tallene <strong className="font-mono bg-zinc-950 text-emerald-400 border border-emerald-500/20 px-1 py-0.2 rounded">0-9</strong> på tastaturet for direkte skåring. Tast <strong className="font-mono bg-zinc-950 text-emerald-400 border border-emerald-500/20 px-1 py-0.2 rounded">X</strong> for innertier. Trykk <strong className="font-mono bg-zinc-950 text-emerald-400 border border-emerald-500/20 px-1 py-0.2 rounded">Backspace</strong> for å angre. <strong className="font-mono bg-zinc-950 text-emerald-400 border border-emerald-500/20 px-1 py-0.2 rounded">Enter</strong> går til neste serie!
            </p>
          </div>
        </div>

        {/* Right column: Target input and interactive scoring pad */}
        <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">Legg inn skuddverdier</h3>
              <span className="text-[9px] font-bold tracking-widest text-zinc-500 uppercase">5 skudd per serie</span>
            </div>

            {/* 5 ACTIVE SHOT SLOTS */}
            <div className="flex justify-between items-center gap-1.5 bg-zinc-950 border border-zinc-850 p-3 rounded-2xl mb-6">
              {[0, 1, 2, 3, 4].map(idx => {
                const val = shotInputs[idx];
                const isSelected = focusedShotIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setFocusedShotIndex(idx)}
                    className={`h-10 w-10 sm:h-11 sm:w-11 rounded-full text-xs sm:text-sm font-black transition-all flex items-center justify-center relative cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 text-zinc-950 ring-2 ring-emerald-500 scale-105 shadow-md'
                        : val !== undefined
                        ? 'bg-zinc-805 border border-zinc-700 text-white font-mono'
                        : 'border-2 border-dashed border-zinc-800 text-zinc-650 hover:border-zinc-700 bg-zinc-900/50'
                    }`}
                    id={`shot-slot-input-${idx}`}
                  >
                    {val !== undefined ? val : idx + 1}
                    {val === 'X' && (
                      <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-[6px] text-zinc-950 px-1 font-black rounded-full scale-90 border border-zinc-950">
                        10*
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* NUMERICAL & X SCORING BUTTONS */}
            <div className="grid grid-cols-3 gap-2" id="scoring-buttons-keyboard-pad">
              {['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '10', 'X'].map(val => (
                <button
                  key={val}
                  onClick={() => handleAddShotScore(val as ShotValue)}
                  className={`py-3.5 rounded-xl font-bold font-mono text-xs sm:text-sm transition-all select-none hover:shadow-xs cursor-pointer ${
                    val === 'X'
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-black text-sm'
                      : val === '10'
                      ? 'bg-zinc-100 hover:bg-white text-zinc-950 font-black'
                      : 'bg-zinc-800 hover:bg-zinc-750 text-zinc-200'
                  }`}
                  id={`kb-btn-${val}`}
                >
                  {val}
                </button>
              ))}
            </div>

            {/* Quick reset actions */}
            <div className="flex gap-2 mt-4 text-xs font-semibold">
              <button
                onClick={handleClearLastShot}
                disabled={shotInputs.length === 0}
                className="flex-1 py-2 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 disabled:opacity-30 rounded-lg transition-colors cursor-pointer"
                id="delete-last-shot-btn"
              >
                Angre skudd
              </button>
              <button
                onClick={handleResetSeriesShots}
                className="flex-1 py-2 border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                id="reset-series-btn"
              >
                Tøm serie
              </button>
            </div>
          </div>

          {/* ACTIVE FOOTER ACTIONS */}
          <div className="border-t border-zinc-800/80 pt-5 space-y-3">
            {/* Live calculation feedback */}
            {isSeriesFormFilled && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-emerald-400 text-xs flex justify-between items-center font-bold font-mono">
                <span>SERIERESULTAT:</span>
                <span>
                  Poeng: <strong className="text-white">{calculateResultStats(shotInputs).score}</strong> ({calculateResultStats(shotInputs).innerTens} X)
                </span>
              </div>
            )}

            <div className="flex gap-3">
              {/* Only show "next series" if there are more series on standard layouts */}
              {(!isLastSeries || selectedProgramType === ProgramType.Fritrening) ? (
                <button
                  onClick={handleNextSeries}
                  disabled={!isSeriesFormFilled}
                  className={`flex-1 py-3 font-extrabold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSeriesFormFilled
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-md'
                      : 'bg-zinc-800 text-zinc-650 cursor-not-allowed'
                  }`}
                  id="runner-next-series-btn"
                >
                  Neste serie
                  <ChevronRight size={13} />
                </button>
              ) : null}

              {/* Show complete/save results */}
              {(isLastSeries || selectedProgramType === ProgramType.Fritrening) && (
                <button
                  onClick={saveCompletedProgram}
                  disabled={!isSeriesFormFilled && completedSeriesResults.length === 0}
                  className={`flex-1 py-3 font-extrabold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isSeriesFormFilled || completedSeriesResults.length > 0
                      ? 'bg-indigo-500 hover:bg-indigo-400 text-zinc-950 shadow-md'
                      : 'bg-zinc-800 text-zinc-655 cursor-not-allowed'
                  }`}
                  id="runner-complete-and-save-btn"
                >
                  <CheckCircle2 size={13} />
                  Avslutt og lagre økt
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* HORIZONTAL LOG OF CURRENTLY COMPLETE SERIES */}
      {completedSeriesResults.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-805 p-5 rounded-2xl space-y-3" id="running-log-timeline">
          <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Utførte serier totalt</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {completedSeriesResults.map((ser, index) => (
              <div
                key={index}
                className={`text-xs p-3 rounded-lg flex items-center justify-between border ${
                  ser.config.isPractice ? 'bg-amber-500/5 border-amber-500/20 text-amber-200' : 'bg-zinc-950 border-zinc-850 text-zinc-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-zinc-200">
                    {index + 1}. {ser.config.name}
                  </span>
                  {ser.config.isPractice && (
                    <span className="text-[8px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded uppercase">
                      Prøve
                    </span>
                  )}
                  {ser.config.distance && (
                    <span className="text-[8px] font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/25 px-1.5 py-0.2 rounded uppercase font-mono">
                      {ser.config.distance}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex gap-1.5 font-mono">
                    {ser.shots.map((sh, sIdx) => (
                      <span key={sIdx} className="bg-zinc-800 border border-zinc-750 text-zinc-200 px-1.5 py-0.5 rounded font-black text-[10px]">
                        {sh}
                      </span>
                    ))}
                  </div>

                  <span className="font-mono font-bold text-right text-zinc-200 min-w-16">
                    Mål: {ser.score} {ser.innerTens > 0 && `(${ser.innerTens} X)`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
