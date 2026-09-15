import React, { useRef } from 'react';
import type { Grade, Period } from '../types/dashboard';
import { getSubjectTheme } from '../utils/subjectColors';
import { useAutoPingPongScroll } from '../hooks/useAutoPingPongScroll';

interface GradesCardProps {
  periods?: Period[];
  recentGrades?: Grade[];
  generalAverage?: number | null;
  classAverage?: number | null;
}

const formatNumber = (num?: number | null, decimals = 2): string => {
  if (num === null || num === undefined || typeof num !== 'number' || isNaN(num)) {
    return '-';
  }
  return num.toFixed(decimals).replace('.', ',');
};

export const GradesCard: React.FC<GradesCardProps> = ({
  periods = [],
  recentGrades = [],
  generalAverage,
  classAverage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentPeriod = periods[periods.length - 1];
  const displayGenAvg = currentPeriod?.student_avg ?? generalAverage;
  const displayClassAvg = currentPeriod?.class_avg ?? classAverage;

  useAutoPingPongScroll(containerRef, [recentGrades], { speed: 0.4, pauseDurationMs: 2500 });

  return (
    <div className="bg-white border-2 border-emerald-200 rounded-2xl p-4 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between pb-2 flex-none gap-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex-none">
          Notes & Évaluations
        </h2>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-black text-xs flex-none">
            <span className="text-[10px] opacity-90 font-medium">Moy. Gen:</span>
            <span className="font-number font-black text-xs">
              {formatNumber(displayGenAvg, 2)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 font-extrabold text-xs flex-none">
            <span className="text-[10px] text-emerald-700 font-medium">Classe:</span>
            <span className="font-number font-extrabold text-xs">
              {formatNumber(displayClassAvg, 2)}
            </span>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto space-y-2 pt-3 pr-1 no-scrollbar">
        {recentGrades.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <div className="text-sm font-extrabold text-slate-900">Aucune note enregistrée</div>
            <p className="text-xs text-slate-500 font-medium max-w-[200px] mt-1">
              Les évaluations apparaîtront dès publication.
            </p>
          </div>
        ) : (
          recentGrades.map((grade) => {
            const val = typeof grade.value === 'number' && !isNaN(grade.value) ? grade.value : null;
            const avg = typeof grade.class_avg === 'number' && !isNaN(grade.class_avg) ? grade.class_avg : null;
            const theme = getSubjectTheme(grade.subject_name, grade.subject_code);

            return (
              <div
                key={grade.id || `${grade.date}-${grade.title}`}
                style={{
                  backgroundColor: theme.bgHex,
                  borderColor: theme.borderHex,
                }}
                className={`p-3 rounded-xl border-2 text-xs transition-all ${theme.bg} ${theme.border} ${theme.text}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      style={{
                        backgroundColor: theme.badgeBgHex,
                        color: '#ffffff',
                      }}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold flex-none ${theme.badge}`}
                    >
                      {theme.shortName}
                    </span>
                    <span className="font-extrabold text-slate-900 truncate text-[11px]">
                      {grade.title || theme.name}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1 font-number bg-white border border-slate-300 px-2 py-0.5 rounded-md flex-none">
                    <span className="font-black text-sm text-slate-950">
                      {formatNumber(val, 2)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      /{grade.out_of_str || '20'}
                    </span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-300/60 flex items-center justify-between text-[10px] text-slate-600 font-number font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-white border border-slate-300 text-slate-900 px-1.5 py-0.2 rounded font-bold text-[10px]">
                      Coef {grade.coef ?? 1}
                    </span>
                    <span className="text-slate-600 font-medium">
                      {grade.date}
                    </span>
                  </div>

                  {avg !== null && (
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 font-normal">Moy. classe:</span>
                      <span className="bg-white border border-slate-300 text-slate-900 font-bold px-1.5 py-0.2 rounded text-[10px]">
                        {formatNumber(avg, 2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

