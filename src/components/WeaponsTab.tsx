import React, { useState } from 'react';
import { Weapon } from '../types.ts';
import { Plus, Trash2, Edit2, ShieldAlert, Check, X, RotateCcw, Milestone, Download } from 'lucide-react';

interface WeaponsTabProps {
  weapons: Weapon[];
  onUpdateWeapons: (weapons: Weapon[]) => void;
}

export default function WeaponsTab({ weapons, onUpdateWeapons }: WeaponsTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form fields
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [boughtFrom, setBoughtFrom] = useState('');
  const [lastServiceDate, setLastServiceDate] = useState('');
  const [shotsFired, setShotsFired] = useState<number>(0);

  // Manual shots addition
  const [manualShotsValue, setManualShotsValue] = useState<Record<string, number>>({});

  const resetForm = () => {
    setBrand('');
    setModel('');
    setYear('');
    setSerialNumber('');
    setBoughtFrom('');
    setLastServiceDate('');
    setShotsFired(0);
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleExportWeaponsCSV = () => {
    const headers = [
      'Våpen ID',
      'Fabrikat (Brand)',
      'Modell (Model)',
      'Produksjonsår (Year)',
      'Serienummer (Serial Number)',
      'Kjøpt av (Bought From)',
      'Siste service dato (Last Service Date)',
      'Antall skudd avfyrt (Shots Fired)'
    ];

    const rows = weapons.map(w => [
      w.id,
      w.brand || '',
      w.model || '',
      w.year || '',
      w.serialNumber || '',
      w.boughtFrom || '',
      w.lastServiceDate || '',
      String(w.shotsFired)
    ]);

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
    link.setAttribute('download', `vapenregistre_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAddWeapon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !model) return;

    if (editingId) {
      // Editing Mode
      const updated = weapons.map(w => {
        if (w.id === editingId) {
          return {
            ...w,
            brand,
            model,
            year,
            serialNumber,
            boughtFrom,
            lastServiceDate,
            shotsFired: Number(shotsFired) || 0
          };
        }
        return w;
      });
      onUpdateWeapons(updated);
    } else {
      // Creation Mode
      const newWeapon: Weapon = {
        id: 'w_' + Date.now(),
        brand,
        model,
        year,
        serialNumber,
        boughtFrom,
        lastServiceDate,
        shotsFired: Number(shotsFired) || 0
      };
      onUpdateWeapons([...weapons, newWeapon]);
    }
    resetForm();
  };

  const handleEditClick = (w: Weapon) => {
    setEditingId(w.id);
    setBrand(w.brand);
    setModel(w.model);
    setYear(w.year);
    setSerialNumber(w.serialNumber);
    setBoughtFrom(w.boughtFrom);
    setLastServiceDate(w.lastServiceDate);
    setShotsFired(w.shotsFired);
    setShowAddForm(true);
  };

  const handleDeleteWeapon = (id: string) => {
    if (confirm('Er du sikker på at du vil slette dette våpenet fra appen? All skuddstatistikk forblir lagret i historiske resultater, men våpenet slettes fra listen.')) {
      onUpdateWeapons(weapons.filter(w => w.id !== id));
    }
  };

  const handleAddManualShots = (weaponId: string) => {
    const valueToAdd = manualShotsValue[weaponId];
    if (!valueToAdd || isNaN(valueToAdd) || valueToAdd <= 0) return;

    const updated = weapons.map(w => {
      if (w.id === weaponId) {
        return {
          ...w,
          shotsFired: w.shotsFired + valueToAdd
        };
      }
      return w;
    });
    onUpdateWeapons(updated);
    setManualShotsValue(prev => ({ ...prev, [weaponId]: 0 }));
  };

  return (
    <div className="space-y-6 animate-fade-in" id="weapons-tab-container">
      {/* Weapons header block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-zinc-900 p-5 rounded-2xl border border-zinc-800 gap-4">
        <div>
          <h2 className="text-lg font-black text-white tracking-tight">Mine Våpen</h2>
          <p className="text-xs text-zinc-400">Administrer våpen som brukes i skyteprogrammer</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {weapons.length > 0 && (
            <button
              onClick={handleExportWeaponsCSV}
              type="button"
              className="flex items-center gap-1.5 bg-zinc-805 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
              id="export-weapons-csv-btn"
              title="Eksporter alle registrerte våpen til en Excel-kompatibel CSV-fil"
            >
              <Download size={13} className="text-zinc-400" />
              Eksporter våpen (CSV)
            </button>
          )}
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black px-4 py-2.5 rounded-xl transition-all cursor-pointer"
              id="register-new-weapon-btn"
            >
              <Plus size={15} />
              Registrer nytt våpen
            </button>
          )}
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddWeapon} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4 animate-fade-in" id="weapon-form">
          <h3 className="text-base font-black text-white border-b border-zinc-800 pb-2">
            {editingId ? 'Rediger våpen' : 'Registrer nytt våpen'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Fabrikat *</label>
              <input
                type="text"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="f.eks Pardini, Sig Sauer"
                className="w-full text-sm bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-hidden"
                required
                id="brand-input"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Modell *</label>
              <input
                type="text"
                value={model}
                onChange={e => setModel(e.target.value)}
                placeholder="f.eks SP Rapid Fire, Glock 17"
                className="w-full text-sm bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-hidden"
                required
                id="model-input"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Produksjonsår</label>
              <input
                type="text"
                value={year}
                onChange={e => setYear(e.target.value)}
                placeholder="f.eks 2021"
                className="w-full text-sm bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-hidden"
                id="year-input"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Serienummer</label>
              <input
                type="text"
                value={serialNumber}
                onChange={e => setSerialNumber(e.target.value)}
                placeholder="Heksadesimal eller tallkode"
                className="w-full text-sm bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-hidden"
                id="serial-input"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Kjøpt av</label>
              <input
                type="text"
                value={boughtFrom}
                onChange={e => setBoughtFrom(e.target.value)}
                placeholder="Butikk eller privatperson"
                className="w-full text-sm bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-hidden"
                id="boughtfrom-input"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Siste service dato</label>
              <input
                type="date"
                value={lastServiceDate}
                onChange={e => setLastServiceDate(e.target.value)}
                className="w-full text-sm bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-hidden [color-scheme:dark]"
                id="service-input"
              />
            </div>
            <div className="space-y-1 col-span-1 md:col-span-2 lg:col-span-3">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Antall skudd avfyrt hittil {editingId && '(du kan justere den totale summen her)'}
              </label>
              <input
                type="number"
                value={shotsFired}
                onChange={e => setShotsFired(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-48 text-sm bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 focus:border-emerald-500 focus:outline-hidden font-mono"
                min="0"
                id="shotsfired-input"
              />
              <p className="text-xs text-zinc-500 mt-1">Skudd brukt i skyteprogrammer blir også lagt til denne verdien automatisk.</p>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="text-xs px-4 py-2.5 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 rounded-xl text-zinc-300 transition-colors cursor-pointer font-bold"
              id="cancel-weapon-form-btn"
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="text-xs px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl font-black transition-colors cursor-pointer"
              id="save-weapon-btn"
            >
              {editingId ? 'Lagre endringer' : 'Registrer våpen'}
            </button>
          </div>
        </form>
      )}

      {weapons.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900 rounded-2xl border border-dashed border-zinc-800" id="no-weapons-notice">
          <ShieldAlert className="mx-auto text-zinc-500 mb-3" size={40} />
          <h4 className="text-base font-bold text-zinc-200">Ingen våpen registrert ennå</h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 mb-6">
            Du må registrere minst ett våpen for å kunne gjennomføre et registrert skyteprogram og holde tellingen på skuddavfyringer.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            id="register-weapon-alt-btn"
          >
            <Plus size={16} />
            Registrer ditt første våpen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6" id="weapons-list-grid">
          {weapons.map(w => (
            <div
              key={w.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all duration-150 flex flex-col justify-between"
              id={`weapon-card-${w.id}`}
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="inline-block text-[9px] font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md mb-2">
                      Pistol
                    </span>
                    <h3 className="text-base font-black text-white leading-tight">
                      {w.brand} <span className="font-medium text-zinc-400">{w.model}</span>
                    </h3>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleEditClick(w)}
                      className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                      title="Rediger våpendetaljer"
                      id={`edit-weapon-${w.id}`}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteWeapon(w.id)}
                      className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Slett våpen"
                      id={`delete-weapon-${w.id}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-4 text-xs border-t border-zinc-800/80 pt-3.5">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Serienummer</span>
                    <span className="text-zinc-200 font-semibold font-mono text-xs">{w.serialNumber || 'Ikke oppgitt'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Produksjonsår</span>
                    <span className="text-zinc-200 font-semibold">{w.year || 'Ikke oppgitt'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Kjøpt av</span>
                    <span className="text-zinc-200 font-semibold truncate block">{w.boughtFrom || 'Ikke oppgitt'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Siste service</span>
                    <span className="text-zinc-200 font-semibold">
                      {w.lastServiceDate ? new Date(w.lastServiceDate).toLocaleDateString('no-NO') : 'Ikke registrert'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total shots drawer with manual addition option */}
              <div className="bg-zinc-950/50 border-t border-zinc-800/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-900 border border-zinc-800 text-emerald-400 rounded-xl">
                    <Milestone size={16} />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Akkumulerte Skudd</span>
                    <span className="text-white font-mono text-base font-black">
                      {w.shotsFired.toLocaleString('no-NO')} <span className="text-[10px] font-normal text-zinc-400 uppercase tracking-tight">skudd</span>
                    </span>
                  </div>
                </div>

                <div className="flex gap-1.5 mt-2 sm:mt-0">
                  <input
                    type="number"
                    value={manualShotsValue[w.id] || ''}
                    placeholder="+ Skudd"
                    onChange={e => {
                      const val = Math.max(0, parseInt(e.target.value) || 0);
                      setManualShotsValue(prev => ({ ...prev, [w.id]: val }));
                    }}
                    className="w-24 text-xs bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 focus:border-emerald-500 focus:outline-hidden text-zinc-100 font-mono"
                    id={`manual-shots-input-${w.id}`}
                  />
                  <button
                    onClick={() => handleAddManualShots(w.id)}
                    className="bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                    id={`add-manual-shots-btn-${w.id}`}
                  >
                    Legg til
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
