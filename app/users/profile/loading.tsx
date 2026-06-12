function Skeleton({ className }: { className?: string }): React.JSX.Element {
  return (
    <div className={`animate-pulse rounded-md bg-muted ${className ?? ''}`} />
  );
}

export default function ProfileLoading(): React.JSX.Element {
  return (
    <div className="max-w-5xl p-6">
      <Skeleton className="mb-6 h-8 w-32" />

      <div className="rounded-lg border p-6 space-y-4 lg:w-80">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>

        {/* Created */}
        <div className="flex flex-col gap-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}
