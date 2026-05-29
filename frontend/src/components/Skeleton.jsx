export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="shimmer" style={{ height: 22, width: 72, borderRadius: 99 }} />
        <div className="shimmer" style={{ height: 22, width: 56, borderRadius: 99 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="shimmer" style={{ height: 18, width: '85%' }} />
        <div className="shimmer" style={{ height: 18, width: '60%' }} />
      </div>
      <div className="shimmer" style={{ height: 44, borderRadius: 8 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="shimmer" style={{ height: 14, width: 40 }} />
          <div className="shimmer" style={{ height: 14, width: 40 }} />
        </div>
        <div className="shimmer" style={{ height: 34, width: 96, borderRadius: 8 }} />
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
      gap: 16,
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
