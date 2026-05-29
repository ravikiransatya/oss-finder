const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: `When you sign in with GitHub or Google, we receive your public profile information — username, display name, avatar, and email address — solely to create and manage your account. We do not access your private repositories, code, or any data beyond what is required for authentication.

We also collect usage data such as which issues you bookmark, your skill preferences, and contribution status updates. This data is stored securely and used only to personalise your experience on OSS Finder.`,
  },
  {
    title: '2. How We Use Your Information',
    body: `Your information is used to:
• Authenticate you and maintain your session securely
• Personalise issue recommendations based on your skills and language preferences
• Track your contribution journey (bookmarks, applied, solved)
• Send transactional emails such as email verification and password reset (if applicable)

We do not sell, rent, or share your personal data with third parties for marketing purposes.`,
  },
  {
    title: '3. Data Storage and Security',
    body: `All data is stored in a PostgreSQL database hosted on secure infrastructure. Passwords (for email accounts) are hashed using industry-standard bcrypt. JWT tokens are signed with a secret key and expire after a defined period. We use HTTPS for all data in transit.`,
  },
  {
    title: '4. Third-Party Services',
    body: `OSS Finder integrates with the following third-party services:
• GitHub API — for OAuth authentication and issue data
• Google OAuth — for alternative sign-in
• Resend — for transactional email delivery
• Groq API — for AI-powered project generation (no personal data is sent)

Each of these services has its own privacy policy. We only share the minimum data necessary for each integration to function.`,
  },
  {
    title: '5. Cookies and Sessions',
    body: `We use browser localStorage to store your JWT authentication token. We do not use third-party tracking cookies or advertising cookies. No analytics SDKs are embedded in the frontend.`,
  },
  {
    title: '6. Your Rights',
    body: `You have the right to access, correct, or delete your personal data at any time. To request deletion of your account and all associated data, email us at ossfinder01@gmail.com with the subject line "Account Deletion Request". We will process your request within 7 business days.`,
  },
  {
    title: '7. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the top of this page. Continued use of OSS Finder after changes constitutes acceptance of the updated policy.`,
  },
]

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px' }}>
      <div style={{ marginBottom: 48 }}>
        <h1 style={{ fontSize: 36, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 10 }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-4)' }}>Last updated: June 2025</p>
        <p style={{ fontSize: 15, color: 'var(--text-3)', lineHeight: 1.8, marginTop: 16 }}>
          OSS Finder ("we", "our", "us") is committed to protecting your privacy. This policy explains what data we collect, how we use it, and your rights regarding your information.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
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
        Questions about this policy? Email us at{' '}
        <a href="mailto:ossfinder01@gmail.com" style={{ color: 'var(--brand)', textDecoration: 'none', fontWeight: 500 }}>
          ossfinder01@gmail.com
        </a>
      </div>
    </div>
  )
}
