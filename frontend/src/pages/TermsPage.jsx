const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: `By accessing or using OSS Finder ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. We reserve the right to update these terms at any time, and continued use of the Service constitutes acceptance of any changes.`,
  },
  {
    title: '2. Description of Service',
    body: `OSS Finder is an AI-powered platform that helps developers discover open-source issues, receive personalised contribution recommendations, and build projects using AI assistance. The Service is provided free of charge and is intended for personal, non-commercial use.`,
  },
  {
    title: '3. User Accounts',
    body: `You may sign in using GitHub OAuth, Google OAuth, or an email and password. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to notify us immediately at ossfinder01@gmail.com if you suspect any unauthorised use of your account.`,
  },
  {
    title: '4. Acceptable Use',
    body: `You agree not to:
• Use the Service for any unlawful purpose or in violation of any applicable laws
• Attempt to reverse-engineer, scrape, or abuse the API beyond normal usage
• Impersonate any person or entity or misrepresent your affiliation
• Upload or transmit malicious code, spam, or harmful content
• Attempt to gain unauthorised access to any part of the Service or its infrastructure

We reserve the right to suspend or terminate accounts that violate these terms without prior notice.`,
  },
  {
    title: '5. Intellectual Property',
    body: `The OSS Finder platform, including its design, code, and content, is the intellectual property of OSS Finder. Issue data is sourced from GitHub under their API terms of service. AI-generated content produced by the Project Builder is provided as-is for your personal use and we make no warranties regarding its accuracy or fitness for a particular purpose.`,
  },
  {
    title: '6. Disclaimer of Warranties',
    body: `The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, error-free, or free of harmful components. Use of the Service is at your own risk.`,
  },
  {
    title: '7. Limitation of Liability',
    body: `To the fullest extent permitted by law, OSS Finder shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Service, even if we have been advised of the possibility of such damages.`,
  },
  {
    title: '8. Termination',
    body: `We reserve the right to suspend or terminate your access to the Service at any time, with or without cause, and with or without notice. You may also delete your account at any time by contacting us at ossfinder01@gmail.com.`,
  },
  {
    title: '9. Governing Law',
    body: `These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising from these Terms or your use of the Service shall be resolved through good-faith negotiation before any formal proceedings.`,
  },
]

export default function TermsPage() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px' }}>
      <div style={{ marginBottom: 48 }}>
        <h1 style={{ fontSize: 36, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 10 }}>
          Terms of Service
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-4)' }}>Last updated: June 2025</p>
        <p style={{ fontSize: 15, color: 'var(--text-3)', lineHeight: 1.8, marginTop: 16 }}>
          Please read these Terms of Service carefully before using OSS Finder. These terms govern your access to and use of the platform.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {SECTIONS.map(({ title, body }) => (
          <div key={title} style={{
            padding: '28px 32px', borderRadius: 14,
            border: '1px solid var(--border-soft)', background: '#fff',
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>{title}</h2>
            <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.85, whiteSpace: 'pre-line' }}>{body}</p>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 40, padding: '20px 28px', borderRadius: 12,
        background: 'var(--brand-soft)', border: '1px solid rgba(15,98,254,0.2)',
        fontSize: 14, color: 'var(--text-3)', lineHeight: 1.7,
      }}>
        Questions about these terms? Email us at{' '}
        <a href="mailto:ossfinder01@gmail.com" style={{ color: 'var(--brand)', textDecoration: 'none', fontWeight: 500 }}>
          ossfinder01@gmail.com
        </a>
      </div>
    </div>
  )
}
