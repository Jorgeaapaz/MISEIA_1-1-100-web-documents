export default function DocumentsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded bg-border" />
        <div className="h-10 w-36 animate-pulse rounded-lg bg-border" />
      </div>

      <div className="mb-6 flex gap-2">
        <div className="h-10 flex-1 animate-pulse rounded-lg bg-border" />
        <div className="h-10 w-20 animate-pulse rounded-lg bg-border" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col rounded-xl border border-border bg-card p-5"
          >
            <div className="mb-3 flex justify-between">
              <div className="h-10 w-10 animate-pulse rounded bg-border" />
              <div className="h-5 w-12 animate-pulse rounded-full bg-border" />
            </div>
            <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-border" />
            <div className="mb-3 h-3 w-full animate-pulse rounded bg-border" />
            <div className="mt-auto flex justify-between">
              <div className="h-3 w-16 animate-pulse rounded bg-border" />
              <div className="h-3 w-24 animate-pulse rounded bg-border" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
