import { useState, useEffect } from 'react'
import { Compass, Filter } from 'lucide-react'
import IssueCard from '../components/IssueCard'
import { SkeletonGrid } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import { useApi } from '../hooks/useApi'

const TOPICS = ['All', 'web', 'cli', 'ml', 'devtools', 'mobile', 'database', 'security']

export default function ExplorePage() {
  const [topic, setTopic] = useState('All')
  const [issues, setIssues] = useState([])
  const { loading, error, get } = useApi()

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const params = topic !== 'All' ? { topic } : {}
        const data = await get('/api/issues', params)
        // Handle both old format (data.issues) and new format (data.results)
        setIssues(data.results || data.issues || data || [])
      } catch (err) {
        console.error('Failed to fetch issues:', err)
        setIssues([])
      }
    }
    fetchIssues()
  }, [topic]) // Only depend on topic, not get

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, color: 'var(--text)', marginBottom: 8 }}>Explore</h1>
        <p style={{ fontSize: 15, color: 'var(--text-3)' }}>Browse open issues across popular projects</p>
      </div>

      {/* Topic filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
        <Filter size={15} color="var(--text-4)" />
        {TOPICS.map(t => (
          <button key={t}
            onClick={() => setTopic(t)}
            style={{
              padding: '6px 14px', borderRadius: 99, fontSize: 13,
              fontFamily: 'var(--font-body)', cursor: 'pointer',
              border: topic === t ? '1px solid var(--brand)' : '1px solid var(--border)',
              background: topic === t ? 'var(--brand-soft)' : 'transparent',
              color: topic === t ? 'var(--brand)' : 'var(--text-3)',
              transition: 'all 0.15s',
            }}
          >{t}</button>
        ))}
      </div>

      {loading && <SkeletonGrid count={6} />}

      {error && (
        <div style={{
          background: '#fff1f2', border: '1px solid #fecdd3',
          borderRadius: 12, padding: '16px 20px', color: '#be123c', fontSize: 14,
        }}>{error}</div>
      )}

      {!loading && !error && issues.length === 0 && (
        <EmptyState
          icon={Compass}
          title="Nothing here yet"
          description="Try selecting a different topic or check back later."
        />
      )}

      {!loading && issues.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 16,
        }}>
          {issues.map((issue, i) => (
            <IssueCard key={issue.id || i} issue={issue} />
          ))}
        </div>
      )}
    </div>
  )
}
