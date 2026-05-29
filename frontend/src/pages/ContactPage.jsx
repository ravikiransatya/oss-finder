import { Mail, MessageSquare, Bug, Lightbulb } from 'lucide-react'

const TOPICS = [
  { icon: Bug,          title: 'Report a Bug',       body: 'Found something broken? Let us know and we will fix it fast.' },
  { icon: Lightbulb,    title: 'Feature Request',     body: 'Have an idea that would make OSS Finder better? We would love to hear it.' },
  { icon: MessageSquare,title: 'General Enquiry',     body: 'Questions about the platform, partnerships, or anything else.' },
  { icon: Mail,         title: 'Press & Media',       body: 'Writing about OSS Finder? Reach out and we will get back to you promptly.' },
]

export default function ContactPage() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 52 }}>
        <h1 style={{ fontSize: 36, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 12 }}>
          Contact <span style={{ color: 'var(--brand)' }}>Us</span>
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-3)', lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
          We are a small team and we read every message. Whether it is a bug, a suggestion, or just a hello — reach out.
        </p>
      </div>

      {/* Email card */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '24px 28px', borderRadius: 14, marginBottom: 36,
        background: 'var(--brand-soft)',
        border: '1px solid rgba(15,98,254,0.2)',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, flexShrink: 0,
          background: 'var(--brand)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Mail size={22} color="#fff" strokeWidth={2} />
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--brand)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
            Email Us Directly
          </p>
          <a href="mailto:ossfinder01@gmail.com" style={{
            fontSize: 18, fontWeight: 600, color: 'var(--text)',
            textDecoration: 'none', fontFamily: 'var(--font-display)',
          }}>
            ossfinder01@gmail.com
          </a>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
            We typically respond within 24–48 hours on business days.
          </p>
        </div>
      </div>

      {/* Topic cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {TOPICS.map(({ icon: Icon, title, body }) => (
          <a key={title} href="mailto:ossfinder01@gmail.com"
            style={{
              display: 'flex', gap: 16, padding: '22px 24px',
              borderRadius: 14, border: '1px solid var(--border-soft)',
              background: '#fff', textDecoration: 'none',
              transition: 'box-shadow 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: 'var(--brand-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={18} color="var(--brand)" strokeWidth={2} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{title}</p>
              <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6 }}>{body}</p>
            </div>
          </a>
        ))}
      </div>

      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-4)', marginTop: 40 }}>
        For urgent security issues, please see our{' '}
        <a href="/security" style={{ color: 'var(--brand)', textDecoration: 'none' }}>Security Policy</a>.
      </p>
    </div>
  )
}
