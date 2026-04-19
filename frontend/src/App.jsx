import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import SteamConnect from './components/SteamConnect.jsx'
import GameCard from './components/GameCard.jsx'
import Recommendations from './components/Recommendations.jsx'
import {
  fetchLibrary,
  fetchRecommendations,
  fetchUserBySteam,
  importLibrary,
} from './api.js'

const LS_STEAM = 'gamequeue_steam_id'
const LS_USER = 'gamequeue_user_id'

function parseApiError(err) {
  const d = err.response?.data
  if (typeof d?.detail === 'string') return d.detail
  if (Array.isArray(d?.detail))
    return d.detail.map((x) => x.msg ?? JSON.stringify(x)).join(' ')
  return err.message || 'Something went wrong'
}

export default function App() {
  const [steamId, setSteamId] = useState(
    () => localStorage.getItem(LS_STEAM) ?? '',
  )
  const [userId, setUserId] = useState(() => {
    const raw = localStorage.getItem(LS_USER)
    return raw ? Number(raw) : null
  })
  const [library, setLibrary] = useState([])
  const [recIds, setRecIds] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadDashboard = useCallback(async (uid) => {
    setLoading(true)
    setError('')
    try {
      const [lib, rec] = await Promise.all([
        fetchLibrary(uid),
        fetchRecommendations(uid),
      ])
      setLibrary(Array.isArray(lib) ? lib : [])
      setRecIds(rec?.recommendations ?? [])
    } catch (e) {
      setError(parseApiError(e))
      setLibrary([])
      setRecIds([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (userId != null && !Number.isNaN(userId)) {
      loadDashboard(userId)
    }
  }, [userId, loadDashboard])

  const libraryByAppId = useMemo(() => {
    const m = new Map()
    for (const g of library) m.set(g.appid, g)
    return m
  }, [library])

  const filteredLibrary = useMemo(() => {
    if (filter === 'all') return library
    return library.filter((g) => g.status === filter)
  }, [library, filter])

  const sortedLibrary = useMemo(
    () =>
      [...filteredLibrary].sort((a, b) =>
        (a.title || '').localeCompare(b.title || '', undefined, {
          sensitivity: 'base',
        }),
      ),
    [filteredLibrary],
  )

  async function handleSync() {
    setLoading(true)
    setError('')
    try {
      const data = await importLibrary(steamId.trim())
      localStorage.setItem(LS_STEAM, steamId.trim())
      localStorage.setItem(LS_USER, String(data.user_id))
      setUserId(data.user_id)
    } catch (e) {
      setError(parseApiError(e))
    } finally {
      setLoading(false)
    }
  }

  async function handleResume() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchUserBySteam(steamId.trim())
      localStorage.setItem(LS_STEAM, steamId.trim())
      localStorage.setItem(LS_USER, String(data.user_id))
      setUserId(data.user_id)
    } catch (e) {
      setError(parseApiError(e))
    } finally {
      setLoading(false)
    }
  }

  function handleDisconnect() {
    localStorage.removeItem(LS_STEAM)
    localStorage.removeItem(LS_USER)
    setUserId(null)
    setLibrary([])
    setRecIds([])
    setSteamId('')
    setFilter('all')
    setError('')
  }

  function handleStatusUpdated(appid, status) {
    setLibrary((prev) =>
      prev.map((g) => (g.appid === appid ? { ...g, status } : g)),
    )
  }

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'backlog', label: 'Backlog' },
    { id: 'playing', label: 'Playing' },
    { id: 'completed', label: 'Done' },
  ]

  const showDashboard = userId != null && !Number.isNaN(userId)

  return (
    <div className="app">
      <header className="top-bar">
        <div className="brand">
          <span className="brand-mark" aria-hidden />
          <span className="brand-name">GameQueue</span>
        </div>
        {showDashboard ? (
          <div className="top-actions">
            <span className="steam-pill" title="Steam ID">
              {steamId || 'Connected'}
            </span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleDisconnect}>
              Sign out
            </button>
          </div>
        ) : null}
      </header>

      <main className="main">
        {!showDashboard ? (
          <div className="hero">
            <motion.div
              className="hero-copy"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="eyebrow hero-eyebrow">Backlog intelligence</p>
              <h1 className="hero-title">
                Play what fits
                <span className="hero-accent"> your taste.</span>
              </h1>
              <p className="hero-lead">
                Sync Steam, organize statuses, and surface the best next title from your
                backlog—minimal noise, maximum signal.
              </p>
            </motion.div>
            <SteamConnect
              steamId={steamId}
              onSteamIdChange={setSteamId}
              onSync={handleSync}
              onResume={handleResume}
              loading={loading}
              error={error}
            />
          </div>
        ) : (
          <motion.div
            className="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            {error ? (
              <div className="banner banner-error" role="alert">
                {error}
                <button type="button" className="banner-dismiss" onClick={() => setError('')}>
                  Dismiss
                </button>
              </div>
            ) : null}

            <Recommendations items={recIds} libraryByAppId={libraryByAppId} />

            <section className="panel library-panel">
              <div className="library-head">
                <div>
                  <p className="eyebrow">Library</p>
                  <h2 className="panel-title">Your games</h2>
                  <p className="panel-desc subtle">
                    {loading
                      ? 'Refreshing…'
                      : `${library.length} titles synced · filter by status`}
                  </p>
                </div>
                <div className="filters" role="tablist" aria-label="Filter by status">
                  {filters.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      role="tab"
                      aria-selected={filter === f.id}
                      className={`filter-chip${filter === f.id ? ' filter-chip--active' : ''}`}
                      onClick={() => setFilter(f.id)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {loading && library.length === 0 ? (
                <p className="empty subtle">Loading library…</p>
              ) : sortedLibrary.length === 0 ? (
                <p className="empty subtle">No games in this filter.</p>
              ) : (
                <div className="library-grid">
                  {sortedLibrary.map((game, index) => (
                    <GameCard
                      key={game.appid}
                      game={game}
                      userId={userId}
                      index={index}
                      onStatusUpdated={handleStatusUpdated}
                    />
                  ))}
                </div>
              )}
            </section>
          </motion.div>
        )}
      </main>

      <footer className="footer subtle">
        Stack: FastAPI · MySQL · Vite · Framer Motion · Steam Web API
      </footer>
    </div>
  )
}
