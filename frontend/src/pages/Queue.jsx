import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getReccomendation, updateGameStatus } from '../api/index.js'
import styles from './Queue.module.css'

// Written by: Alec
// Tested by: Ali
// Debugged by: Ayush
// Commented and Refactored by: Jake 

//Queue page that shows the top 5 recommened games
export default function Queue() {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const userId = location.state?.user_id ?? 1

  //fetch reccomendations and stop loading on success or fail on setup
  useEffect(() => {
    getReccomendation(userId)
      .then(data => {
        setRecommendations(data.recommendations)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const tabs = [
    { label: 'Library', path: '/library' },
    { label: 'Queue', path: '/queue' },
    { label: 'Profile', path: '/profile' },
  ]

  return (
    <div className={styles.pageWrapper}>
      <nav className={styles.navbar}>
        <div className={styles.navLogo} onClick={() => navigate('/library', { state: { user_id: userId } })}>
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
        {loading && (
          <div className={styles.emptyWrapper}>
            <div className={styles.emptyState}>Loading recommendations...</div>
          </div>
        )}

        {!loading && recommendations.length === 0 && (
          <div className={styles.emptyWrapper}>
            <div className={styles.emptyState}>
              No recommendations yet — mark some games as playing or completed in your library first.
            </div>
          </div>
        )}

        {!loading && recommendations.map((game, i) => (
          <div className={styles.card} key={game.appid}>
            <div className={styles.rank}>#{i + 1}</div>
            <img
              className={styles.cover}
              src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/library_600x900.jpg`}
              alt={game.title}
              onError={e => {
                e.target.onerror = null
                e.target.src = `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`
              }}
            />
            <div className={styles.info}>
              <div className={styles.top}>
                <h2 className={styles.gameTitle}>{game.title}</h2>
                <div className={styles.meta}>
                  {game.developer && (
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Developer</span>
                      <span className={styles.metaValue}>{game.developer}</span>
                    </div>
                  )}
                  {game.publisher && (
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Publisher</span>
                      <span className={styles.metaValue}>{game.publisher}</span>
                    </div>
                  )}
                  {game.hltb_playtime && (
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>HLTB</span>
                      <span className={`${styles.metaValue} ${styles.highlight}`}>
                        {Math.round(game.hltb_playtime / 60)} hrs
                      </span>
                    </div>
                  )}
                </div>
                {game.summary && (
                  <p className={styles.summary}>{game.summary}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}