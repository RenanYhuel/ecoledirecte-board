import React from 'react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3.5 animate-pulse">
      <section className="col-span-12 lg:col-span-4 flex flex-col gap-3.5 min-h-0">
        <div className="flex-none bg-white border-2 border-slate-200 rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-slate-200" />
              <div className="space-y-1.5">
                <div className="w-24 h-3.5 bg-slate-300 rounded" />
                <div className="w-16 h-2.5 bg-slate-200 rounded" />
              </div>
            </div>
            <div className="w-16 h-5 bg-slate-200 rounded-full" />
          </div>

          <div className="flex items-baseline justify-between pt-1 border-t border-slate-100">
            <div className="w-36 h-8 bg-slate-300 rounded-lg" />
            <div className="w-28 h-3.5 bg-slate-200 rounded" />
          </div>
        </div>

        <div className="flex-1 min-h-0 bg-white border-2 border-indigo-100 rounded-2xl p-4 flex flex-col overflow-hidden shadow-sm">
          <div className="flex items-center justify-between pb-2 flex-none">
            <div className="flex items-center gap-2">
              <div className="w-28 h-3.5 bg-indigo-200 rounded" />
              <div className="w-24 h-6 bg-indigo-100 rounded-lg" />
            </div>
            <div className="w-14 h-4 bg-indigo-100 rounded-full" />
          </div>

          <div className="flex-1 pt-3 space-y-2.5 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-4 bg-slate-300 rounded-md" />
                    <div className="w-12 h-3 bg-slate-200 rounded" />
                  </div>
                  <div className="w-20 h-3.5 bg-slate-300 rounded" />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="w-24 h-3 bg-slate-200 rounded" />
                  <div className="w-14 h-3 bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="col-span-12 lg:col-span-4 flex flex-col min-h-0">
        <div className="h-full bg-white border-2 border-amber-100 rounded-2xl p-4 flex flex-col overflow-hidden shadow-sm">
          <div className="flex items-center justify-between pb-2 flex-none">
            <div className="w-40 h-3.5 bg-amber-200 rounded" />
            <div className="w-16 h-4 bg-amber-100 rounded-full" />
          </div>

          <div className="flex-1 pt-3 space-y-3 overflow-hidden">
            <div className="flex items-center justify-between pb-1 border-b border-amber-100/70">
              <div className="w-28 h-3 bg-amber-200 rounded" />
              <div className="w-16 h-3 bg-slate-200 rounded" />
            </div>

            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-4 bg-slate-300 rounded-md" />
                    <div className="w-10 h-3 bg-slate-200 rounded" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-3.5 bg-slate-200 rounded-md" />
                    <div className="w-5 h-5 rounded-full bg-slate-300" />
                  </div>
                </div>
                <div className="w-full h-3 bg-slate-200 rounded" />
                <div className="w-3/4 h-3 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="col-span-12 lg:col-span-4 flex flex-col gap-3.5 min-h-0">
        <div className="flex-[0.55] min-h-0 bg-white border-2 border-emerald-100 rounded-2xl p-4 flex flex-col overflow-hidden shadow-sm">
          <div className="flex items-center justify-between pb-2 flex-none gap-2">
            <div className="w-32 h-3.5 bg-emerald-200 rounded" />
            <div className="flex items-center gap-2">
              <div className="w-20 h-6 bg-emerald-200 rounded-xl" />
              <div className="w-20 h-6 bg-emerald-100 rounded-xl" />
            </div>
          </div>

          <div className="flex-1 pt-3 space-y-2.5 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-4 bg-slate-300 rounded-md" />
                    <div className="w-28 h-3.5 bg-slate-200 rounded" />
                  </div>
                  <div className="w-14 h-5 bg-slate-300 rounded-md" />
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <div className="w-16 h-3 bg-slate-200 rounded" />
                  <div className="w-20 h-3 bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-[0.45] min-h-0 bg-white border-2 border-sky-100 rounded-2xl p-4 flex flex-col overflow-hidden shadow-sm">
          <div className="flex items-center justify-between pb-2 flex-none">
            <div className="w-32 h-3.5 bg-sky-200 rounded" />
            <div className="w-14 h-4 bg-sky-100 rounded-full" />
          </div>

          <div className="flex-1 pt-3 space-y-2 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-3.5 bg-sky-200 rounded" />
                    <div className="w-24 h-3 bg-slate-300 rounded" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-10 h-3.5 bg-slate-200 rounded" />
                    <div className="w-12 h-3 bg-slate-200 rounded" />
                  </div>
                </div>
                <div className="w-5/6 h-3 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};
