import React, { useRef } from 'react';
import type { MessageSummary } from '../types/dashboard';
import { useAutoPingPongScroll } from '../hooks/useAutoPingPongScroll';

interface MessagesCardProps {
  messages?: MessageSummary[];
  unreadCount?: number;
  onToggleMessageRead?: (messageId: number, isRead: boolean) => void;
}

interface SenderTheme {
  label: string;
  unreadBg: string;
  unreadBorder: string;
  unreadBadge: string;
  unreadSender: string;
  unreadDate: string;
  readBg: string;
  readBorder: string;
  readBadge: string;
  readSender: string;
  readDate: string;
}

function cleanEdText(str: string): string {
  if (!str) return '';
  return str
    .replace(/Ǹ/g, 'é')
    .replace(/\?\?/g, '—')
    .replace(/\uFFFD/g, 'à')
    .replace(/\\u0027/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function getSenderTheme(msg: MessageSummary): SenderTheme {
  const senderUpper = (msg.sender || '').toUpperCase();
  const subjectUpper = (msg.subject || '').toUpperCase();
  const role = (msg.sender_role || '').toUpperCase();

  if (
    subjectUpper.includes('[INFO PASTO]') ||
    subjectUpper.includes('[MESSE') ||
    subjectUpper.includes('PASTO') ||
    senderUpper.includes('PASTORALE')
  ) {
    return {
      label: 'PASTORALE',
      unreadBg: 'bg-emerald-50',
      unreadBorder: 'border-emerald-400 hover:border-emerald-500',
      unreadBadge: 'bg-emerald-600 text-white',
      unreadSender: 'text-emerald-950 font-black',
      unreadDate: 'text-emerald-800 font-bold',
      readBg: 'bg-emerald-50/40',
      readBorder: 'border-emerald-200/80 hover:border-emerald-300',
      readBadge: 'bg-emerald-100/90 text-emerald-800 border border-emerald-300/80',
      readSender: 'text-emerald-950/80 font-semibold',
      readDate: 'text-emerald-800/60 font-medium',
    };
  }

  if (role === 'P' || senderUpper.includes('PROF') || senderUpper.includes('ENSEIGNANT')) {
    return {
      label: 'PROF',
      unreadBg: 'bg-blue-50',
      unreadBorder: 'border-blue-400 hover:border-blue-500',
      unreadBadge: 'bg-blue-600 text-white',
      unreadSender: 'text-blue-950 font-black',
      unreadDate: 'text-blue-800 font-bold',
      readBg: 'bg-blue-50/40',
      readBorder: 'border-blue-200/80 hover:border-blue-300',
      readBadge: 'bg-blue-100/90 text-blue-800 border border-blue-300/80',
      readSender: 'text-blue-950/80 font-semibold',
      readDate: 'text-blue-800/60 font-medium',
    };
  }

  if (
    role === 'DIR' ||
    senderUpper.includes('DIRECTION') ||
    senderUpper.includes('PROVISEUR') ||
    senderUpper.includes('PRINCIPAL') ||
    subjectUpper.includes('DIRECTION')
  ) {
    return {
      label: 'DIRECTION',
      unreadBg: 'bg-purple-50',
      unreadBorder: 'border-purple-400 hover:border-purple-500',
      unreadBadge: 'bg-purple-600 text-white',
      unreadSender: 'text-purple-950 font-black',
      unreadDate: 'text-purple-800 font-bold',
      readBg: 'bg-purple-50/40',
      readBorder: 'border-purple-200/80 hover:border-purple-300',
      readBadge: 'bg-purple-100/90 text-purple-800 border border-purple-300/80',
      readSender: 'text-purple-950/80 font-semibold',
      readDate: 'text-purple-800/60 font-medium',
    };
  }

  if (
    role === 'A' ||
    role === 'D' ||
    senderUpper.includes('VIE SCOLAIRE') ||
    senderUpper.includes('SECRETARIAT') ||
    senderUpper.includes('ADMIN') ||
    senderUpper.includes('COMPTABILITE')
  ) {
    return {
      label: 'ADMIN',
      unreadBg: 'bg-amber-50',
      unreadBorder: 'border-amber-400 hover:border-amber-500',
      unreadBadge: 'bg-amber-600 text-white',
      unreadSender: 'text-amber-950 font-black',
      unreadDate: 'text-amber-800 font-bold',
      readBg: 'bg-amber-50/40',
      readBorder: 'border-amber-200/80 hover:border-amber-300',
      readBadge: 'bg-amber-100/90 text-amber-800 border border-amber-300/80',
      readSender: 'text-amber-950/80 font-semibold',
      readDate: 'text-amber-800/60 font-medium',
    };
  }

  return {
    label: 'MAIL',
    unreadBg: 'bg-sky-50',
    unreadBorder: 'border-sky-400 hover:border-sky-500',
    unreadBadge: 'bg-sky-600 text-white',
    unreadSender: 'text-sky-950 font-black',
    unreadDate: 'text-sky-800 font-bold',
    readBg: 'bg-slate-50/60',
    readBorder: 'border-slate-200 hover:border-slate-300',
    readBadge: 'bg-slate-100 text-slate-700 border border-slate-200',
    readSender: 'text-slate-800/80 font-semibold',
    readDate: 'text-slate-500 font-medium',
  };
}

function formatMessageDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr.replace(' ', 'T'));
    if (isNaN(d.getTime())) {
      return dateStr.split(' ')[0] || dateStr;
    }
    const day = d.getDate().toString().padStart(2, '0');
    const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    const month = months[d.getMonth()] || '';
    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${hours}:${mins}`;
  } catch {
    return dateStr;
  }
}

export const MessagesCard: React.FC<MessagesCardProps> = ({
  messages = [],
  unreadCount = 0,
  onToggleMessageRead,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useAutoPingPongScroll(containerRef, [messages], { speed: 0.4, pauseDurationMs: 2500 });

  return (
    <div className="bg-white border-2 border-sky-200 rounded-2xl p-4 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between pb-2 flex-none">
        <h2 className="text-xs font-bold uppercase tracking-wider text-sky-950">
          Messagerie & Mails
        </h2>

        {unreadCount > 0 ? (
          <span className="font-number text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-600 text-white flex-none">
            {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
          </span>
        ) : (
          <span className="font-number text-xs font-bold text-sky-900 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full flex-none">
            {messages.length} messages
          </span>
        )}
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto pt-3 space-y-2 no-scrollbar min-h-0">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <div className="text-sm font-extrabold text-slate-900">Aucun message</div>
            <p className="text-xs text-slate-500 font-medium max-w-[200px] mt-1">
              Votre boîte de réception est vide.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUnread = !msg.is_read;
            const theme = getSenderTheme(msg);
            const cleanedSender = cleanEdText(msg.sender) || 'Administration';
            const cleanedSubject = cleanEdText(msg.subject) || 'Sans objet';
            const formattedDate = formatMessageDate(msg.date);

            return (
              <div
                key={msg.id}
                className={`p-3 rounded-xl border-2 text-xs transition-all ${
                  isUnread
                    ? `${theme.unreadBg} ${theme.unreadBorder} opacity-100`
                    : `${theme.readBg} ${theme.readBorder} opacity-70 hover:opacity-100`
                }`}
              >
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold flex-none uppercase tracking-wider ${
                        isUnread ? theme.unreadBadge : theme.readBadge
                      }`}
                    >
                      {theme.label}
                    </span>

                    <span
                      className={`truncate text-xs ${
                        isUnread ? theme.unreadSender : theme.readSender
                      }`}
                    >
                      {cleanedSender}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-none">
                    <button
                      type="button"
                      onClick={() => onToggleMessageRead?.(msg.id, !msg.is_read)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold transition-all cursor-pointer select-none active:scale-90 uppercase tracking-wider ${
                        isUnread
                          ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-none'
                          : 'bg-white/90 hover:bg-sky-50 text-slate-600 hover:text-sky-800 border border-slate-300 hover:border-sky-300'
                      }`}
                      title={isUnread ? 'Cliquer pour marquer comme lu' : 'Cliquer pour marquer comme non lu'}
                    >
                      {isUnread ? 'NON LU' : 'LU'}
                    </button>

                    <span
                      className={`font-number text-[11px] ${
                        isUnread ? theme.unreadDate : theme.readDate
                      }`}
                    >
                      {formattedDate}
                    </span>
                  </div>
                </div>

                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <span
                    className={`text-xs truncate flex-1 ${
                      isUnread
                        ? 'font-bold text-slate-950'
                        : 'font-medium text-slate-600'
                    }`}
                  >
                    {cleanedSubject}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
