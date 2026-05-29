import { useState, useCallback } from 'react'
import { Search, SlidersHorizontal, TrendingUp, Zap, Users, Code2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import IssueCard from '../components/IssueCard'
import { SkeletonGrid } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import { useApi } from '../hooks/useApi'

const LANGS = ['All', 'JavaScript', 'Python', 'TypeScript', 'Go', 'Rust', 'Java', 'C++']
const DIFFS = ['All', 'Beginner', 'Intermediate', 'Advanced']

const STATS = [
  { icon: Code2,    label: 'Open Issues',   value: '12,400+' },
  { icon: Users,    label: 'Contributors',   value: '8,300+'  },
  { icon: TrendingUp, label: 'Repos Indexed', value: '2,100+' },
  { icon: Zap,      label: 'AI Matches',     value: '94%'     },
]

export default function HomePage() {
  const [query, setQuery]   = useState('')
  const [lang, setLang]     = useState('All')
  const [diff, setDiff]     = useState('All')
  const [issues, setIssues] = useState([])
  const [searched, setSearched] = useState(false)
  const { loading, error, get } = useApi()

  const search = useCallback(async () => {
    if (!query.trim()) return
    setSearched(true)
    try {
      const params = { search: query }
      if (lang !== 'All') params.language = lang
      if (diff !== 'All') params.difficulty = diff.toLowerCase()
      const data = await get('/api/issues', params)
      setIssues(data.results || data.issues || [])
    } catch {}
  }, [query, lang, diff, get])

  const handleKey = (e) => {
    if (e.key === 'Enter') search()
  }

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%)',
        borderBottom: '1px solid var(--border-soft)',
        padding: '72px 24px 64px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'var(--brand-soft)',
            border: '1px solid rgba(15,98,254,0.2)',
            borderRadius: 99, padding: '5px 14px',
            marginBottom: 28,
          }}>
            <img src="/logo.png" alt="" style={{ height: 16, width: 'auto' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--brand)', letterSpacing: '0.03em' }}>
              AI-POWERED OSS DISCOVERY
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 58px)',
            lineHeight: 1.1,
            color: 'var(--text)',
            marginBottom: 18,
            letterSpacing: '-0.03em',
          }}>
            Find your next<br />
            <span style={{ color: 'var(--brand)', fontStyle: 'italic' }}>open-source</span> adventure
          </h1>

          <p style={{
            fontSize: 17, color: 'var(--text-3)', lineHeight: 1.7,
            maxWidth: 480, margin: '0 auto 40px',
          }}>
            Discover beginner-friendly issues, AI-curated projects, and contribution paths tailored to your skills.
          </p>

          {/* Search bar */}
          <div style={{ position: 'relative', maxWidth: 560, margin: '0 auto 12px' }}>
            <Search size={18} style={{
              position: 'absolute', left: 18, top: '50%',
              transform: 'translateY(-50%)', color: 'var(--text-4)',
              pointerEvents: 'none',
            }} />
            <input
              type="text"
              className="search-input"
              placeholder="Search issues, repos, languages…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKey}
              style={{ paddingLeft: 50, paddingRight: 130 }}
            />
            <button
              className="btn-primary"
              onClick={search}
              disabled={loading}
              style={{
                position: 'absolute', right: 8, top: '50%',
                transform: 'translateY(-50%)',
                padding: '8px 18px', fontSize: 14,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Searching…' : 'Search'}
            </button>
          </div>

          {/* Quick links */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['good first issue', 'help wanted', 'documentation', 'bug'].map(tag => (
              <button key={tag} onClick={() => { setQuery(tag); }}
                style={{
                  background: 'none', border: '1px solid var(--border)',
                  borderRadius: 99, padding: '4px 12px',
                  fontSize: 12, color: 'var(--text-3)', cursor: 'pointer',
                  transition: 'all 0.15s', fontFamily: 'var(--font-body)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)' }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section style={{
        borderBottom: '1px solid var(--border-soft)',
        padding: '20px 24px',
        background: '#fff',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 1,
        }}>
          {STATS.map(({ icon: Icon, label, value }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'var(--brand-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={16} color="var(--brand)" strokeWidth={2} />
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>{value}</p>
                <p style={{ fontSize: 12, color: 'var(--text-4)' }}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Results */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 24px' }}>

        {/* Filters */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          marginBottom: 28, flexWrap: 'wrap',
        }}>
          <SlidersHorizontal size={15} color="var(--text-4)" />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {LANGS.map(l => (
              <button key={l}
                onClick={() => setLang(l)}
                style={{
                  padding: '5px 12px', borderRadius: 99, fontSize: 13,
                  fontFamily: 'var(--font-body)', cursor: 'pointer',
                  border: lang === l ? '1px solid var(--brand)' : '1px solid var(--border)',
                  background: lang === l ? 'var(--brand-soft)' : 'transparent',
                  color: lang === l ? 'var(--brand)' : 'var(--text-3)',
                  transition: 'all 0.15s',
                }}
              >{l}</button>
            ))}
          </div>
          <div style={{ width: 1, height: 20, background: 'var(--border-soft)', margin: '0 4px' }} />
          <div style={{ display: 'flex', gap: 6 }}>
            {DIFFS.map(d => (
              <button key={d}
                onClick={() => setDiff(d)}
                style={{
                  padding: '5px 12px', borderRadius: 99, fontSize: 13,
                  fontFamily: 'var(--font-body)', cursor: 'pointer',
                  border: diff === d ? '1px solid var(--brand)' : '1px solid var(--border)',
                  background: diff === d ? 'var(--brand-soft)' : 'transparent',
                  color: diff === d ? 'var(--brand)' : 'var(--text-3)',
                  transition: 'all 0.15s',
                }}
              >{d}</button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading && <SkeletonGrid count={6} />}

        {error && (
          <div style={{
            background: '#fff1f2', border: '1px solid #fecdd3',
            borderRadius: 12, padding: '16px 20px',
            color: '#be123c', fontSize: 14,
          }}>
            {error} — please check your backend is running.
          </div>
        )}

        {!loading && !error && searched && issues.length === 0 && (
          <EmptyState
            icon={Search}
            title="No issues found"
            description="Try a different search term, language, or difficulty level."
          />
        )}

        {!loading && !error && issues.length > 0 && (
          <>
            <p style={{ fontSize: 13, color: 'var(--text-4)', marginBottom: 16 }}>
              {issues.length} issues found
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: 16,
            }}>
              {issues.map((issue, i) => (
                <IssueCard key={issue.id || i} issue={issue} />
              ))}
            </div>
          </>
        )}

        {!loading && !searched && (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <p style={{ fontSize: 14, color: 'var(--text-4)', marginBottom: 16 }}>
              Or browse curated AI-powered project suggestions
            </p>
            <Link to="/build" className="btn-primary" style={{ textDecoration: 'none' }}>
              <Zap size={15} />
              Try AI Project Builder
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
