export function IssueSkeleton() {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="h-5 w-24 rounded-full shimmer" />
        <div className="h-5 w-16 rounded-full shimmer" />
      </div>
      <div className="h-4 w-full rounded shimmer" />
      <div className="h-4 w-3/4 rounded shimmer" />
      <div className="flex gap-2 mt-1">
        <div className="h-4 w-20 rounded-full shimmer" />
        <div className="h-4 w-16 rounded-full shimmer" />
      </div>
      <div className="flex justify-between mt-2 pt-2 border-t border-white/5">
        <div className="h-3 w-16 rounded shimmer" />
        <div className="h-3 w-12 rounded shimmer" />
      </div>
    </div>
  )
}

export function StatSkeleton() {
  return (
    <div className="stat-card">
      <div className="h-7 w-16 rounded shimmer mb-1" />
      <div className="h-3 w-24 rounded shimmer" />
    </div>
  )
}
