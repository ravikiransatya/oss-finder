import { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Sparkles, Search as SearchIcon, RefreshCw } from 'lucide-react'
import { fetchIssues, semanticSearch } from '../api/issues'
import IssueCard from '../components/IssueCard'
import SearchBar from '../components/SearchBar'
import FilterBar from '../components/FilterBar'
import { IssueSkeleton } from '../components/Skeleton'

const PAGE_SIZE = 20

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch]       = useState(searchParams.get('search') || '')
  const [filters, setFilters]     = useState({
    language:   searchParams.get('language') || '',
    difficulty: searchParams.get('difficulty') || '',
    sort:       'newest',
  })
  const [issues, setIssues]       = useState([])
  const [total, setTotal]         = useState(0)
  const [skip, setSkip]           = useState(0)
  const [loading, setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError]         = useState(null)
  const [aiMode, setAiMode]       = useState(false)
  const [aiResults, setAiResults] = useState(null)

  const bottomRef = useRef(null)

  const load = useCallback(async (searchVal, filtersVal, skipVal, append = false) => {
    if (skipVal === 0) setLoading(true)
    else setLoadingMore(true)
    setError(null)
    try {
      const data = await fetchIssues({
        search:     searchVal,
        language:   filtersVal.language,
        difficulty: filtersVal.difficulty,
        sort:       filtersVal.sort,
        skip:       skipVal,
        limit:      PAGE_SIZE,
      })
      setTotal(data.total)
      setIssues(prev => append ? [...prev, ...(data.results || [])] : (data.results || []))
    } catch (e) {
      setError('Cannot connect to backend on port 8000.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    if (aiMode) return
    const t = setTimeout(() => {
      setSkip(0)
      load(search, filters, 0)
    }, 300)
    return () => clearTimeout(t)
  }, [search, filters, load, aiMode])

  const handleAiSearch = async () => {
    if (!search.trim()) return
    setLoading(true)
    setError(null)
    setAiMode(true)
    try {
      const data = await semanticSearch({ query: search, language: filters.language, difficulty: filters.difficulty })
      setAiResults(data.results || [])
    } catch {
      setError('Semantic search unavailable — using keyword mode.')
      setAiMode(false)
    } finally {
      setLoading(false)
    }
  }

  const resetAi = () => {
    setAiMode(false)
    setAiResults(null)
  }

  // Infinite scroll
  useEffect(() => {
    if (!bottomRef.current) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !loadingMore && !loading && skip + PAGE_SIZE < total && !aiMode) {
        setSkip(prev => {
          const next = prev + PAGE_SIZE
          load(search, filters, next, true)
          return next
        })
      }
    }, { threshold: 0.1 })
    observer.observe(bottomRef.current)
    return () => observer.disconnect()
  }, [loadingMore, loading, skip, total, search, filters, load, aiMode])

  const displayedIssues = aiMode ? (aiResults || []) : issues

  return (
    <div className="max-w-5xl mx-auto px-5 py-8 page-enter">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-700 text-white mb-1">Explore Issues</h1>
        <p className="text-sm text-white/40">
          {aiMode
            ? `AI matched ${aiResults?.length ?? 0} issues for "${search}"`
            : `${total.toLocaleString()} open issues`}
        </p>
      </div>

      {/* Search + AI */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <SearchBar value={search} onChange={val => { setSearch(val); resetAi() }} />
        </div>
        <button
          onClick={aiMode ? resetAi : handleAiSearch}
          disabled={!search.trim()}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all disabled:opacity-40 ${
            aiMode
              ? 'bg-brand-600/20 text-brand-300 border-brand-500/30 hover:bg-white/8'
              : 'bg-white/5 text-white/60 border-white/10 hover:border-brand-500/30 hover:text-brand-300'
          }`}
          title="AI Semantic Search"
        >
          <Sparkles size={14} />
          <span className="hidden sm:inline">{aiMode ? 'Reset AI' : 'AI Search'}</span>
        </button>
      </div>

      {/* Filters */}
      {!aiMode && (
        <div className="mb-6 overflow-x-auto pb-1">
          <FilterBar filters={filters} onChange={val => { setFilters(val); setSkip(0) }} />
        </div>
      )}

      {/* AI mode banner */}
      {aiMode && (
        <div className="flex items-center gap-2 px-3 py-2 mb-5 rounded-xl bg-brand-600/10 border border-brand-500/20 text-brand-300 text-xs">
          <Sparkles size={13} />
          Showing semantic AI results — meaning-based matching, not just keywords
          <button onClick={resetAi} className="ml-auto hover:text-white flex items-center gap-1">
            <RefreshCw size={11} /> Reset
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 mb-5 text-sm">
          {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(9).fill(0).map((_, i) => <IssueSkeleton key={i} />)}
        </div>
      ) : displayedIssues.length === 0 ? (
        <div className="card p-12 text-center">
          <SearchIcon size={32} className="mx-auto mb-3 text-white/20" />
          <p className="text-white/40 text-sm">No issues found — try different filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedIssues.map(issue => <IssueCard key={issue.id} issue={issue} />)}
          </div>
          <div ref={bottomRef} className="h-10 flex items-center justify-center mt-4">
            {loadingMore && (
              <div className="flex gap-1.5">
                {[0,1,2].map(i => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" style={{ animationDelay: `${i*150}ms` }} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
