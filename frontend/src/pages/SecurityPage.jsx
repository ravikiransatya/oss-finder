import { Shield, Lock, Eye, AlertTriangle } from 'lucide-react'

const PRACTICES = [
  {
    icon: Lock,
    title: 'Authentication & Sessions',
    body: 'All user sessions are managed with signed JWT tokens using a strong secret key. Tokens expire automatically. Passwords for email accounts are hashed with bcrypt (cost factor 12). OAuth tokens from GitHub and Google are never stored — only the resulting user profile is saved.',
  },
  {
    icon: Shield,
    title: 'Data Transmission',
    body: 'All communication between your browser and OSS Finder is encrypted via HTTPS/TLS. API endpoints are protected against common web vulnerabilities including CORS misconfiguration, and rate limiting is enforced on all public endpoints to prevent abuse.',
  },
  {
    icon: Eye,
    title: 'Data Access Controls',
    body: 'User data is strictly scoped — you can only access your own bookmarks, profile, and contribution history. All authenticated endpoints validate the JWT token and reject requests with invalid or expired tokens. Database queries use parameterised statements to prevent SQL injection.',
  },
  {
    icon: AlertTriangle,
    title: 'Dependency Security',
    body: 'We regularly audit our dependencies for known vulnerabilities. The backend uses FastAPI, SQLAlchemy, and PyJWT — all actively maintained libraries. The frontend uses React and Vite with no unnecessary third-party SDKs that could introduce supply chain risks.',
  },
]

export default function SecurityPage() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 52 }}>
        <h1 style={{ fontSize: 36, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 12 }}>
          Security
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-3)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
          Security is a core part of how we build OSS Finder. Here is an overview of the measures we take to protect your data and our infrastructure.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 48 }}>
        {PRACTICES.map(({ icon: Icon, title, body }) => (
          <div key={title} style={{
            display: 'flex', gap: 20, padding: '28px 32px',
            borderRadius: 14, border: '1px solid var(--border-soft)', background: '#fff',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: 'var(--brand-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={20} color="var(--brand)" strokeWidth={2} />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>{title}</h2>
              <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.8 }}>{body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Responsible disclosure */}
      <div style={{
        padding: '32px 36px', borderRadius: 14,
        background: 'var(--brand-soft)',
        border: '1px solid rgba(15,98,254,0.2)',
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>
          Responsible Disclosure
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.8, marginBottom: 16 }}>
          If you discover a security vulnerability in OSS Finder, we ask that you report it responsibly. Please do not publicly disclose the issue until we have had a reasonable opportunity to investigate and address it.
        </p>
        <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.8, marginBottom: 16 }}>
          To report a vulnerability, email us at:
        </p>
        <a href="mailto:ossfinder01@gmail.com" style={{
          display: 'inline-block',
          fontSize: 16, fontWeight: 600, color: 'var(--brand)',
          textDecoration: 'none', fontFamily: 'var(--font-display)',
        }}>
          ossfinder01@gmail.com
        </a>
        <p style={{ fontSize: 13, color: 'var(--text-4)', marginTop: 12 }}>
          Please include a clear description of the vulnerability, steps to reproduce, and potential impact. We will acknowledge your report within 48 hours and keep you updated on our progress.
        </p>
      </div>
    </div>
  )
}
