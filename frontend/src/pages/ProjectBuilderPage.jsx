import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Sparkles, Send, ArrowLeft, Copy, Download, Bot, User } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || ''

export default function ProjectBuilderPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [messages, setMessages] = useState([])
  const [userInput, setUserInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [generatedFiles, setGeneratedFiles] = useState({})
  const [phase, setPhase] = useState('setup')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const savedProjects = JSON.parse(localStorage.getItem('oss_saved_projects') || '[]')
    const found = savedProjects.find(p => p.id === parseInt(projectId))
    if (found) {
      setProject(found)
      setMessages([{
        type: 'ai',
        content: `🚀 Welcome! I'm your AI assistant for "${found.title}".\n\nI can help you with:\n• Project setup & architecture\n• Code generation\n• File structure\n• Dependencies & configuration\n• Best practices\n\nWhat would you like to start with?`,
        timestamp: new Date().toISOString()
      }])
    } else {
      navigate('/build')
    }
  }, [projectId, navigate])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!userInput.trim() || isLoading) return

    const currentInput = userInput
    setUserInput('')
    setIsLoading(true)

    setMessages(prev => [
      ...prev,
      { type: 'user', content: currentInput, timestamp: new Date().toISOString() },
      { type: 'ai', content: '🤔 Thinking...', isLoading: true, timestamp: new Date().toISOString() }
    ])

    try {
      const res = await fetch(`${API}/api/projects/ai-build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project,
          phase,
          userMessage: currentInput,
          previousMessages: messages.slice(-6).map(m => ({ role: m.type, content: m.content }))
        })
      })

      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data = await res.json()

      // Collect any generated files
      if (data.code && typeof data.code === 'object') {
        setGeneratedFiles(prev => ({ ...prev, ...data.code }))
      }

      if (data.phaseComplete) {
        const phases = ['setup', 'structure', 'core', 'advanced', 'deployment']
        const next = phases[phases.indexOf(phase) + 1]
        if (next) setPhase(next)
      }

      const aiText = [
        data.message,
        data.nextSteps?.length ? '\n\n**Next steps:**\n' + data.nextSteps.map(s => `• ${s}`).join('\n') : ''
      ].filter(Boolean).join('')

      setMessages(prev => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last.isLoading) {
          last.content = aiText
          last.isLoading = false
          last.files = data.code || null
        }
        return updated
      })
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last.isLoading) {
          last.content = `❌ Error: ${err.message}. Make sure the backend is running.`
          last.isLoading = false
        }
        return updated
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
  }

  const downloadProject = () => {
    const text = Object.entries(generatedFiles)
      .map(([f, c]) => `// ${f}\n${c}\n`)
      .join('\n' + '='.repeat(50) + '\n\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
    a.download = `${project?.title.replace(/\s+/g, '-').toLowerCase()}-code.txt`
    a.click()
  }

  if (!project) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>

  const phases = ['setup', 'structure', 'core', 'advanced', 'deployment']

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px', display: 'flex', gap: 24, height: 'calc(100vh - 100px)' }}>

      {/* Sidebar */}
      <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <button onClick={() => navigate('/build')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 13 }}>
          <ArrowLeft size={15} /> Back
        </button>

        <div className="card" style={{ padding: 16 }}>
          <h2 style={{ fontSize: 15, color: 'var(--text)', marginBottom: 6 }}>{project.title}</h2>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10 }}>{project.description}</p>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {project.features?.slice(0, 4).map(f => (
              <span key={f} className="badge badge-gray" style={{ fontSize: 10 }}>{f}</span>
            ))}
          </div>
        </div>

        {/* Phase tracker */}
        <div className="card" style={{ padding: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Build Phase</p>
          {phases.map((p, i) => (
            <div key={p} onClick={() => setPhase(p)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
              borderRadius: 6, cursor: 'pointer', marginBottom: 2,
              background: phase === p ? 'var(--brand-soft)' : 'transparent'
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: phase === p ? 'var(--brand)' : 'var(--surface)',
                color: phase === p ? '#fff' : 'var(--text-3)',
                border: '1px solid var(--border)'
              }}>{i + 1}</div>
              <span style={{ fontSize: 12, color: phase === p ? 'var(--brand)' : 'var(--text-3)', textTransform: 'capitalize' }}>{p}</span>
            </div>
          ))}
        </div>

        {/* Generated files */}
        {Object.keys(generatedFiles).length > 0 && (
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Files ({Object.keys(generatedFiles).length})</p>
              <button onClick={downloadProject} className="btn-secondary" style={{ padding: '3px 8px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Download size={11} /> Download
              </button>
            </div>
            <div style={{ maxHeight: 180, overflowY: 'auto' }}>
              {Object.keys(generatedFiles).map(f => (
                <div key={f} style={{ fontSize: 11, color: 'var(--text-3)', padding: '3px 6px', background: 'var(--surface)', borderRadius: 4, marginBottom: 3 }}>
                  📄 {f}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>

        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={15} color="var(--brand)" />
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>AI Project Builder</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-4)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 99, padding: '2px 10px', textTransform: 'capitalize' }}>
            Phase: {phase}
          </span>
        </div>

        <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ marginBottom: 18, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                background: msg.type === 'user' ? 'var(--brand)' : 'var(--surface)',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {msg.type === 'user' ? <User size={14} color="#fff" /> : <Bot size={14} color="var(--brand)" />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  padding: '10px 14px', borderRadius: 10,
                  background: msg.type === 'user' ? 'var(--brand-soft)' : 'var(--surface)',
                  border: `1px solid ${msg.type === 'user' ? 'var(--brand)' : 'var(--border)'}`,
                  fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'var(--text)'
                }}>
                  {msg.isLoading
                    ? <span style={{ color: 'var(--text-3)' }}>🤔 Thinking...</span>
                    : msg.content}
                </div>

                {msg.files && Object.entries(msg.files).map(([filename, code]) => (
                  <div key={filename} style={{ marginTop: 8 }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: '#1e293b', color: '#fff', padding: '6px 12px',
                      borderRadius: '8px 8px 0 0', fontSize: 11
                    }}>
                      <span>📄 {filename}</span>
                      <button onClick={() => copyCode(code)}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                        <Copy size={11} /> Copy
                      </button>
                    </div>
                    <pre style={{
                      background: '#0f172a', color: '#e2e8f0', padding: 12,
                      borderRadius: '0 0 8px 8px', fontSize: 11, overflow: 'auto',
                      margin: 0, fontFamily: 'Monaco, Consolas, monospace', maxHeight: 280
                    }}>{code}</pre>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <textarea
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder="Ask me to generate code, explain architecture, create files..."
              rows={2}
              style={{
                flex: 1, padding: '10px 12px', border: '1px solid var(--border)',
                borderRadius: 8, fontSize: 13, fontFamily: 'var(--font-body)',
                resize: 'none', outline: 'none', color: 'var(--text)'
              }}
            />
            <button onClick={sendMessage} disabled={isLoading || !userInput.trim()} className="btn-primary"
              style={{ padding: '10px 14px', opacity: (isLoading || !userInput.trim()) ? 0.6 : 1 }}>
              {isLoading ? '...' : <Send size={15} />}
            </button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 6 }}>Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  )
}
