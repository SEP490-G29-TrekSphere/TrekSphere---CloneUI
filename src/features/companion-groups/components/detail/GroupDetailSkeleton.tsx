export function GroupDetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-7 animate-pulse">
      {/* Hero skeleton */}
      <div className="rounded-2xl bg-muted h-56 md:h-64" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 gap-7 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-7">
          <div className="rounded-2xl bg-card border border-border p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-2">
                <div className="h-5 w-40 rounded bg-muted" />
                <div className="h-3 w-56 rounded bg-muted" />
              </div>
              <div className="h-6 w-36 rounded-full bg-muted" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {['a', 'b', 'c'].map((key) => (
                <div
                  key={key}
                  className="flex items-center gap-3 rounded-xl border border-border bg-background p-3.5"
                >
                  <div className="h-11 w-11 shrink-0 rounded-full bg-muted" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="h-3 w-24 rounded bg-muted" />
                    <div className="h-2.5 w-16 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl bg-muted h-48" />
          <div className="rounded-2xl bg-card border border-border h-40" />
        </div>
      </div>
    </div>
  );
}
