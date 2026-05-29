const POSTS = [
  {
    date: 'June 10, 2025',
    tag: 'Guide',
    title: 'How to Make Your First Open Source Contribution in 2025',
    summary: 'A step-by-step walkthrough for developers who have never submitted a pull request before — from finding the right issue to getting your PR merged.',
  },
  {
    date: 'May 28, 2025',
    tag: 'Product',
    title: 'Introducing the AI Project Builder',
    summary: 'We launched a conversational AI builder that helps you scaffold real projects — authentication systems, REST APIs, dashboards — step by step with generated code.',
  },
  {
    date: 'May 14, 2025',
    tag: 'Guide',
    title: 'Understanding Good First Issues: What Maintainers Really Want',
    summary: 'Not all "good first issue" labels are equal. We break down what makes a great beginner issue and how to evaluate whether it is right for your skill level.',
  },
  {
    date: 'April 30, 2025',
    tag: 'Engineering',
    title: 'How We Built Semantic Search for GitHub Issues',
    summary: 'A deep dive into how OSS Finder uses sentence-transformers and cosine similarity to match developers to issues by meaning, not just keywords.',
  },
  {
    date: 'April 12, 2025',
    tag: 'Guide',
    title: 'Top 10 Beginner-Friendly Open Source Projects to Contribute to',
    summary: 'A curated list of active, welcoming repositories across JavaScript, Python, Go, and Rust that are known for mentoring new contributors.',
  },
  {
    date: 'March 25, 2025',
    tag: 'Community',
    title: 'Why Open Source Contributions Matter for Your Career',
    summary: 'Real-world data and developer stories on how contributing to open source accelerates hiring, builds reputation, and sharpens engineering skills.',
  },
]

const TAG_COLORS = {
  Guide: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  Product: { bg: 'var(--brand-soft)', color: 'var(--brand)', border: 'rgba(15,98,254,0.2)' },
  Engineering: { bg: '#fdf4ff', color: '#9333ea', border: '#e9d5ff' },
  Community: { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
}

export default function BlogPage() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 52 }}>
        <h1 style={{ fontSize: 36, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 12 }}>
          OSS Finder <span style={{ color: 'var(--brand)' }}>Blog</span>
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-3)', lineHeight: 1.7 }}>
          Guides, product updates, and engineering deep dives from the OSS Finder team.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {POSTS.map(({ date, tag, title, summary }) => {
          const tc = TAG_COLORS[tag] || TAG_COLORS.Guide
          return (
            <div key={title} style={{
              padding: '28px 32px', borderRadius: 14,
              border: '1px solid var(--border-soft)',
              background: '#fff',
              cursor: 'pointer',
              transition: 'box-shadow 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
                  padding: '3px 10px', borderRadius: 99,
                  background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`,
                }}>{tag}</span>
                <span style={{ fontSize: 12, color: 'var(--text-4)' }}>{date}</span>
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', marginBottom: 8, lineHeight: 1.4 }}>{title}</h2>
              <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.7 }}>{summary}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
