import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Github, Save, Plus, X, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { updateProfile } from '../api/issues'

const SKILL_SUGGESTIONS = [
  'JavaScript', 'TypeScript', 'Python', 'Rust', 'Go', 'Java', 'C++', 'Ruby',
  'React', 'Vue', 'Svelte', 'Next.js', 'FastAPI', 'Django', 'Node.js',
  'PostgreSQL', 'Redis', 'Docker', 'CSS', 'HTML',
]

const EXPERIENCE_OPTIONS = [
  { value: 'beginner',     label: 'Beginner',     desc: 'Getting started with open source' },
  { value: 'intermediate', label: 'Intermediate',  desc: 'Made a few contributions' },
  { value: 'advanced',     label: 'Advanced',      desc: 'Regular contributor' },
]

export default function ProfilePage() {
  const { user, token, login } = useAuth()
  const navigate = useNavigate()

  const [name,       setName]       = useState(user?.name || '')
  const [bio,        setBio]        = useState(user?.bio || '')
  const [experience, setExperience] = useState(user?.experience || 'beginner')
  const [skills,     setSkills]     = useState(user?.skills || [])
  const [skillInput, setSkillInput] = useState('')
  const [saving,     setSaving]     = useState(false)
  const [saved,      setSaved]      = useState(false)

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-5 py-20 flex flex-col items-center justify-center text-center page-enter">
        <User size={32} className="text-white/20 mb-4" />
        <p className="text-white/40 text-sm mb-5">Sign in to manage your profile.</p>
        <button onClick={login} className="btn-primary"><LogIn size={15}/> Sign in with GitHub</button>
      </div>
    )
  }

  const addSkill = (skill) => {
    if (!skill.trim() || skills.includes(skill)) return
    setSkills(prev => [...prev, skill.trim()])
    setSkillInput('')
  }

  const removeSkill = (skill) => setSkills(prev => prev.filter(s => s !== skill))

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile(token, { name, bio, experience, skills })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (_) {}
    setSaving(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-8 page-enter">
      <h1 className="font-display text-2xl font-700 text-white mb-7">Your Profile</h1>

      {/* Avatar + GitHub */}
      <div className="card p-5 flex items-center gap-4 mb-5">
        <img src={user.avatar} alt={user.username} className="w-14 h-14 rounded-full border-2 border-brand-500/30" />
        <div className="flex-1 min-w-0">
          <p className="font-display font-600 text-white">{user.name || user.username}</p>
          <p className="text-sm text-white/40">@{user.username}</p>
        </div>
        <a
          href={user.github_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost border border-white/10 text-xs"
        >
          <Github size={13} /> GitHub
        </a>
      </div>

      {/* Name */}
      <div className="mb-5">
        <label className="block text-sm text-white/60 mb-1.5">Display Name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="input"
          placeholder="Your name"
        />
      </div>

      {/* Bio */}
      <div className="mb-5">
        <label className="block text-sm text-white/60 mb-1.5">Bio</label>
        <textarea
          value={bio}
          onChange={e => setBio(e.target.value)}
          className="input resize-none h-24"
          placeholder="Tell us about yourself…"
        />
      </div>

      {/* Experience */}
      <div className="mb-5">
        <label className="block text-sm text-white/60 mb-2">Experience Level</label>
        <div className="flex flex-col gap-2">
          {EXPERIENCE_OPTIONS.map(({ value, label, desc }) => (
            <button
              key={value}
              onClick={() => setExperience(value)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                experience === value
                  ? 'bg-brand-600/15 border-brand-500/40 text-white'
                  : 'bg-white/3 border-white/8 text-white/50 hover:border-white/20 hover:text-white/70'
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                experience === value ? 'border-brand-400 bg-brand-400' : 'border-white/20'
              }`} />
              <div>
                <p className="font-medium text-sm">{label}</p>
                <p className="text-xs opacity-60">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="mb-8">
        <label className="block text-sm text-white/60 mb-2">Skills</label>

        {/* Current skills */}
        <div className="flex flex-wrap gap-2 mb-3">
          {skills.map(skill => (
            <span key={skill} className="flex items-center gap-1.5 badge bg-brand-600/15 text-brand-300 border border-brand-500/20 py-1 px-2.5">
              {skill}
              <button onClick={() => removeSkill(skill)} className="hover:text-white transition-colors">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>

        {/* Add custom skill */}
        <div className="flex gap-2 mb-3">
          <input
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSkill(skillInput)}
            className="input flex-1"
            placeholder="Add a skill…"
          />
          <button onClick={() => addSkill(skillInput)} className="btn-ghost border border-white/10">
            <Plus size={15} />
          </button>
        </div>

        {/* Suggestions */}
        <div className="flex flex-wrap gap-1.5">
          {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).slice(0, 12).map(s => (
            <button
              key={s}
              onClick={() => addSkill(s)}
              className="px-2.5 py-1 rounded-lg text-xs bg-white/5 text-white/40 border border-white/8 hover:border-white/20 hover:text-white/60 transition-all"
            >
              + {s}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-primary w-full justify-center py-3"
      >
        <Save size={15} />
        {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Profile'}
      </button>
    </div>
  )
}
