import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getLibraryGenres, savePreferences, getSavedPreferences } from '../api/index.js'
import styles from './Profile.module.css'

// Written by: Ali
// Tested by: Ayush
// Debugged by: Jake
// Commented and Refactored by: Alec 

//Profile page where users can see and change prefrences
//Changes here directly affect the reccomendations and update the DB
export default function Profile() {
  const [genres, setGenres] = useState([])
  const [selectedGenres, setSelectedGenres] = useState([])
  const [saved, setSaved] = useState(false) //check for user saved prefrences and only update on yes
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const userId = location.state?.user_id ?? 1

  //grab all of the genres again and attach the prefrences
  //Promise.all runs requests in parallel
  useEffect(() => {
    Promise.all([
      getLibraryGenres(userId),
      getSavedPreferences(userId)
    ]).then(([allGenres, savedPrefs]) => {
      setGenres(allGenres)
      setSelectedGenres(savedPrefs) //pre-select the already seleced prefrences
    })
  }, [])

  //toggle the genre as in or out of selection
  function toggleGenre(id) {
    setSaved(false)
    setSelectedGenres(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    )
  }


  //save the current genre selection to the DB
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
        {/*Render the nav bar as before but highlight profile*/}
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

          {/*Render each togalble buttons and highligth when in/secleted*/}
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
            {/*set proper garammer to look profesional*/}
            <span className={styles.selectedCount}>
              {selectedGenres.length} genre{selectedGenres.length !== 1 ? 's' : ''} selected
            </span>
            {/*a clear all button that resets the saved  indicator*/}
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