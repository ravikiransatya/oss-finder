import { SlidersHorizontal } from 'lucide-react'

const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 'Java', 'C++', 'Ruby']
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced']
const SORTS = [
  { value: 'newest',  label: 'Newest' },
  { value: 'stars',   label: 'Most Stars' },
  { value: 'quality', label: 'Quality' },
]

export default function FilterBar({ filters, onChange }) {
  const set = (key, val) => onChange({ ...filters, [key]: val === filters[key] ? '' : val })

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1.5 text-xs text-white/40 mr-1">
        <SlidersHorizontal size={13} />
        Filter
      </span>

      {/* Language */}
      <div className="flex flex-wrap gap-1.5">
        {LANGUAGES.map(lang => (
          <button
            key={lang}
            onClick={() => set('language', lang)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
              filters.language === lang
                ? 'bg-brand-600/30 text-brand-300 border-brand-500/40'
                : 'bg-white/5 text-white/40 border-white/8 hover:border-white/20 hover:text-white/70'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-white/10 mx-1 hidden sm:block" />

      {/* Difficulty */}
      <div className="flex gap-1.5">
        {DIFFICULTIES.map(d => (
          <button
            key={d}
            onClick={() => set('difficulty', d)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border capitalize transition-all ${
              filters.difficulty === d
                ? 'bg-accent-500/20 text-accent-400 border-accent-500/30'
                : 'bg-white/5 text-white/40 border-white/8 hover:border-white/20 hover:text-white/70'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-white/10 mx-1 hidden sm:block" />

      {/* Sort */}
      <select
        value={filters.sort || 'newest'}
        onChange={e => onChange({ ...filters, sort: e.target.value })}
        className="bg-white/5 border border-white/8 rounded-lg px-2.5 py-1 text-xs text-white/60 focus:outline-none focus:border-brand-500/50"
      >
        {SORTS.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
    </div>
  )
}
