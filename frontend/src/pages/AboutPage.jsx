import { Zap, Target, Users, Code2 } from 'lucide-react'

export default function AboutPage() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <img src="/logo.png" alt="OSS Finder" style={{ height: 56, marginBottom: 16 }} />
        <h1 style={{ fontSize: 36, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 14 }}>
          About <span style={{ color: 'var(--brand)' }}>OSS Finder</span>
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-3)', lineHeight: 1.8, maxWidth: 560, margin: '0 auto' }}>
          OSS Finder is an AI-powered platform built to bridge the gap between developers who want to contribute to open source and the thousands of projects that need their help.
        </p>
      </div>

      {[
        {
          icon: Target,
          title: 'Our Mission',
          body: 'Open source powers the modern internet, yet most developers never contribute because finding the right issue feels overwhelming. OSS Finder uses AI to match your skills, language preferences, and experience level to issues where you can make a real impact — from your very first pull request to advanced contributions.',
        },
        {
          icon: Code2,
          title: 'What We Built',
          body: 'We index thousands of GitHub repositories daily, tag issues by difficulty, language, and topic, and run semantic AI search so you can find issues by meaning — not just keywords. Our AI Project Builder helps you scaffold real projects step by step, and your personal dashboard tracks your contribution journey with streaks and bookmarks.',
        },
        {
          icon: Users,
          title: 'Who It\'s For',
          body: 'Whether you are a student making your first open-source contribution, a professional looking to give back to the ecosystem, or a maintainer wanting to attract quality contributors — OSS Finder is built for you. We believe every developer has something valuable to contribute.',
        },
        {
          icon: Zap,
          title: 'The Technology',
          body: 'OSS Finder is built on FastAPI, React, and PostgreSQL. Our AI layer uses sentence-transformers for semantic embeddings and Groq\'s LLaMA models for the project builder. The entire stack is open, transparent, and designed to be fast, reliable, and privacy-respecting.',
        },
      ].map(({ icon: Icon, title, body }) => (
        <div key={title} style={{
          display: 'flex', gap: 20, marginBottom: 40,
          padding: 28, borderRadius: 14,
          border: '1px solid var(--border-soft)',
          background: '#fff',
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: 'var(--brand-soft)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={20} color="var(--brand)" strokeWidth={2} />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>{title}</h2>
            <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.8 }}>{body}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
