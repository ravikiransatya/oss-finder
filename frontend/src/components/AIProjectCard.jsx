import { Sparkles, ExternalLink, Star, Users, Code, Lightbulb } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AIProjectCard({ project, index }) {
  const navigate = useNavigate()
  
  const startBuilding = () => {
    // Save project to localStorage with unique ID
    const projectWithId = {
      ...project,
      id: Date.now(),
      savedAt: new Date().toISOString(),
      status: 'planning'
    }
    
    const savedProjects = JSON.parse(localStorage.getItem('oss_saved_projects') || '[]')
    savedProjects.push(projectWithId)
    localStorage.setItem('oss_saved_projects', JSON.stringify(savedProjects))
    
    // Navigate to AI Project Builder
    navigate(`/build/${projectWithId.id}`)
  }
  return (
    <div
      className="ai-card"
      style={{
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        animationDelay: `${index * 60}ms`,
        animation: 'fadeUp 0.4s ease both',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: 'var(--brand-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Sparkles size={17} color="var(--brand)" strokeWidth={2} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h3 style={{
              fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-body)',
              color: 'var(--text)',
            }}>{project.title}</h3>
            <span className="badge badge-blue" style={{ fontSize: 11 }}>
              {project.level}
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
            {project.category} • {project.realWorld} Real-world Impact
          </p>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65 }}>
        {project.description}
      </p>

      {/* AI Customization */}
      {project.customization && (
        <div style={{
          background: 'rgba(15,98,254,0.05)',
          border: '1px solid rgba(15,98,254,0.15)',
          borderRadius: 8,
          padding: '10px 12px',
        }}>
          <p style={{ fontSize: 12, color: 'var(--brand)', fontStyle: 'italic', lineHeight: 1.6 }}>
            <Lightbulb size={12} style={{ display: 'inline', marginRight: 4 }} />
            {project.customization}
          </p>
        </div>
      )}

      {/* Features */}
      {project.features?.length > 0 && (
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', marginBottom: 8 }}>
            <Code size={12} style={{ display: 'inline', marginRight: 4 }} />
            Key Features:
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {project.features.slice(0, 6).map(feature => (
              <span key={feature} className="badge badge-gray" style={{ fontSize: 11 }}>
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* GitHub Repos */}
      {project.repos?.length > 0 && (
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', marginBottom: 8 }}>
            Similar GitHub Projects:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {project.repos.slice(0, 2).map(repo => (
              <div key={repo.name} style={{
                background: '#f8f9fa',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>
                    {repo.name}
                  </p>
                  {repo.description && (
                    <p style={{ fontSize: 11, color: 'var(--text-3)' }}>
                      {repo.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--text-4)' }}>
                      <Star size={10} /> {repo.stars?.toLocaleString()}
                    </span>
                    {repo.language && (
                      <span style={{ fontSize: 11, color: 'var(--text-4)' }}>
                        {repo.language}
                      </span>
                    )}
                  </div>
                </div>
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '4px 8px',
                    fontSize: 11,
                    color: 'var(--brand)',
                    textDecoration: 'none',
                    border: '1px solid var(--brand)',
                    borderRadius: 4,
                    marginLeft: 8
                  }}
                >
                  View <ExternalLink size={10} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', paddingTop: 8,
        borderTop: '1px solid var(--border-soft)'
      }}>
        <div style={{ fontSize: 12, color: 'var(--text-4)' }}>
          AI-Generated Project Idea
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* View Best Repo Button */}
          {project.repos && project.repos.length > 0 && (
            <a
              href={project.repos[0].url}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
              style={{ 
                padding: '7px 14px', 
                fontSize: 13, 
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <ExternalLink size={12} />
              View Example
            </a>
          )}
          
          {/* Start Building Button */}
          <button
            className="btn-primary"
            style={{ padding: '7px 14px', fontSize: 13 }}
            onClick={startBuilding}
          >
            <Sparkles size={12} style={{ marginRight: 4 }} />
            Start Building
          </button>
        </div>
      </div>
    </div>
  )
}
