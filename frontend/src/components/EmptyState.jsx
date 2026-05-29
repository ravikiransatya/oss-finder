export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-state">
      {Icon && (
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'var(--surface-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-4)',
          marginBottom: 4,
        }}>
          <Icon size={24} strokeWidth={1.5} />
        </div>
      )}
      <h3 style={{
        fontSize: 16, fontWeight: 500, fontFamily: 'var(--font-body)',
        color: 'var(--text-2)',
      }}>
        {title}
      </h3>
      {description && (
        <p style={{ fontSize: 14, color: 'var(--text-4)', maxWidth: 320, lineHeight: 1.6 }}>
          {description}
        </p>
      )}
      {action && (
        <div style={{ marginTop: 8 }}>{action}</div>
      )}
    </div>
  )
}
