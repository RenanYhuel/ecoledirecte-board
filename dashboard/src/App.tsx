import { useEffect, useState, useCallback } from 'react';
import { IdentityClockCard } from './components/IdentityClockCard';
import { TimetableStrip } from './components/TimetableStrip';
import { HomeworkCard } from './components/HomeworkCard';
import { GradesCard } from './components/GradesCard';
import { MessagesCard } from './components/MessagesCard';
import { DashboardSkeleton } from './components/DashboardSkeleton';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SecurityChallengeView } from './components/SecurityChallengeView';
import { fetchOverview, submitDoubleAuth, toggleHomework, toggleMessageRead } from './services/api';
import type { QcmChallenge } from './services/api';
import type { DashboardOverview } from './types/dashboard';

export function App() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [twoFactorChallenge, setTwoFactorChallenge] = useState<QcmChallenge | null>(null);
  const [is2faSubmitting, setIs2faSubmitting] = useState<boolean>(false);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadDashboard = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsSyncing(true);
    }
    setError(null);

    try {
      const res = await fetchOverview();
      if (res.code === 250 && res.details) {
        setTwoFactorChallenge(res.details);
      } else if (res.data) {
        setData(res.data);
        setTwoFactorChallenge(null);
        setLastUpdated(new Date());
      } else {
        setError(res.message || 'Erreur de chargement des données');
      }
    } catch (err: any) {
      console.error('Failed to load dashboard overview:', err);
      const errData = err?.response?.data;
      if (errData?.code === 250 && errData?.details) {
        setTwoFactorChallenge(errData.details as QcmChallenge);
      } else {
        setError(errData?.message || err?.message || 'Erreur de connexion au serveur proxy ÉcoleDirecte');
      }
    } finally {
      if (isInitial) {
        setIsLoading(false);
      } else {
        setIsSyncing(false);
      }
    }
  }, []);

  const handle2faSubmit = async (choiceRaw: string) => {
    setIs2faSubmitting(true);
    setTwoFactorError(null);
    try {
      const success = await submitDoubleAuth(choiceRaw);
      if (success) {
        setTwoFactorChallenge(null);
        await loadDashboard(true);
      } else {
        setTwoFactorError('Réponse 2FA rejetée par ÉcoleDirecte. Veuillez réessayer.');
      }
    } catch (err: any) {
      console.error('Failed to submit 2FA:', err);
      setTwoFactorError(err?.response?.data?.message || err?.message || 'Échec de validation de la réponse 2FA');
    } finally {
      setIs2faSubmitting(false);
    }
  };

  const handleToggleHomework = useCallback(async (homeworkId: number, isDone: boolean) => {
    setData((prev) => {
      if (!prev) return prev;
      let pendingCount = 0;
      let doneCount = 0;

      const updatedDays = prev.homework.days.map((day) => {
        const updatedItems = day.items.map((item) => {
          if (item.id === homeworkId) {
            return { ...item, is_done: isDone };
          }
          return item;
        });

        for (const it of updatedItems) {
          if (it.is_done) {
            doneCount++;
          } else {
            pendingCount++;
          }
        }

        return { ...day, items: updatedItems };
      });

      return {
        ...prev,
        homework: {
          ...prev.homework,
          days: updatedDays,
          pending_count: pendingCount,
          done_count: doneCount,
        },
      };
    });

    try {
      const studentId = data?.student?.id || 0;
      await toggleHomework(studentId, homeworkId, isDone);
    } catch (err) {
      console.error('Failed to toggle homework:', err);
      loadDashboard(false);
    }
  }, [data?.student?.id, loadDashboard]);

  const handleToggleMessageRead = useCallback(async (messageId: number, isRead: boolean) => {
    setData((prev) => {
      if (!prev) return prev;
      const updatedReceived = prev.messages.received.map((msg) =>
        msg.id === messageId ? { ...msg, is_read: isRead } : msg
      );
      const unreadCount = updatedReceived.filter((m) => !m.is_read).length;

      return {
        ...prev,
        messages: {
          ...prev.messages,
          received: updatedReceived,
          unread_count: unreadCount,
        },
      };
    });

    try {
      const studentId = data?.student?.id || 0;
      await toggleMessageRead(studentId, messageId, isRead);
    } catch (err) {
      console.error('Failed to toggle message read status:', err);
      loadDashboard(false);
    }
  }, [data?.student?.id, loadDashboard]);

  useEffect(() => {
    loadDashboard(true);
    const interval = setInterval(() => {
      loadDashboard(false);
    }, 30000);
    return () => clearInterval(interval);
  }, [loadDashboard]);

  if (twoFactorChallenge) {
    return (
      <SecurityChallengeView
        challenge={twoFactorChallenge}
        onSubmit={handle2faSubmit}
        isLoading={is2faSubmitting}
        errorMessage={twoFactorError}
      />
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col p-3.5 bg-[#f1f5f9] select-none box-border font-sans relative">
      {isSyncing && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 animate-pulse z-50 opacity-80" />
      )}

      {isLoading && !data ? (
        <DashboardSkeleton />
      ) : error && !data ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white border-2 border-rose-300 rounded-2xl">
          <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 mb-3 font-bold text-sm">
            ED
          </div>
          <h2 className="text-sm font-bold text-rose-950">Erreur de synchronisation</h2>
          <p className="text-xs text-rose-600 font-medium mt-1 max-w-sm">{error}</p>
          <button
            type="button"
            onClick={() => loadDashboard(true)}
            className="mt-4 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer active:scale-95 transition-all"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          <section className="col-span-12 lg:col-span-4 flex flex-col gap-3.5 min-h-0">
            <div className="flex-none">
              <ErrorBoundary fallbackTitle="Erreur Horloge">
                <IdentityClockCard
                  student={data?.student}
                  lastUpdated={lastUpdated}
                />
              </ErrorBoundary>
            </div>

            <div className="flex-1 min-h-0">
              <ErrorBoundary fallbackTitle="Erreur Emploi du Temps">
                <TimetableStrip
                  slots={data?.timetable?.today || []}
                  tomorrowSlots={data?.timetable?.tomorrow || []}
                  nextSlot={data?.timetable?.next_slot}
                />
              </ErrorBoundary>
            </div>
          </section>

          <section className="col-span-12 lg:col-span-4 flex flex-col min-h-0">
            <ErrorBoundary fallbackTitle="Erreur Devoirs">
              <HomeworkCard
                days={data?.homework?.days || []}
                onToggleHomework={handleToggleHomework}
              />
            </ErrorBoundary>
          </section>

          <section className="col-span-12 lg:col-span-4 flex flex-col gap-3.5 min-h-0">
            <div className="flex-[0.55] min-h-0">
              <ErrorBoundary fallbackTitle="Erreur Notes">
                <GradesCard
                  periods={data?.notes?.periods || []}
                  recentGrades={data?.notes?.recent_grades || []}
                  generalAverage={data?.notes?.general_average}
                  classAverage={data?.notes?.class_average}
                />
              </ErrorBoundary>
            </div>

            <div className="flex-[0.45] min-h-0">
              <ErrorBoundary fallbackTitle="Erreur Messages">
                <MessagesCard
                  messages={data?.messages?.received || []}
                  unreadCount={data?.messages?.unread_count || 0}
                  onToggleMessageRead={handleToggleMessageRead}
                />
              </ErrorBoundary>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}

export default App;
