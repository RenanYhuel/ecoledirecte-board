import { useEffect, useState, useCallback } from 'react';
import { IdentityClockCard } from './components/IdentityClockCard';
import { TimetableStrip } from './components/TimetableStrip';
import { HomeworkCard } from './components/HomeworkCard';
import { GradesCard } from './components/GradesCard';
import { MessagesCard } from './components/MessagesCard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { fetchOverview, toggleHomework, toggleMessageRead } from './services/api';
import type { DashboardOverview } from './types/dashboard';

export function App() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadDashboard = useCallback(async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    setError(null);
    try {
      const res = await fetchOverview();
      setData(res);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Failed to load dashboard overview:', err);
      setError(err?.message || 'Erreur de connexion au serveur proxy ÉcoleDirecte');
    } finally {
      if (showLoader) setIsLoading(false);
    }
  }, []);

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

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col p-3.5 bg-[#f1f5f9] select-none box-border font-sans">
      {isLoading && !data ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white border-2 border-slate-200 rounded-2xl">
          <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-3 animate-bounce font-bold text-sm">
            ED
          </div>
          <h2 className="text-sm font-extrabold text-slate-900">Synchronisation ÉcoleDirecte...</h2>
          <p className="text-xs text-slate-500 mt-1">Connexion en direct aux services ÉcoleDirecte</p>
        </div>
      ) : error && !data ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white border-2 border-rose-300 rounded-2xl">
          <h2 className="text-sm font-bold text-rose-900">Erreur de connexion</h2>
          <p className="text-xs text-rose-600 font-medium mt-1">{error}</p>
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
