import React, { useEffect, useState } from 'react';
import type { AccountInfo } from '../types/dashboard';

interface IdentityClockCardProps {
  student?: AccountInfo;
  lastUpdated?: Date | null;
}

export const IdentityClockCard: React.FC<IdentityClockCardProps> = ({ student }) => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatFrenchDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const formatFrenchTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="bg-white border-2 border-blue-200 rounded-2xl p-4 flex flex-col justify-between">
      <div>
        <div className="text-[11px] font-extrabold uppercase tracking-wider text-blue-900">
          Horloge & Direct
        </div>

        <div className="font-number text-3xl font-black tracking-tight text-slate-950 mt-2 leading-none">
          {formatFrenchTime(time)}
        </div>
        <div className="text-xs font-semibold text-slate-500 capitalize mt-1.5">
          {formatFrenchDate(time)}
        </div>
      </div>

      <div className="pt-3 mt-3 border-t border-blue-100 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-extrabold text-slate-900 tracking-tight truncate">
            {student ? `${student.first_name} ${student.last_name}` : 'Élève'}
          </div>
          <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
            {student?.establishment_name || 'Établissement'}
          </div>
        </div>

        {student?.class_name && (
          <span className="px-3 py-1 rounded-xl bg-blue-600 text-white font-extrabold text-xs tracking-wide flex-none">
            {student.class_name}
          </span>
        )}
      </div>
    </div>
  );
};
