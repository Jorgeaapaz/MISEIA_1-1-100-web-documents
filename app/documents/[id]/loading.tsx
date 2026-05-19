export default function DocumentDetailLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 animate-pulse rounded bg-border" />
            <div>
              <div className="mb-2 h-6 w-64 animate-pulse rounded bg-border" />
              <div className="flex gap-2">
                <div className="h-5 w-12 animate-pulse rounded-full bg-border" />
                <div className="h-5 w-32 animate-pulse rounded bg-border" />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-16 animate-pulse rounded-lg bg-border" />
            <div className="h-8 w-20 animate-pulse rounded-lg bg-border" />
          </div>
        </div>

        <div className="mb-6">
          <div className="mb-2 h-4 w-24 animate-pulse rounded bg-border" />
          <div className="h-16 w-full animate-pulse rounded bg-border" />
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-lg bg-background p-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="mb-1 h-3 w-12 animate-pulse rounded bg-border" />
              <div className="h-4 w-20 animate-pulse rounded bg-border" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
