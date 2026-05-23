import { Search, X } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder = 'Search issues, repos, languages…' }) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pl-10 pr-10"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
