import React, { useEffect, useRef, useState } from 'react';
import type { CourseSlot } from '../types/dashboard';
import { getSubjectTheme, cleanRoomName } from '../utils/subjectColors';
import { useAutoPingPongScroll } from '../hooks/useAutoPingPongScroll';

interface TimetableStripProps {
  slots?: CourseSlot[];
  tomorrowSlots?: CourseSlot[];
  nextSlot?: CourseSlot;
}

export const TimetableStrip: React.FC<TimetableStripProps> = ({
  slots = [],
  tomorrowSlots = [],
  nextSlot,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedDay, setSelectedDay] = useState<'today' | 'tomorrow'>('today');
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const currentSlots = selectedDay === 'today' ? slots : tomorrowSlots;
  const validSlots = currentSlots.filter((s) =>
    Boolean(s.start_date && (s.subject_name || s.title || s.subject_code || s.course_type))
  );

  const realCourseCount = validSlots.filter((s) => {
    const title = (s.title || s.subject_name || '').toLowerCase();
    return s.course_type !== 'PERMANENCE' && !title.includes('pas de cours') && !title.includes('sans cours');
  }).length;

  useAutoPingPongScroll(containerRef, [validSlots, selectedDay], { speed: 0.45, pauseDurationMs: 2500 });

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split(' ');
    if (parts.length > 1) {
      return parts[1].substring(0, 5);
    }
    return dateStr;
  };

  const getSlotProgress = (startDate: string, endDate: string) => {
    if (selectedDay !== 'today') {
      return { isOngoing: false, percent: 0, remainingMin: 0 };
    }
    try {
      const sParts = startDate.split(' ');
      const eParts = endDate.split(' ');
      if (sParts.length > 1 && eParts.length > 1) {
        const [sYear, sMonth, sDay] = sParts[0].split('-').map(Number);
        const [sHour, sMin] = sParts[1].split(':').map(Number);
        const [eYear, eMonth, eDay] = eParts[0].split('-').map(Number);
        const [eHour, eMin] = eParts[1].split(':').map(Number);

        const start = new Date(sYear, sMonth - 1, sDay, sHour, sMin).getTime();
        const end = new Date(eYear, eMonth - 1, eDay, eHour, eMin).getTime();
        const current = now.getTime();

        if (current >= start && current <= end) {
          const total = end - start;
          const elapsed = current - start;
          const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));
          const remainingMin = Math.round((end - current) / (1000 * 60));
          return { isOngoing: true, percent: pct, remainingMin };
        }
      }
    } catch {
    }
    return { isOngoing: false, percent: 0, remainingMin: 0 };
  };

  const isFreeDay = validSlots.length === 0;

  return (
    <div className="bg-white border-2 border-indigo-200 rounded-2xl p-4 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between pb-2 flex-none gap-2">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-950 flex-none">
            Emploi du Temps
          </h2>

          <div className="flex items-center bg-indigo-50/90 p-0.5 rounded-lg border border-indigo-200 text-[11px]">
            <button
              type="button"
              onClick={() => setSelectedDay('today')}
              className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer select-none active:scale-95 ${
                selectedDay === 'today'
                  ? 'bg-indigo-600 text-white shadow-none'
                  : 'text-indigo-900 hover:text-indigo-950 hover:bg-indigo-100/70'
              }`}
            >
              Aujourd'hui
            </button>
            <button
              type="button"
              onClick={() => setSelectedDay('tomorrow')}
              className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer select-none active:scale-95 ${
                selectedDay === 'tomorrow'
                  ? 'bg-indigo-600 text-white shadow-none'
                  : 'text-indigo-900 hover:text-indigo-950 hover:bg-indigo-100/70'
              }`}
            >
              Demain
            </button>
          </div>
        </div>

        <span
          className={`font-number text-xs font-bold px-2.5 py-0.5 rounded-full flex-none ${
            isFreeDay
              ? 'bg-indigo-50 text-indigo-900 border border-indigo-200'
              : 'text-indigo-800 bg-indigo-50 border border-indigo-200'
          }`}
        >
          {isFreeDay ? 'Journée Libre' : `${realCourseCount} cours`}
        </span>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto pt-3 space-y-2 no-scrollbar">
        {isFreeDay ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <div className="text-sm font-extrabold text-slate-900">
              {selectedDay === 'today' ? "Pas de cours aujourd'hui" : 'Pas de cours demain'}
            </div>
            <p className="text-xs text-slate-500 font-medium max-w-[200px] mt-1">
              {selectedDay === 'today'
                ? 'Journée libre sans cours programmés.'
                : 'Journée de demain libre sans cours programmés.'}
            </p>
          </div>
        ) : (
          validSlots.map((slot) => {
            const isNext = selectedDay === 'today' && nextSlot?.id === slot.id && slot.id !== 0;
            const startTime = formatTime(slot.start_date);
            const endTime = formatTime(slot.end_date);
            const theme = getSubjectTheme(slot.subject_name, slot.subject_code);
            const teacher = (slot.teacher || '').trim();
            const room = cleanRoomName(slot.room);
            const progress = getSlotProgress(slot.start_date, slot.end_date);

            const isPermanenceOrFree =
              slot.course_type === 'PERMANENCE' ||
              (slot.title && slot.title.toLowerCase().includes('sans cours')) ||
              (slot.subject_name && slot.subject_name.toLowerCase().includes('sans cours'));

            if (isPermanenceOrFree) {
              return (
                <div
                  key={slot.id || `${slot.start_date}-${slot.subject_code}`}
                  className="px-3 py-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/90 text-slate-600 flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span
                      style={{ backgroundColor: '#e2e8f0', color: '#475569' }}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-600 uppercase tracking-wider"
                    >
                      Pas de cours
                    </span>
                  </div>
                  <div className="font-number text-xs font-bold text-slate-500">
                    {startTime} - {endTime}
                  </div>
                </div>
              );
            }

            const hasMetaDetails =
              Boolean(room && !slot.is_cancelled) ||
              Boolean(teacher) ||
              Boolean(slot.has_homework && !slot.is_cancelled);

            return (
              <div
                key={slot.id || `${slot.start_date}-${slot.subject_code}`}
                style={{
                  backgroundColor: slot.is_cancelled ? '#fff1f2' : theme.bgHex,
                  borderColor: slot.is_cancelled ? '#fda4af' : progress.isOngoing ? '#2563eb' : isNext ? '#9333ea' : theme.borderHex,
                }}
                className={`p-3 rounded-xl border-2 text-xs transition-all ${
                  slot.is_cancelled
                    ? 'bg-rose-50 border-rose-300 text-rose-950'
                    : progress.isOngoing
                    ? `${theme.bg} border-blue-600 ring-2 ring-blue-500/30`
                    : isNext
                    ? `${theme.bg} border-purple-500 ring-2 ring-purple-500/25`
                    : `${theme.bg} ${theme.border} ${theme.text}`
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      style={{
                        backgroundColor: slot.is_cancelled ? '#e11d48' : theme.badgeBgHex,
                        color: '#ffffff',
                      }}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold flex-none ${
                        slot.is_cancelled ? 'bg-rose-600 text-white' : theme.badge
                      }`}
                    >
                      {theme.shortName}
                    </span>

                    {slot.is_cancelled ? (
                      <span className="px-1.5 py-0.2 rounded bg-rose-700 text-white text-[10px] font-extrabold uppercase tracking-wider">
                        ANNULÉ
                      </span>
                    ) : progress.isOngoing ? (
                      <span className="px-1.5 py-0.2 rounded bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wider animate-pulse">
                        EN COURS ({progress.remainingMin}m)
                      </span>
                    ) : isNext ? (
                      <span className="px-1.5 py-0.2 rounded bg-purple-700 text-white text-[10px] font-bold uppercase tracking-wider">
                        PROCHAIN
                      </span>
                    ) : null}
                  </div>

                  <div className="font-number text-xs font-extrabold text-slate-900 flex-none">
                    {startTime} - {endTime}
                  </div>
                </div>

                {progress.isOngoing && !slot.is_cancelled && (
                  <div className="w-full bg-blue-200/80 rounded-full h-1.5 mt-2.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                )}

                {hasMetaDetails && (
                  <div className="flex items-center gap-2 mt-2 text-[11px] font-medium text-slate-700">
                    {room && !slot.is_cancelled && (
                      <span className="bg-white border border-slate-300 text-slate-900 px-2 py-0.5 rounded-md font-bold text-[10px]">
                        Salle {room}
                      </span>
                    )}

                    {teacher && (
                      <span className="truncate">
                        {teacher}
                      </span>
                    )}

                    {slot.has_homework && !slot.is_cancelled && (
                      <span className="ml-auto flex-none bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded text-[10px] font-bold">
                        Devoirs
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
