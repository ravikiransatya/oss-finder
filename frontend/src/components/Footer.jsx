import { Link } from 'react-router-dom'
import { Github, Twitter, Heart } from 'lucide-react'

const LINKS = {
  Product: [
    { label: 'Explore Issues', to: '/explore' },
    { label: 'AI Builder',     to: '/build' },
    { label: 'Dashboard',      to: '/dashboard' },
    { label: 'Bookmarks',      to: '/bookmarks' },
  ],
  Company: [
    { label: 'About',     to: '/about' },
    { label: 'Blog',      to: '/blog' },
    { label: 'Changelog', to: '/changelog' },
    { label: 'Contact',   to: '/contact' },
  ],
  Legal: [
    { label: 'Privacy',  to: '/privacy' },
    { label: 'Terms',    to: '/terms' },
    { label: 'Security', to: '/security' },
  ],
}

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-soft)',
      background: 'var(--surface)',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '48px 24px 32px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr repeat(3, auto)',
          gap: '40px 60px',
        }}>
          {/* Brand col */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Link to="/" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
              textDecoration: 'none', gap: 4,
            }}>
              <img src="/logo.png" alt="OSS Finder Logo" style={{ height: 40, width: 'auto', objectFit: 'contain' }} />
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: 14, fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text)',
                lineHeight: 1,
              }}>
                OSS<span style={{ color: 'var(--brand)' }}>Finder</span>
              </span>
            </Link>
            <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.7, maxWidth: 220 }}>
              Find the perfect open-source project to contribute to, powered by AI.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              {[
                { icon: Github,  href: 'https://github.com' },
                { icon: Twitter, href: 'https://twitter.com' },
              ].map(({ icon: Icon, href }) => (
                <a key={href} href={href} target="_blank" rel="noreferrer"
                  style={{
                    width: 32, height: 32,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    color: 'var(--text-3)',
                    transition: 'all 0.15s',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = 'var(--text)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-3)' }}
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Link cols */}
          {Object.entries(LINKS).map(([col, links]) => (
            <div key={col} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p className="section-label">{col}</p>
              {links.map(({ label, to }) => (
                <Link key={label} to={to} style={{
                  fontSize: 13, color: 'var(--text-3)',
                  textDecoration: 'none', transition: 'color 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                >{label}</Link>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          marginTop: 40, paddingTop: 20,
          borderTop: '1px solid var(--border-soft)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
        }}>
          <p style={{ fontSize: 12, color: 'var(--text-4)' }}>
            © {new Date().getFullYear()} OSSFinder. All rights reserved.
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-4)', display: 'flex', alignItems: 'center', gap: 4 }}>
            Built with <Heart size={11} style={{ color: '#e11d48' }} fill="#e11d48" /> for open source contributors
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          footer > div > div:first-child {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </footer>
  )
}
