import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getLibraryGenres, savePreferences, getSavedPreferences } from '../api/index.js'
import styles from './Profile.module.css'

export default function Profile() {
  const [genres, setGenres] = useState([])
  const [selectedGenres, setSelectedGenres] = useState([])
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const userId = location.state?.user_id ?? 1

  useEffect(() => {
    Promise.all([
      getLibraryGenres(userId),
      getSavedPreferences(userId)
    ]).then(([allGenres, savedPrefs]) => {
      setGenres(allGenres)
      setSelectedGenres(savedPrefs)
    })
  }, [])

  function toggleGenre(id) {
    setSaved(false)
    setSelectedGenres(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    )
  }

  async function handleSave() {
    setLoading(true)
    try {
      await savePreferences(userId, selectedGenres)
      setSaved(true)
    } catch (e) {
      console.error('Failed to save preferences', e)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { label: 'Library', path: '/library' },
    { label: 'Queue', path: '/queue' },
    { label: 'Profile', path: '/profile' },
  ]

  return (
    <div className={styles.pageWrapper}>
      <nav className={styles.navbar}>
        <div
          className={styles.navLogo}
          onClick={() => navigate('/library', { state: { user_id: userId } })}
        >
          <img src="/GameQueueLogo.png" alt="GameQueue" />
        </div>
        {tabs.map(tab => (
          <div
            key={tab.path}
            className={`${styles.navTab} ${location.pathname === tab.path ? styles.navTabActive : ''}`}
            onClick={() => navigate(tab.path, { state: { user_id: userId } })}
          >
            {tab.label}
          </div>
        ))}
      </nav>

      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.title}>Genre Preferences</h2>
              <p className={styles.subtitle}>Select the genres you enjoy — this shapes your Queue recommendations.</p>
            </div>
            <button
              className={`${styles.saveBtn} ${saved ? styles.saveBtnSaved : ''}`}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Saving...' : saved ? 'Saved ✓' : 'Save Preferences'}
            </button>
          </div>

          <div className={styles.divider} />

          <div className={styles.sectionLabel}>Your Library Genres</div>
          <div className={styles.genreGrid}>
            {genres.map(g => (
              <button
                key={g.genre_id}
                className={`${styles.genreBtn} ${selectedGenres.includes(g.genre_id) ? styles.genreBtnActive : ''}`}
                onClick={() => toggleGenre(g.genre_id)}
              >
                {g.genre_name}
              </button>
            ))}
          </div>

          <div className={styles.footer}>
            <span className={styles.selectedCount}>
              {selectedGenres.length} genre{selectedGenres.length !== 1 ? 's' : ''} selected
            </span>
            <button
              className={styles.clearBtn}
              onClick={() => { setSelectedGenres([]); setSaved(false) }}
            >
              Clear all
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}