import { useState } from 'react'
import { Sparkles, Send, RotateCcw, Lightbulb } from 'lucide-react'
import AIProjectCard from '../components/AIProjectCard'
import { SkeletonGrid } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import API_BASE_URL from '../config/api';

const PROMPTS = [
  'I want to contribute to a Python data science project',
  'Show me beginner-friendly JavaScript repos',
  'Find me a Rust systems project with good docs',
  'I know React and want to help with open source tools',
]

export default function BuildProjectsPage() {
  const [prompt, setPrompt] = useState('')
  const [projects, setProjects] = useState([])
  const [asked, setAsked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const ask = async (text) => {
    const q = (text || prompt).trim()
    if (!q) return
    
    setAsked(true)
    setPrompt(q)
    setLoading(true)
    setError(null)
    
    try {
      // Use the correct API URL based on environment
      const apiUrl = `${API_BASE_URL}/api/projects/ai-suggest`
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: q })
      })
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }
      
      const data = await response.json()
      setProjects(data.projects || data || [])
    } catch (error) {
      console.error('API Error:', error)
      setError(`Failed to fetch projects: ${error.message}`)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => { if (e.key === 'Enter') ask() }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(24px, 5vw, 48px) clamp(16px, 4vw, 24px)' }}>

      {/* Header */}
      <div style={{ marginBottom: 'clamp(24px, 5vw, 40px)', maxWidth: 640 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'linear-gradient(135deg, #ebf2ff, #f0fff4)',
          border: '1px solid rgba(15,98,254,0.2)',
          borderRadius: 99, padding: '5px 14px', marginBottom: 16,
        }}>
          <Sparkles size={12} color="var(--brand)" />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--brand)', letterSpacing: '0.03em' }}>
            AI PROJECT BUILDER
          </span>
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--text)', marginBottom: 12 }}>
          Tell me what you want to build
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-3)', lineHeight: 1.7 }}>
          Describe your skills, interests, or the kind of contribution you want to make — our AI will find the perfect open-source project for you.
        </p>
      </div>

      {/* Prompt input */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-soft)',
        borderRadius: 16,
        padding: 'clamp(16px, 4vw, 20px)',
        marginBottom: 32,
      }}>
        <div className="prompt-container" style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask() } }}
            placeholder="e.g. I'm a Python developer who wants to contribute to machine learning tools…"
            rows={3}
            style={{
              flex: 1,
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '12px 14px',
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              color: 'var(--text)',
              outline: 'none',
              resize: 'none',
              lineHeight: 1.6,
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onFocus={e => {
              e.target.style.borderColor = 'var(--brand)'
              e.target.style.boxShadow = '0 0 0 3px rgba(15,98,254,0.1)'
            }}
            onBlur={e => {
              e.target.style.borderColor = 'var(--border)'
              e.target.style.boxShadow = 'none'
            }}
          />
          <div className="button-container" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              className="btn-primary"
              onClick={() => ask()}
              disabled={loading || !prompt.trim()}
              style={{ opacity: (loading || !prompt.trim()) ? 0.6 : 1, padding: '11px 18px' }}
            >
              <Send size={15} />
              {loading ? 'Finding…' : 'Find Projects'}
            </button>
            {asked && (
              <button
                className="btn-secondary"
                onClick={() => { 
                  setProjects([]); 
                  setAsked(false); 
                  setPrompt(''); 
                  setError(null); 
                }}
                style={{ padding: '10px 18px', fontSize: 13 }}
              >
                <RotateCcw size={13} /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Suggestion chips */}
        {!asked && (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 12, color: 'var(--text-4)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Lightbulb size={12} /> Try one of these
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PROMPTS.map(p => (
                <button key={p}
                  onClick={() => ask(p)}
                  style={{
                    background: '#fff',
                    border: '1px solid var(--border)',
                    borderRadius: 99, padding: '6px 14px',
                    fontSize: 12, color: 'var(--text-2)', cursor: 'pointer',
                    fontFamily: 'var(--font-body)', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)' }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {loading && <SkeletonGrid count={3} />}

      {error && (
        <div style={{
          background: '#fff1f2', border: '1px solid #fecdd3',
          borderRadius: 12, padding: '16px 20px', color: '#be123c', fontSize: 14,
        }}>
          {error} — make sure your backend and AI route are running.
        </div>
      )}

      {!loading && asked && projects.length === 0 && !error && (
        <EmptyState
          icon={Sparkles}
          title="No projects found"
          description="Try rephrasing your prompt or being more specific about your skills."
        />
      )}

      {!loading && projects.length > 0 && (
        <>
          <p style={{ fontSize: 13, color: 'var(--text-4)', marginBottom: 20 }}>
            {projects.length} AI-curated projects for you
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: 20,
          }}>
            {projects.map((p, i) => (
              <AIProjectCard key={p.id || i} project={p} index={i} />
            ))}
          </div>
        </>
      )}
      
      <style>{`
        @media (max-width: 640px) {
          .prompt-container {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .button-container {
            flex-direction: row !important;
            width: 100% !important;
          }
          .button-container button {
            flex: 1 !important;
          }
        }
      `}</style>
    </div>
  )
}
