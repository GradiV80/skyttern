import { ProgramType, SeriesConfig } from './types.ts';

export interface ProgramTemplate {
  type: ProgramType;
  name: string;
  description: string;
  series: SeriesConfig[];
}

export const PROGRAM_TEMPLATES: Record<ProgramType, ProgramTemplate> = {
  [ProgramType.NAIS]: {
    type: ProgramType.NAIS,
    name: 'NAIS',
    description: 'NROF og NSF skyteprogram med varierte skytetider.',
    series: [
      { id: 1, name: 'Prøveserie', timeLimit: 150, shotsCount: 5, isPractice: true },
      { id: 2, name: '1. serie', timeLimit: 150, shotsCount: 5, isPractice: false },
      { id: 3, name: '2. serie', timeLimit: 150, shotsCount: 5, isPractice: false },
      { id: 4, name: '3. serie (Duell)', timeLimit: 3, shotsCount: 5, isPractice: false },
      { id: 5, name: '4. serie (Duell)', timeLimit: 3, shotsCount: 5, isPractice: false },
      { id: 6, name: '5. serie', timeLimit: 20, shotsCount: 5, isPractice: false },
      { id: 7, name: '6. serie', timeLimit: 10, shotsCount: 5, isPractice: false }
    ]
  },
  [ProgramType.Hurtig]: {
    type: ProgramType.Hurtig,
    name: 'Hurtigpistol',
    description: 'Hurtigskyting med serier på 10, 8 og 6 sekunder.',
    series: [
      { id: 1, name: 'Prøveserie', timeLimit: 10, shotsCount: 5, isPractice: true },
      { id: 2, name: '1. serie', timeLimit: 10, shotsCount: 5, isPractice: false },
      { id: 3, name: '2. serie', timeLimit: 10, shotsCount: 5, isPractice: false },
      { id: 4, name: '3. serie', timeLimit: 10, shotsCount: 5, isPractice: false },
      { id: 5, name: '4. serie', timeLimit: 10, shotsCount: 5, isPractice: false },
      { id: 6, name: '5. serie', timeLimit: 8, shotsCount: 5, isPractice: false },
      { id: 7, name: '6. serie', timeLimit: 8, shotsCount: 5, isPractice: false },
      { id: 8, name: '7. serie', timeLimit: 8, shotsCount: 5, isPractice: false },
      { id: 9, name: '8. serie', timeLimit: 8, shotsCount: 5, isPractice: false },
      { id: 10, name: '9. serie', timeLimit: 6, shotsCount: 5, isPractice: false },
      { id: 11, name: '10. serie', timeLimit: 6, shotsCount: 5, isPractice: false },
      { id: 12, name: '11. serie', timeLimit: 6, shotsCount: 5, isPractice: false },
      { id: 13, name: '12. serie', timeLimit: 6, shotsCount: 5, isPractice: false }
    ]
  },
  [ProgramType.Standardpistol]: {
    type: ProgramType.Standardpistol,
    name: 'Standardpistol',
    description: 'Klassisk pistolprogram med 5-skudds serier på henholdsvis 150, 20 og 10 sekunder.',
    series: [
      { id: 1, name: 'Prøveserie', timeLimit: 150, shotsCount: 5, isPractice: true },
      { id: 2, name: '1. serie', timeLimit: 150, shotsCount: 5, isPractice: false },
      { id: 3, name: '2. serie', timeLimit: 150, shotsCount: 5, isPractice: false },
      { id: 4, name: '3. serie', timeLimit: 150, shotsCount: 5, isPractice: false },
      { id: 5, name: '4. serie', timeLimit: 150, shotsCount: 5, isPractice: false },
      { id: 6, name: '5. serie', timeLimit: 20, shotsCount: 5, isPractice: false },
      { id: 7, name: '6. serie', timeLimit: 20, shotsCount: 5, isPractice: false },
      { id: 8, name: '7. serie', timeLimit: 20, shotsCount: 5, isPractice: false },
      { id: 9, name: '8. serie', timeLimit: 20, shotsCount: 5, isPractice: false },
      { id: 10, name: '9. serie', timeLimit: 10, shotsCount: 5, isPractice: false },
      { id: 11, name: '10. serie', timeLimit: 10, shotsCount: 5, isPractice: false },
      { id: 12, name: '11. serie', timeLimit: 10, shotsCount: 5, isPractice: false },
      { id: 13, name: '12. serie', timeLimit: 10, shotsCount: 5, isPractice: false }
    ]
  },
  [ProgramType.T96]: {
    type: ProgramType.T96,
    name: 'T96 Felt',
    description: 'Nasjonalt feltprogram skutt på avstandene 11m, 15m og 25m.',
    series: [
      // 11 meter
      { id: 1, name: '1. serie', timeLimit: 150, shotsCount: 5, isPractice: false, distance: '11 meter', stance: 'stående fri' },
      { id: 2, name: '2. serie', timeLimit: 150, shotsCount: 5, isPractice: false, distance: '11 meter', stance: 'stående 1 hånd' },
      { id: 3, name: '3. serie', timeLimit: 20, shotsCount: 5, isPractice: false, distance: '11 meter', stance: 'stående fri' },
      { id: 4, name: '4. serie', timeLimit: 20, shotsCount: 5, isPractice: false, distance: '11 meter', stance: 'stående 1 hånd' },
      { id: 5, name: '5. serie', timeLimit: 10, shotsCount: 5, isPractice: false, distance: '11 meter', stance: 'stående fri' },
      { id: 6, name: '6. serie', timeLimit: 10, shotsCount: 5, isPractice: false, distance: '11 meter', stance: 'stående 1 hånd' },
      // 15 meter
      { id: 7, name: '7. serie', timeLimit: 150, shotsCount: 5, isPractice: false, distance: '15 meter', stance: 'stående fri' },
      { id: 8, name: '8. serie', timeLimit: 150, shotsCount: 5, isPractice: false, distance: '15 meter', stance: 'stående 1 hånd' },
      { id: 9, name: '9. serie', timeLimit: 20, shotsCount: 5, isPractice: false, distance: '15 meter', stance: 'stående fri' },
      { id: 10, name: '10. serie', timeLimit: 20, shotsCount: 5, isPractice: false, distance: '15 meter', stance: 'stående 1 hånd' },
      { id: 11, name: '11. serie', timeLimit: 10, shotsCount: 5, isPractice: false, distance: '15 meter', stance: 'stående fri' },
      { id: 12, name: '12. serie', timeLimit: 10, shotsCount: 5, isPractice: false, distance: '15 meter', stance: 'stående 1 hånd' },
      // 25 meter
      { id: 13, name: '13. serie', timeLimit: 150, shotsCount: 5, isPractice: false, distance: '25 meter', stance: 'stående fri' },
      { id: 14, name: '14. serie', timeLimit: 150, shotsCount: 5, isPractice: false, distance: '25 meter', stance: 'stående fri' },
      { id: 15, name: '15. serie', timeLimit: 20, shotsCount: 5, isPractice: false, distance: '25 meter', stance: 'stående fri' },
      { id: 16, name: '16. serie', timeLimit: 20, shotsCount: 5, isPractice: false, distance: '25 meter', stance: 'stående fri' }
    ]
  },
  [ProgramType.Fritrening]: {
    type: ProgramType.Fritrening,
    name: 'Fritrening',
    description: 'Skyting med fritt antall 5-skuddsserier. Ingen automatisk akkumulering.',
    series: [] // Dynamically generated in the interface
  }
};
