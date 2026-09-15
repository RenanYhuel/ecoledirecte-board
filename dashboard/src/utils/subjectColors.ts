export interface SubjectTheme {
  code: string;
  name: string;
  shortName: string;
  bg: string;
  border: string;
  text: string;
  badge: string;
  accent: string;
  bgHex: string;
  borderHex: string;
  textHex: string;
  badgeBgHex: string;
}

export const cleanRoomName = (room?: string | null): string => {
  if (!room) return '';
  const trimmed = room.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return '';

  const cleaned = trimmed.replace(/<[^>]+>/g, '').trim();
  if (cleaned.length === 0) {
    const match = trimmed.match(/<([^>]+)>/);
    if (match && match[1]) {
      const inside = match[1].replace(/LIMITATION.*|Tales.*/gi, '').trim();
      const lower = inside.toLowerCase();
      if (lower.includes('cours') || lower.includes('sans') || lower.includes('libre') || lower.includes('perma')) {
        return '';
      }
      return inside;
    }
    return '';
  }

  const lower = cleaned.toLowerCase();
  if (lower.includes('cours') || lower.includes('sans') || lower.includes('libre') || lower.includes('perma')) {
    return '';
  }

  return cleaned;
};

export const getSubjectTheme = (subjectName = '', subjectCode = ''): SubjectTheme => {
  const code = (subjectCode || '').toUpperCase().trim();
  const name = (subjectName || '').toUpperCase().trim();

  if (
    code === 'LIBRE' ||
    name.includes('PAS DE COURS') ||
    name.includes('SANS COURS') ||
    name.includes('PERMANENCE') ||
    name.includes('REPAS')
  ) {
    return {
      code: 'LIBRE',
      name: 'Pas de cours',
      shortName: 'Pas de cours',
      bg: 'bg-slate-100',
      border: 'border-dashed border-slate-300',
      text: 'text-slate-600',
      badge: 'bg-slate-200 text-slate-700',
      accent: '#64748b',
      bgHex: '#f1f5f9',
      borderHex: '#cbd5e1',
      textHex: '#475569',
      badgeBgHex: '#e2e8f0',
    };
  }

  if (code === 'MATHS' || name.includes('MATHEMATIQUE')) {
    return {
      code: 'MATHS',
      name: 'Mathématiques',
      shortName: 'Maths',
      bg: 'bg-blue-100',
      border: 'border-blue-300',
      text: 'text-blue-950',
      badge: 'bg-blue-600 text-white',
      accent: '#2563eb',
      bgHex: '#dbeafe',
      borderHex: '#93c5fd',
      textHex: '#172554',
      badgeBgHex: '#2563eb',
    };
  }

  if (code === 'MATEX' || name.includes('EXPERT')) {
    return {
      code: 'MATEX',
      name: 'Maths Expertes',
      shortName: 'Maths Exp.',
      bg: 'bg-indigo-100',
      border: 'border-indigo-300',
      text: 'text-indigo-950',
      badge: 'bg-indigo-600 text-white',
      accent: '#4f46e5',
      bgHex: '#e0e7ff',
      borderHex: '#a5b4fc',
      textHex: '#1e1b4b',
      badgeBgHex: '#4f46e5',
    };
  }

  if (code === 'PH-CH' || name.includes('PHYSIQUE') || name.includes('CHIMIE')) {
    return {
      code: 'PH-CH',
      name: 'Physique-Chimie',
      shortName: 'Physique',
      bg: 'bg-purple-100',
      border: 'border-purple-300',
      text: 'text-purple-950',
      badge: 'bg-purple-600 text-white',
      accent: '#9333ea',
      bgHex: '#f3e8ff',
      borderHex: '#d8b4fe',
      textHex: '#3b0764',
      badgeBgHex: '#9333ea',
    };
  }

  if (code === 'PHILO' || name.includes('PHILO')) {
    return {
      code: 'PHILO',
      name: 'Philosophie',
      shortName: 'Philo',
      bg: 'bg-red-100',
      border: 'border-red-300',
      text: 'text-red-950',
      badge: 'bg-red-700 text-white',
      accent: '#b91c1c',
      bgHex: '#fee2e2',
      borderHex: '#fca5a5',
      textHex: '#450a0a',
      badgeBgHex: '#b91c1c',
    };
  }

  if (code === 'HI-GE' || name.includes('HISTOIRE') || name.includes('GEOGRAPHIE') || name.includes('HGGSP')) {
    return {
      code: 'HI-GE',
      name: 'Histoire-Géographie',
      shortName: 'Histoire-Géo',
      bg: 'bg-emerald-100',
      border: 'border-emerald-300',
      text: 'text-emerald-950',
      badge: 'bg-emerald-600 text-white',
      accent: '#059669',
      bgHex: '#d1fae5',
      borderHex: '#6ee7b7',
      textHex: '#022c22',
      badgeBgHex: '#059669',
    };
  }

  if (code === 'AGL1' || name.includes('ANGLAIS')) {
    return {
      code: 'AGL1',
      name: 'Anglais LV1',
      shortName: 'Anglais',
      bg: 'bg-rose-100',
      border: 'border-rose-300',
      text: 'text-rose-950',
      badge: 'bg-rose-600 text-white',
      accent: '#e11d48',
      bgHex: '#ffe4e6',
      borderHex: '#fda4af',
      textHex: '#4c0519',
      badgeBgHex: '#e11d48',
    };
  }

  if (code === 'ESP2' || name.includes('ESPAGNOL')) {
    return {
      code: 'ESP2',
      name: 'Espagnol LV2',
      shortName: 'Espagnol',
      bg: 'bg-yellow-100',
      border: 'border-yellow-300',
      text: 'text-yellow-950',
      badge: 'bg-yellow-600 text-white',
      accent: '#ca8a04',
      bgHex: '#fef9c3',
      borderHex: '#fde047',
      textHex: '#422006',
      badgeBgHex: '#ca8a04',
    };
  }

  if (code === 'EPS' || name.includes('SPORT') || name.includes('PHYSIQUE & SPORT')) {
    return {
      code: 'EPS',
      name: 'EPS',
      shortName: 'EPS',
      bg: 'bg-teal-100',
      border: 'border-teal-300',
      text: 'text-teal-950',
      badge: 'bg-teal-600 text-white',
      accent: '#0d9488',
      bgHex: '#ccfbf1',
      borderHex: '#5eead4',
      textHex: '#042f2e',
      badgeBgHex: '#0d9488',
    };
  }

  if (code === 'G-SCI' || name.includes('SCIENTIFIQUE')) {
    return {
      code: 'G-SCI',
      name: 'Ens. Scientifique',
      shortName: 'Ens. Scientifique',
      bg: 'bg-cyan-100',
      border: 'border-cyan-300',
      text: 'text-cyan-950',
      badge: 'bg-cyan-600 text-white',
      accent: '#0891b2',
      bgHex: '#cffafe',
      borderHex: '#67e8f9',
      textHex: '#083344',
      badgeBgHex: '#0891b2',
    };
  }

  if (code === 'EMC' || name.includes('CIVIQUE')) {
    return {
      code: 'EMC',
      name: 'EMC',
      shortName: 'EMC',
      bg: 'bg-slate-200',
      border: 'border-slate-400',
      text: 'text-slate-900',
      badge: 'bg-slate-700 text-white',
      accent: '#334155',
      bgHex: '#e2e8f0',
      borderHex: '#94a3b8',
      textHex: '#0f172a',
      badgeBgHex: '#334155',
    };
  }

  if (code === 'CAPCO' || name.includes('ORIEN')) {
    return {
      code: 'CAPCO',
      name: 'Orientation & AP',
      shortName: 'Orientation',
      bg: 'bg-sky-100',
      border: 'border-sky-300',
      text: 'text-sky-950',
      badge: 'bg-sky-600 text-white',
      accent: '#0284c7',
      bgHex: '#e0f2fe',
      borderHex: '#7dd3fc',
      textHex: '#082f49',
      badgeBgHex: '#0284c7',
    };
  }

  return {
    code: code || 'GEN',
    name: subjectName || 'Cours',
    shortName: subjectName || 'Cours',
    bg: 'bg-slate-100',
    border: 'border-slate-300',
    text: 'text-slate-900',
    badge: 'bg-slate-700 text-white',
    accent: '#475569',
    bgHex: '#f1f5f9',
    borderHex: '#cbd5e1',
    textHex: '#0f172a',
    badgeBgHex: '#475569',
  };
};
