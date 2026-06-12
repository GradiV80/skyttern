import React, { useState } from 'react';
import { SavedResult, ProgramType, ShotValue } from '../types.ts';
import { PROGRAM_TEMPLATES } from '../programConfigs.ts';
import { Search, Calendar, ChevronDown, ChevronUp, Trash2, Info, Award, Crosshair, Download } from 'lucide-react';

interface ResultsTabProps {
  results: SavedResult[];
  onDeleteResult: (id: string) => void;
}

export default function ResultsTab({ results, onDeleteResult }: ResultsTabProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleExportResultsCSV = () => {
    const headers = [
      'Dato og tid',
      'Programtype',
      'Programnavn',
      'Våpen',
      'Våpen ID',
      'Serie-nummer',
      'Serienavn',
      'Prøveserie',
      'Tidsgrense (sek)',
      'Avstand',
      'Stilling',
      'Skudd 1',
      'Skudd 2',
      'Skudd 3',
      'Skudd 4',
      'Skudd 5',
      'Seriescore',
      'Serie Innertiere',
      'Økt Totalscore',
      'Økt Totale Innertiere'
    ];

    const rows: string[][] = [];
    const sortedResults = [...results].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedResults.forEach(res => {
      const formattedDate = new Date(res.date).toISOString().replace('T', ' ').substring(0, 19);
      const programLabel = getProgramName(res.programType);

      res.series.forEach((ser, index) => {
        const row = [
          formattedDate,
          res.programType,
          programLabel,
          res.weaponLabel || '',
          res.weaponId || '',
          String(index + 1),
          ser.name || '',
          ser.isPractice ? 'Ja' : 'Nei',
          ser.timeLimit === 0 ? 'Fritid' : String(ser.timeLimit),
          ser.distance || '–',
          ser.stance || '–',
          ser.shots[0] !== undefined ? String(ser.shots[0]) : '',
          ser.shots[1] !== undefined ? String(ser.shots[1]) : '',
          ser.shots[2] !== undefined ? String(ser.shots[2]) : '',
          ser.shots[3] !== undefined ? String(ser.shots[3]) : '',
          ser.shots[4] !== undefined ? String(ser.shots[4]) : '',
          String(ser.score),
          String(ser.innerTens),
          String(res.totalScore),
          String(res.innerTensCount)
        ];
        rows.push(row);
      });
    });

    const escapeCSV = (str: string) => {
      const cleaned = str.replace(/"/g, '""');
      return `"${cleaned}"`;
    };

    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `skyteresultater_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredResults = results
    .filter(res => filterType === 'all' || res.programType === filterType)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getProgramName = (type: ProgramType) => {
    return PROGRAM_TEMPLATES[type]?.name || type;
  };

  const getAverageShotScore = (res: SavedResult) => {
    let sum = 0;
    let count = 0;
    res.series.forEach(ser => {
      // Exclude practice series from averages
      if (ser.isPractice) return;
      ser.shots.forEach(s => {
        count++;
        if (s === 'X') sum += 10;
        else sum += Number(s) || 0;
      });
    });
    return count > 0 ? (sum / count).toFixed(1) : '–';
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering accordion expand
    if (confirm('Er du sikker på at du vil slette dette resultatet permanent? Dette vil ikke tilbakeskrive skuddstelleren for våpenet, da skuddene allerede er bekreftet avfyrt.')) {
      onDeleteResult(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="results-tab-container">
      {/* Filtering header controls */}
      <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white tracking-tight">Skyteresultater</h2>
          <p className="text-xs text-zinc-400">Historisk oversikt og detaljer over dine avfyrte programmer.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-zinc-400 block shrink-0">Filtrer program:</label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="text-xs bg-zinc-950 border border-zinc-800 text-zinc-100 focus:border-emerald-500 rounded-xl px-3 py-2 font-semibold [color-scheme:dark]"
              id="results-program-filter"
            >
              <option value="all">Vis alle programmer</option>
              <option value={ProgramType.NAIS}>NAIS</option>
              <option value={ProgramType.Hurtig}>Hurtigpistol</option>
              <option value={ProgramType.Standardpistol}>Standardpistol</option>
              <option value={ProgramType.T96}>T96 Felt</option>
              <option value={ProgramType.Fritrening}>Fritrening</option>
            </select>
          </div>

          {results.length > 0 && (
            <button
              onClick={handleExportResultsCSV}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-500/10"
              id="export-results-csv-btn"
              title="Eksporter alle skyteresultater og serier til en Excel-kompatibel CSV-fil"
            >
              <Download size={13} />
              Eksporter til CSV
            </button>
          )}
        </div>
      </div>

      {filteredResults.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900 rounded-2xl border border-dashed border-zinc-800" id="no-results-notice">
          <Info className="mx-auto text-zinc-500 mb-3" size={40} />
          <h4 className="text-base font-bold text-zinc-200">Ingen resultater funnet</h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
            {filterType === 'all'
              ? 'Du har ikke gjennomført noen skyteprogram økter ennå.'
              : `Du har ikke lagret noen resultater for '${getProgramName(filterType as ProgramType)}' ennå.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4" id="results-history-list">
          {filteredResults.map(res => {
            const isExpanded = expandedId === res.id;
            const resDate = new Date(res.date);
            const isFritrening = res.programType === ProgramType.Fritrening;

            return (
              <div
                key={res.id}
                onClick={() => toggleExpand(res.id)}
                className={`bg-zinc-900 border rounded-2xl overflow-hidden transition-all duration-150 cursor-pointer ${
                  isExpanded ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.05)]' : 'border-zinc-805 hover:border-zinc-700'
                }`}
                id={`result-item-${res.id}`}
              >
                {/* Main Card Header */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {getProgramName(res.programType)}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                        <Calendar size={11} />
                        {resDate.toLocaleDateString('no-NO')} {resDate.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-white text-base leading-snug">
                      {isFritrening
                        ? `Fritreningsøkt • ${res.series.length} serier`
                        : `${getProgramName(res.programType)} konkurranse`}
                    </h3>
                    <p className="text-xs text-zinc-500 font-mono">
                      Våpen brukt: <span className="font-semibold text-zinc-300">{res.weaponLabel}</span>
                    </p>
                  </div>

                  {/* High level metrics preview */}
                  <div className="flex items-center gap-5 sm:gap-8 justify-between sm:justify-end border-t sm:border-t-0 border-zinc-800/80 pt-3.5 sm:pt-0">
                    <div className="flex gap-6">
                      {!isFritrening ? (
                        <>
                          <div className="text-right">
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Poengsum</span>
                            <span className="text-lg font-mono font-black text-white">
                              {res.totalScore}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Innertiere</span>
                            <span className="text-lg font-mono font-black text-emerald-400">
                              {res.innerTensCount} X
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-right">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Snitt per serie</span>
                          <span className="text-sm font-mono font-bold text-zinc-200">
                            {(res.series.reduce((acc, s) => acc + s.score, 0) / res.series.length).toFixed(1)} poeng
                          </span>
                        </div>
                      )}
                      
                      <div className="text-right hidden xs:block">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Snittskudd</span>
                        <span className="text-lg font-mono font-black text-zinc-300">
                          {getAverageShotScore(res)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <button
                        onClick={(e) => handleDeleteClick(res.id, e)}
                        className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer animate-none"
                        title="Slett resultat"
                        id={`delete-result-item-${res.id}`}
                      >
                        <Trash2 size={14} />
                      </button>
                      <div>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded drilldown dashboard */}
                {isExpanded && (
                  <div className="bg-zinc-950/70 border-t border-zinc-800/60 p-4 sm:p-5 space-y-4 animate-fade-in" id={`result-drilldown-${res.id}`}>
                    <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                      <Crosshair size={13} className="text-zinc-500" />
                      <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Løpende serie-spesifikasjon</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {res.series.map((ser, sIdx) => (
                        <div
                          key={sIdx}
                          className={`bg-zinc-900 border rounded-xl p-3 space-y-2 flex flex-col justify-between ${
                            ser.isPractice ? 'border-amber-500/20 bg-amber-500/5' : 'border-zinc-800/70'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white text-xs">
                                {ser.name}
                              </span>
                              {ser.isPractice && (
                                <span className="text-[8px] font-black text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded uppercase">
                                  Prøve
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-xs font-bold text-zinc-200">
                              Poeng: {ser.score} {ser.innerTens > 0 && `(${ser.innerTens} X)`}
                            </span>
                          </div>

                          {/* Quick spec description metadata */}
                          {(ser.timeLimit > 0 || ser.distance || ser.stance) && (
                            <div className="flex flex-wrap gap-1.5 text-[10px] text-zinc-500 font-mono">
                              {ser.timeLimit > 0 && (
                                <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">Tid: {ser.timeLimit}s</span>
                              )}
                              {ser.distance && (
                                <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded">{ser.distance}</span>
                              )}
                              {ser.stance && (
                                <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded">{ser.stance}</span>
                              )}
                            </div>
                          )}

                          {/* Shots visually depicted as micro rings */}
                          <div className="flex flex-wrap gap-1.5 pt-1.5 font-mono">
                            {ser.shots.map((sh, bIdx) => (
                              <span
                                key={bIdx}
                                className={`text-[10px] h-6 w-6 rounded-full font-black flex items-center justify-center border ${
                                  sh === 'X'
                                    ? 'bg-emerald-500 border-emerald-500 text-zinc-950 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                                    : sh === '10'
                                    ? 'bg-zinc-200 border-zinc-300 text-zinc-950'
                                    : 'bg-zinc-800 border-zinc-700 text-zinc-350'
                                }`}
                              >
                                {sh}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Fun badge metrics for completed standard drills */}
                    {!isFritrening && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3 mt-4">
                        <Award size={18} className="text-emerald-400 shrink-0 animate-pulse" />
                        <span className="text-xs text-zinc-300 leading-snug">
                          <strong>Ytelsesanalyse:</strong> Gjennomsnittlig serieresultat for denne skytingen er{' '}
                          <strong className="text-emerald-400">
                            {(res.totalScore / res.series.filter(s => !s.isPractice).length).toFixed(1)}
                          </strong>{' '}
                          poeng pr. 5 skudd, med totalt {res.innerTensCount} registrerte innertiere.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
