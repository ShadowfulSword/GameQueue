import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getLibraryGenres, savePreferences } from '../api/index.js'
import styles from './Profile.module.css'

export default function Profile() {
  const [genres, setGenres] = useState([])
  const [selectedGenres, setSelectedGenres] = useState([])
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const userId = location.state?.user_id ?? 1

  useEffect(() => {
    getLibraryGenres(userId).then(data => {
      setGenres(data)
      setSelectedGenres(data.map(g => g.genre_id)) // preselect existing
    })
  }, [])

  function toggleGenre(id) {
    setSelectedGenres(prev =>
      prev.includes(id)
        ? prev.filter(g => g !== id)
        : [...prev, id]
    )
  }

  async function handleSave() {
    setLoading(true)
    try {
      await savePreferences(userId, selectedGenres)
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
            className={`${styles.navTab} ${
              location.pathname === tab.path ? styles.navTabActive : ''
            }`}
            onClick={() => navigate(tab.path, { state: { user_id: userId } })}
          >
            {tab.label}
          </div>
        ))}
      </nav>

      <div className={styles.content}>
        <div className={styles.card}>
          <h2 className={styles.title}>Your Genre Preferences</h2>

          <div className={styles.genreGrid}>
            {genres.map(g => (
              <button
                key={g.genre_id}
                className={`${styles.genreBtn} ${
                  selectedGenres.includes(g.genre_id)
                    ? styles.genreBtnActive
                    : ''
                }`}
                onClick={() => toggleGenre(g.genre_id)}
              >
                {g.genre_name}
              </button>
            ))}
          </div>

          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  )
}