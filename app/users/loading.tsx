function Skeleton({ className }: { className?: string }): React.JSX.Element {
  return (
    <div className={`animate-pulse rounded-md bg-muted ${className ?? ''}`} />
  );
}

export default function UsersLoading(): React.JSX.Element {
  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <Skeleton className="h-8 w-32" />

      {/* Filters */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        {/* Header row */}
        <div className="flex gap-4 border-b px-4 py-3">
          {[120, 160, 120, 80, 100].map((w, i) => (
            <div
              key={i}
              className="h-4 animate-pulse rounded-md bg-muted"
              style={{ width: w }}
            />
          ))}
        </div>
        {/* Data rows */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex gap-4 border-b px-4 py-3 last:border-0">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-8" />
          ))}
        </div>
      </div>
    </div>
  );
}
