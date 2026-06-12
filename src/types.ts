export enum ProgramType {
  NAIS = 'nais',
  Hurtig = 'hurtig',
  Standardpistol = 'standard',
  T96 = 't96',
  Fritrening = 'fritrening',
}

export type ShotValue = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'X';

export interface Weapon {
  id: string;
  brand: string;         // Fabrikat
  model: string;         // Modell
  year: string;          // År
  serialNumber: string;  // Serienummer
  boughtFrom: string;    // Kjøpt av
  lastServiceDate: string; // Siste service dato
  shotsFired: number;    // Antall skudd avfyrt
}

export interface SeriesConfig {
  id: number;
  name: string; // e.g. "1. serie", "Prøveserie"
  timeLimit: number; // in seconds, e.g. 150, 20, 10, 8, 6, 3 (0 means no limit)
  shotsCount: number; // always 5 in defined formats
  isPractice: boolean;
  distance?: string; // e.g. "11 meter"
  stance?: string; // e.g. "stående fri", "stående 1 hånd"
}

export interface SeriesResult {
  config: SeriesConfig;
  shots: ShotValue[]; // up to 5 shots
  score: number; // computed, X = 10
  innerTens: number; // number of 'X'
}

export interface ProgramSession {
  id: string;
  programType: ProgramType;
  weaponId: string;
  date: string;
  series: SeriesResult[];
  status: 'active' | 'completed';
  currentSeriesIndex: number;
}

export interface SavedResult {
  id: string;
  date: string; // ISO string
  programType: ProgramType;
  weaponId: string;
  weaponLabel: string; // e.g. "Glock 17 - S/N 12345"
  seriesCount: number;
  series: {
    name: string;
    timeLimit: number;
    distance?: string;
    stance?: string;
    shots: ShotValue[];
    score: number;
    innerTens: number;
    isPractice: boolean;
  }[];
  totalScore: number; // accumulated sum (excl. practice series)
  innerTensCount: number; // total X's (excl. practice series)
}
