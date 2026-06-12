import React, { useState } from 'react';
import { SavedResult, ProgramType } from '../types.ts';
import { PROGRAM_TEMPLATES } from '../programConfigs.ts';
import { TrendingUp, Award, Calendar, Activity, Info } from 'lucide-react';

interface GraphTabProps {
  results: SavedResult[];
}

export default function GraphTab({ results }: GraphTabProps) {
  const [selectedProgram, setSelectedProgram] = useState<ProgramType>(ProgramType.NAIS);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Group results for this program and sort chronologically (oldest to newest for plotting)
  const programResults = results
    .filter(res => res.programType === selectedProgram)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Determine Max Potential Score for reference line
  const getMaxPotentialScore = (type: ProgramType): number => {
    switch (type) {
      case ProgramType.NAIS:
        return 300; // 6 series * 50
      case ProgramType.Hurtig:
        return 600; // 12 series * 50
      case ProgramType.Standardpistol:
        return 600; // 12 series * 50
      case ProgramType.T96:
        return 800; // 16 series * 50
      case ProgramType.Fritrening:
        return 50; // We will map Fritrening to Average Series Score (0-50 max)
      default:
        return 300;
    }
  };

  const getChartValue = (res: SavedResult): number => {
    if (res.programType === ProgramType.Fritrening) {
      // Return average series score
      if (res.series.length === 0) return 0;
      const total = res.series.reduce((sum, s) => sum + s.score, 0);
      return Math.round(total / res.series.length);
    }
    return res.totalScore;
  };

  const maxPossible = getMaxPotentialScore(selectedProgram);
  const dataPoints = programResults.map((res, idx) => ({
    index: idx,
    id: res.id,
    date: new Date(res.date),
    value: getChartValue(res),
    weapon: res.weaponLabel,
    innerTens: res.innerTensCount,
    rawResult: res
  }));

  // Statistics
  const values = dataPoints.map(p => p.value);
  const highestScore = values.length > 0 ? Math.max(...values) : 0;
  const lowestScore = values.length > 0 ? Math.min(...values) : 0;
  const averageScore = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;

  // Render SVG configuration
  const width = 640;
  const height = 280;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Map value to SVG coordinate
  const getX = (index: number) => {
    if (dataPoints.length <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (index / (dataPoints.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    // Dynamic bottom range logic, but make sure we keep space
    const minLimit = selectedProgram === ProgramType.Fritrening ? 20 : maxPossible * 0.4;
    const bottom = Math.min(...values, minLimit);
    const top = maxPossible;
    const range = top - bottom || 1;
    return paddingTop + chartHeight - ((val - bottom) / range) * chartHeight;
  };

  // Generate SVG Path line
  let pathD = '';
  if (dataPoints.length > 1) {
    pathD = dataPoints.reduce((acc, p, i) => {
      const x = getX(i);
      const y = getY(p.value);
      return acc + `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }, '');
  }

  // Generate Area under line
  let areaD = '';
  if (dataPoints.length > 1) {
    const startX = getX(0);
    const endX = getX(dataPoints.length - 1);
    const bottomY = paddingTop + chartHeight;
    areaD = `${pathD} L ${endX} ${bottomY} L ${startX} ${bottomY} Z`;
  }

  return (
    <div className="space-y-6 animate-fade-in" id="progress-graph-container">
      {/* Selector Heading */}
      <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white tracking-tight">Progresjonsgraf</h2>
          <p className="text-xs text-zinc-400">Spor din ukes- og månedsprogresjon per skyteprogram</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-zinc-400 block shrink-0">Hent program:</label>
          <select
            value={selectedProgram}
            onChange={e => {
              setSelectedProgram(e.target.value as ProgramType);
              setHoveredPointIndex(null);
            }}
            className="text-xs bg-zinc-950 border border-zinc-800 text-zinc-100 focus:border-emerald-500 rounded-xl px-3 py-2 font-semibold [color-scheme:dark]"
            id="graph-program-select"
          >
            <option value={ProgramType.NAIS}>NAIS (Maks 300 poeng)</option>
            <option value={ProgramType.Hurtig}>Hurtigpistol (Maks 600 poeng)</option>
            <option value={ProgramType.Standardpistol}>Standardpistol (Maks 600 poeng)</option>
            <option value={ProgramType.T96}>T96 Felt (Maks 800 poeng)</option>
            <option value={ProgramType.Fritrening}>Fritrening (Snitt per 5-skudd, Maks 50 poeng)</option>
          </select>
        </div>
      </div>

      {dataPoints.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900 rounded-2xl border border-dashed border-zinc-800" id="graph-empty-notice">
          <Activity className="mx-auto text-zinc-500 mb-3 animate-pulse" size={44} />
          <h4 className="text-base font-bold text-zinc-200">Ingen måledata tilgjengelig</h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 mb-4">
            Du må fullføre og lagre minst to resultater i skyteprogrammet <strong>'{PROGRAM_TEMPLATES[selectedProgram]?.name}'</strong> for å spenne opp progresjonskurven din.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Key statistical metrics cards */}
          <div className="lg:col-span-1 space-y-3.5 flex flex-col justify-between">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Beste poengsum</span>
              <span className="text-2xl font-black font-mono text-emerald-400 block mt-0.5" id="stats-best-score">
                {highestScore} <span className="text-xs text-zinc-500 font-normal">p</span>
              </span>
              <p className="text-[10px] text-zinc-550 mt-1">Av {maxPossible} mulige</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Gjennomsnitt</span>
              <span className="text-2xl font-black font-mono text-white block mt-0.5" id="stats-avg-score">
                {averageScore} <span className="text-xs text-zinc-500 font-normal">p</span>
              </span>
              <p className="text-[10px] text-zinc-550 mt-1">Gjennom totalt {dataPoints.length} skytinger</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Siste skutt</span>
              <span className="text-2xl font-black font-mono text-cyan-400 block mt-0.5" id="stats-latest-score">
                {dataPoints[dataPoints.length - 1].value} <span className="text-xs text-zinc-500 font-normal">p</span>
              </span>
              <p className="text-[10px] text-zinc-550 mt-1">
                Dato: {dataPoints[dataPoints.length - 1].date.toLocaleDateString('no-NO')}
              </p>
            </div>
          </div>

          {/* Interactive Chart Canvas */}
          <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800/80 mb-4 text-xs font-semibold text-zinc-500">
              <span className="flex items-center gap-1.5"><TrendingUp size={14} className="text-emerald-400 animate-pulse" /> Progresjonsgraf kronologisk</span>
              <span>Alltid oppdatert</span>
            </div>

            {/* SVG line chart graph */}
            <div className="relative w-full overflow-x-auto select-none" id="svg-viewbox-wrapper">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-xs min-w-[500px]" id="progress-svg-canvas">
                {/* Horizontal grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, gridIdx) => {
                  const minLimit = selectedProgram === ProgramType.Fritrening ? 20 : maxPossible * 0.4;
                  const bottom = Math.min(...values, minLimit);
                  const val = bottom + ratio * (maxPossible - bottom);
                  const y = getY(val);
                  return (
                    <g key={gridIdx}>
                      <line
                        x1={paddingLeft}
                        y1={y}
                        x2={width - paddingRight}
                        y2={y}
                        stroke="#27272a"
                        strokeWidth="1"
                        strokeOpacity="0.5"
                      />
                      <text
                        x={paddingLeft - 8}
                        y={y + 3}
                        textAnchor="end"
                        className="fill-zinc-500 font-mono font-medium text-[9px]"
                      >
                        {Math.round(val)}
                      </text>
                    </g>
                  );
                })}

                {/* Vertical reference / data points grids */}
                {dataPoints.map((p, pIdx) => {
                  const x = getX(pIdx);
                  return (
                    <g key={pIdx}>
                      <line
                        x1={x}
                        y1={paddingTop}
                        x2={x}
                        y2={height - paddingBottom}
                        stroke="#27272a"
                        strokeWidth="1"
                        strokeOpacity="0.3"
                      />
                      <text
                        x={x}
                        y={height - paddingBottom + 16}
                        textAnchor="middle"
                        className="fill-zinc-500 font-mono text-[9px]"
                      >
                        {p.date.toLocaleDateString('no-NO', { day: '2-digit', month: '2-digit' })}
                      </text>
                    </g>
                  );
                })}

                {/* Perfect Max Potential target Reference Line */}
                {!selectedProgram.includes('fritrening') && (
                  <line
                    x1={paddingLeft}
                    y1={getY(maxPossible)}
                    x2={width - paddingRight}
                    y2={getY(maxPossible)}
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                    strokeOpacity="0.3"
                  />
                )}

                {/* Gradient Definition */}
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
                  </linearGradient>
                </defs>

                {/* Render connect area */}
                {areaD && (
                  <path
                    d={areaD}
                    fill="url(#chartGradient)"
                  />
                )}

                {/* Render connect line */}
                {pathD && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Render interactive coordinate dots (Single dots if only 1 item exists) */}
                {dataPoints.map((p, pIdx) => {
                  const x = getX(pIdx);
                  const y = getY(p.value);
                  const isHovered = hoveredPointIndex === pIdx;

                  return (
                    <g key={pIdx} className="cursor-pointer">
                      {/* Interactive hover padding zone */}
                      <circle
                        cx={x}
                        cy={y}
                        r="14"
                        fill="transparent"
                        onMouseEnter={() => setHoveredPointIndex(pIdx)}
                        onMouseLeave={() => setHoveredPointIndex(null)}
                      />
                      {/* Outer glow during hover */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? "8" : "5"}
                        fill="#10b981"
                        fillOpacity={isHovered ? "0.35" : "0.15"}
                        className="transition-all"
                      />
                      {/* Center structural dot */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? "4.5" : "3.5"}
                        fill="#10b981"
                        stroke="#09090b"
                        strokeWidth="1.5"
                        className="transition-all"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Micro tooltip feedback info */}
            <div className="bg-zinc-950/60 border border-zinc-800/80 p-3.5 rounded-xl flex gap-3 min-h-[75px] mt-2 relative">
              {hoveredPointIndex !== null ? (
                <div className="w-full flex justify-between items-center animate-fade-in text-xs font-semibold">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-zinc-500 block font-mono flex items-center gap-1">
                      <Calendar size={10} />
                      {dataPoints[hoveredPointIndex].date.toLocaleDateString('no-NO')} {dataPoints[hoveredPointIndex].date.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-zinc-200 text-xs block font-bold">
                      Resultat: <span className="font-mono text-emerald-400">{dataPoints[hoveredPointIndex].value} poeng</span>
                    </span>
                  </div>

                  <div className="text-right text-xs">
                    <span className="text-zinc-450 block font-normal text-[11px]">Våpen: {dataPoints[hoveredPointIndex].weapon}</span>
                    {!selectedProgram.includes('fritrening') && (
                      <span className="text-emerald-400 font-mono block text-[11px]">Innertiere: {dataPoints[hoveredPointIndex].innerTens} X</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full flex items-center gap-2.5 text-zinc-400 text-xs font-medium">
                  <Info size={15} className="text-zinc-500 shrink-0" />
                  <span>Hold musepekeren over et vilkårlig datapunkt på kurven for å se nøyaktig poengsum, valgt våpen og registreringstidspunkt.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
