import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getLibrary, updateGameStatus } from '../api/index.js'
import styles from './Library.module.css'

export default function Library() {
  const [games, setGames] = useState([])
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    getLibrary(1).then(data => setGames(data))
  }, [])

  function handleStatus(appid, status) {
    updateGameStatus(1, appid, status)
    setGames(games.map(game =>
      game.appid === appid ? { ...game, status } : game
    ))
  }

  function getStatusClass(gameStatus, button) {
    if (gameStatus !== button) return ''
    if (button === 'backlog') return styles.activeBacklog
    if (button === 'playing') return styles.activePlaying
    if (button === 'completed') return styles.activeCompleted
  }

  const tabs = [
    { label: 'Library', path: '/library' },
    { label: 'Queue', path: '/queue' },
    { label: 'Profile', path: '/profile' },
  ]

  return (
    <div className={styles.pageWrapper}>
      <nav className={styles.navbar}>
        <div className={styles.navLogo} onClick={() => navigate('/library')}>
          <img src="/GameQueueLogo.png" alt="GameQueue" />
        </div>

        {tabs.map(tab => (
          <div
            key={tab.path}
            className={`${styles.navTab} ${location.pathname === tab.path ? styles.navTabActive : ''}`}
            onClick={() => navigate(tab.path)}
          >
            {tab.label}
          </div>
        ))}
      </nav>

      <div className={styles.grid}>
        {games.map(game => (
          <div className={styles.card} key={game.appid}>
            <img
              className={styles.cover}
              src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/library_600x900.jpg`}
              alt={game.title}
              onError={(e) => {
                e.target.src = `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`
              }}
            />
            <div className={styles.info}>
              <div className={styles.top}>
                <h2 className={styles.gameTitle}>{game.title}</h2>
                <div className={styles.meta}>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Playtime</span>
                    <span className={styles.statValue}>{Math.round(game.playtime_mins / 60)} hrs</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>HLTB</span>
                    <span className={`${styles.statValue} ${styles.highlight}`}>
                      {game.hltb_playtime ? `${Math.round(game.hltb_playtime / 60)} hrs` : 'N/A'}
                    </span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Status</span>
                    <span className={styles.statValue}>{game.status}</span>
                  </div>
                </div>
              </div>
              <div className={styles.statusButtons}>
                <button
                  className={getStatusClass(game.status, 'backlog')}
                  onClick={() => handleStatus(game.appid, 'backlog')}
                >Backlog</button>
                <button
                  className={getStatusClass(game.status, 'playing')}
                  onClick={() => handleStatus(game.appic, 'playing')}
                >Playing</button>
                <button
                  className={getStatusClass(game.status, 'completed')}
                  onClick={() => handleStatus(game.appid, 'completed')}
                >Completed</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}