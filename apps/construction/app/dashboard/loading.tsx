export default function DashboardLoading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
      <div className="h-28 animate-pulse rounded-3xl border border-border/70 bg-muted/40" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={`metric-skeleton-${index + 1}`}
            className="h-40 animate-pulse rounded-3xl border border-border/70 bg-muted/40"
          />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="h-96 animate-pulse rounded-3xl border border-border/70 bg-muted/40" />
        <div className="h-96 animate-pulse rounded-3xl border border-border/70 bg-muted/40" />
      </div>
      <div className="h-96 animate-pulse rounded-3xl border border-border/70 bg-muted/40" />
    </div>
  );
}
