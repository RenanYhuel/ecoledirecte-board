import React, { useRef } from 'react';
import type { DayHomework } from '../types/dashboard';
import { getSubjectTheme } from '../utils/subjectColors';
import { useAutoPingPongScroll } from '../hooks/useAutoPingPongScroll';

interface HomeworkCardProps {
  days?: DayHomework[];
  onToggleHomework?: (homeworkId: number, isDone: boolean) => void;
}

export const HomeworkCard: React.FC<HomeworkCardProps> = ({ days = [], onToggleHomework }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const formatFrenchDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const itemDate = new Date(d);
        itemDate.setHours(0, 0, 0, 0);

        const diffTime = itemDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Aujourd'hui";
        if (diffDays === 1) return 'Demain';
        if (diffDays === 2) return 'Après-demain';

        return new Intl.DateTimeFormat('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
        }).format(d);
      }
    } catch {
    }
    return dateStr;
  };

  const cleanHtml = (html?: string) => {
    if (!html) return '';
    return html
      .replace(/<br\s*[\/]?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .trim();
  };

  const allItems = days.flatMap((d) => d.items);
  const pendingCount = allItems.filter((i) => !i.is_done).length;

  useAutoPingPongScroll(containerRef, [days], { speed: 0.4, pauseDurationMs: 2500 });

  return (
    <div className="bg-white border-2 border-amber-200 rounded-2xl p-4 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between pb-2 flex-none">
        <h2 className="text-xs font-bold uppercase tracking-wider text-amber-950">
          Cahier de Textes & Devoirs
        </h2>

        <span className="font-number text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
          {pendingCount} à faire
        </span>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto pt-3 space-y-3.5 pr-1 no-scrollbar">
        {days.length === 0 || allItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <div className="text-sm font-extrabold text-slate-900">Aucun devoir à faire</div>
            <p className="text-xs text-slate-500 font-medium max-w-[200px] mt-1">
              Tout est à jour pour les prochains jours.
            </p>
          </div>
        ) : (
          days.map((dayGroup) => {
            if (dayGroup.items.length === 0) return null;

            return (
              <div key={dayGroup.date} className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 border-b border-amber-100/70 pb-1">
                  <span className="capitalize text-amber-950 font-black text-[11px] tracking-wide">
                    Pour {formatFrenchDate(dayGroup.date)}
                  </span>
                  <span className="font-number text-[11px] text-slate-400 font-medium">
                    {dayGroup.date}
                  </span>
                </div>

                <div className="space-y-2">
                  {dayGroup.items.map((item) => {
                    const text = cleanHtml(item.description_html);
                    const theme = getSubjectTheme(item.subject_name, item.subject_code);
                    const isDone = item.is_done;

                    if (isDone) {
                      return (
                        <div
                          key={item.id || `${item.due_date}-${item.subject_name}`}
                          style={{ backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' }}
                          className="p-3 rounded-xl border-2 border-slate-300 bg-slate-100 text-xs transition-all opacity-70"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                style={{ backgroundColor: '#94a3b8', color: '#ffffff' }}
                                className="px-2 py-0.5 rounded-md text-[11px] font-bold flex-none bg-slate-400 text-white"
                              >
                                {theme.shortName}
                              </span>

                              {item.interrogation && (
                                <span className="px-1.5 py-0.2 rounded bg-slate-400 text-white text-[10px] font-extrabold uppercase tracking-wider">
                                  ÉVAL
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                style={{ backgroundColor: '#e2e8f0', color: '#475569' }}
                                className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-600 text-[10px] font-extrabold uppercase tracking-wider flex-none"
                              >
                                FAIT
                              </span>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleHomework?.(item.id, false);
                                }}
                                title="Marquer comme à faire"
                                className="w-5 h-5 rounded-full bg-emerald-600 border-2 border-emerald-600 hover:bg-emerald-700 flex items-center justify-center cursor-pointer transition-all active:scale-90 flex-none"
                              >
                                <svg
                                  className="w-3 h-3 text-white stroke-[3.5]"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {text ? (
                            <p className="mt-2 text-xs leading-relaxed font-normal text-slate-400 line-through whitespace-pre-line">
                              {text}
                            </p>
                          ) : (
                            <p className="mt-2 text-slate-400 italic text-[11px] line-through">Travail effectué</p>
                          )}

                          {item.attachments && item.attachments.length > 0 && (
                            <div className="mt-2.5 pt-2 border-t border-slate-200 flex flex-wrap gap-1.5">
                              {item.attachments.map((att) => (
                                <span
                                  key={att.id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200/80 border border-slate-300 text-slate-400 font-medium text-[10px] line-through"
                                >
                                  {att.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div
                        key={item.id || `${item.due_date}-${item.subject_name}`}
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

                            {item.interrogation && (
                              <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                                ÉVAL
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-amber-600 text-white text-[10px] font-extrabold uppercase tracking-wider flex-none">
                              À FAIRE
                            </span>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleHomework?.(item.id, true);
                              }}
                              title="Marquer comme fait"
                              className="w-5 h-5 rounded-full bg-white border-2 border-slate-400 hover:border-emerald-600 hover:bg-emerald-50 flex items-center justify-center cursor-pointer transition-all active:scale-90 flex-none"
                            />
                          </div>
                        </div>

                        {text ? (
                          <p className="mt-2 text-xs leading-relaxed font-semibold text-slate-900 whitespace-pre-line">
                            {text}
                          </p>
                        ) : (
                          <p className="mt-2 text-slate-500 italic text-[11px]">Travail à effectuer</p>
                        )}

                        {item.attachments && item.attachments.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-slate-300/60 flex flex-wrap gap-1.5">
                            {item.attachments.map((att) => (
                              <span
                                key={att.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-300 text-slate-900 font-bold text-[10px]"
                              >
                                {att.name}
                                {typeof att.size === 'number' && (
                                  <span className="font-number text-slate-500 font-normal text-[10px]">
                                    ({(att.size / 1024).toFixed(0)} Ko)
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};


