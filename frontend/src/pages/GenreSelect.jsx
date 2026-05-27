import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getLibraryGenres, savePreferences } from '../api/index.js'
import styles from './GenreSelect.module.css'



//GenreSelect onboarding page
//Genres are pulled from the user library table 
export default function GenreSelect() {
  const [genres, setGenres] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const userId = location.state?.user_id

  //grab all of the genres from a specifc user's library
  useEffect(() => {
    getLibraryGenres(userId).then(setGenres)
  }, [])

  //on off function for the chip when clicked
  function toggleGenre(genre_id) {
    setSelected(prev =>
      prev.includes(genre_id) ? prev.filter(x => x !== genre_id) : [...prev, genre_id]
    )
  }

  //continue button call when clicked will move to the next onboarding page
  async function handleContinue() {
    setLoading(true)
    try {
      await savePreferences(userId, selected)
      navigate('/status-setup', { state: { user_id: userId } })
    } catch (e) {
      console.error('Failed to save preferences', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <img src="/GameQueueLogo.png" className={styles.logo} alt="GameQueue" />
        <h1 className={styles.title}>What do you like to play?</h1>
        <p className={styles.subtitle}>Select all genres that interest you — this helps us recommend games you'll actually want to play.</p>
        
        {/*Each genre is a togleable chip that gets highlited when clicked*/}
        <div className={styles.genreGrid}>
          {genres.map(g => (
            <button
              key={g.genre_id}
              className={`${styles.genreChip} ${selected.includes(g.genre_id) ? styles.genreChipActive : ''}`}
              onClick={() => toggleGenre(g.genre_id)}
            >
              {g.genre_name}
            </button>
          ))}
        </div>

        {/*Shows the count of genres selected and locks the user here till at least one has been chosen*/}
        <div className={styles.footer}>
          <span className={styles.selectedCount}>
            {selected.length > 0 ? `${selected.length} selected` : 'Select at least one genre'}
          </span>
          <button
            className={styles.continueBtn}
            onClick={handleContinue}
            disabled={selected.length === 0 || loading}
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}