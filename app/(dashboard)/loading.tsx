export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Title skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-36 bg-muted rounded-md" />
        <div className="h-4 w-64 bg-muted/60 rounded-md" />
      </div>

      {/* Metrics Row skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 border rounded-lg bg-card space-y-2">
            <div className="h-3 w-20 bg-muted rounded" />
            <div className="h-7 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Main Content Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 border rounded-lg bg-card space-y-4">
          <div className="h-4 w-40 bg-muted rounded" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between">
                  <div className="h-3 w-24 bg-muted rounded" />
                  <div className="h-3 w-16 bg-muted rounded" />
                </div>
                <div className="h-2 w-full bg-muted/60 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 border rounded-lg bg-card space-y-4">
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1.5 pb-2">
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="h-4 w-full bg-muted/60 rounded" />
                <div className="h-2 w-16 bg-muted/40 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
