const CHANGES = [
  {
    version: 'v1.4.0',
    date: 'June 2025',
    type: 'Feature',
    items: [
      'AI Project Builder — conversational code generation with Groq LLaMA 3.1',
      'Phase-by-phase project scaffolding (setup → structure → core → deployment)',
      'Inline code blocks with copy-to-clipboard and file download',
      'Conversation history preserved across build steps',
    ],
  },
  {
    version: 'v1.3.0',
    date: 'May 2025',
    type: 'Feature',
    items: [
      'Google OAuth login support',
      'Email verification flow with Resend API',
      'Forgot password and reset password pages',
      'Contribution streak tracking on dashboard',
    ],
  },
  {
    version: 'v1.2.0',
    date: 'April 2025',
    type: 'Improvement',
    items: [
      'Semantic search using sentence-transformers with cosine similarity',
      'Skill-based personalised recommendations on /recommend endpoint',
      'Infinite scroll on Explore page',
      'Advanced filters: language, difficulty, sort by date/stars/comments',
    ],
  },
  {
    version: 'v1.1.0',
    date: 'March 2025',
    type: 'Feature',
    items: [
      'GitHub OAuth login and profile linking',
      'Bookmark issues with status tracking (saved / applied / solved)',
      'User profile page with skills and language preferences',
      'Rate limiting via slowapi to prevent abuse',
    ],
  },
  {
    version: 'v1.0.0',
    date: 'February 2025',
    type: 'Launch',
    items: [
      'Initial launch of OSS Finder',
      'GitHub issue indexing with background scheduler (every 6 hours)',
      'FastAPI backend with PostgreSQL and SQLAlchemy',
      'React + Vite + Tailwind frontend with dark-themed responsive UI',
      'Docker Compose deployment with Nginx reverse proxy',
    ],
  },
]

const TYPE_COLORS = {
  Feature:     { bg: 'var(--brand-soft)', color: 'var(--brand)', border: 'rgba(15,98,254,0.2)' },
  Improvement: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  Launch:      { bg: '#fdf4ff', color: '#9333ea', border: '#e9d5ff' },
}

export default function ChangelogPage() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 52 }}>
        <h1 style={{ fontSize: 36, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 12 }}>
          Changelog
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-3)' }}>
          Every update, improvement, and new feature — in one place.
        </p>
      </div>

      <div style={{ position: 'relative' }}>
        {/* Timeline line */}
        <div style={{
          position: 'absolute', left: 16, top: 8, bottom: 8,
          width: 2, background: 'var(--border-soft)',
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 36, paddingLeft: 48 }}>
          {CHANGES.map(({ version, date, type, items }) => {
            const tc = TYPE_COLORS[type] || TYPE_COLORS.Feature
            return (
              <div key={version} style={{ position: 'relative' }}>
                {/* Dot */}
                <div style={{
                  position: 'absolute', left: -40, top: 4,
                  width: 12, height: 12, borderRadius: '50%',
                  background: 'var(--brand)',
                  border: '2px solid #fff',
                  boxShadow: '0 0 0 2px var(--brand)',
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{version}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
                    padding: '2px 9px', borderRadius: 99,
                    background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`,
                  }}>{type}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-4)' }}>{date}</span>
                </div>

                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.map(item => (
                    <li key={item} style={{ display: 'flex', gap: 10, fontSize: 14, color: 'var(--text-3)', lineHeight: 1.6 }}>
                      <span style={{ color: 'var(--brand)', fontWeight: 700, flexShrink: 0 }}>+</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
