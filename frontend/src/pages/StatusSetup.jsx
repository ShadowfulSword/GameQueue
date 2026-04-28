import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getLibrary, saveStatuses } from '../api/index.js'
import styles from './StatusSetup.module.css'

export default function StatusSetup() {
  const [columns, setColumns] = useState({
    backlog: [],
    playing: [],
    completed: []
  })
  const [draggedGame, setDraggedGame] = useState(null)
  const [draggedFrom, setDraggedFrom] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const userId = location.state?.user_id

  useEffect(() => {
    if (!userId) return

    getLibrary(userId).then(data => {
      const sorted = [...data].sort((a, b) => {
        return (b.playtime_mins || 0) - (a.playtime_mins || 0)
      })

      setColumns({
        backlog: sorted,
        playing: [],
        completed: []
      })
    })
  }, [userId])

  function handleDragStart(game, fromColumn) {
    setDraggedGame(game)
    setDraggedFrom(fromColumn)
  }

  function handleDrop(toColumn) {
    if (!draggedGame || toColumn === draggedFrom) return
    setColumns(prev => ({
      ...prev,
      [draggedFrom]: prev[draggedFrom].filter(g => g.appid !== draggedGame.appid),
      [toColumn]: [...prev[toColumn], draggedGame]
    }))
    setDraggedGame(null)
    setDraggedFrom(null)
  }

  function handleDragOver(e) {
    e.preventDefault()
  }

  async function handleContinue() {
    setLoading(true)
    try {
      const statuses = {}
      Object.entries(columns).forEach(([status, games]) => {
        games.forEach(game => {
          statuses[game.appid] = status
        })
      })
      await saveStatuses(userId, statuses)
      navigate('/library', { state: { user_id: userId } })
    } catch (e) {
      console.error('Failed to save statuses', e)
    } finally {
      setLoading(false)
    }
  }

  const columnConfig = [
    { key: 'backlog', label: 'Backlog', activeClass: styles.headerBacklog },
    { key: 'playing', label: 'Playing', activeClass: styles.headerPlaying },
    { key: 'completed', label: 'Completed', activeClass: styles.headerCompleted },
  ]

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <img src="/GameQueueLogo.png" className={styles.logo} alt="GameQueue" />
        <div className={styles.headerText}>
          <h1 className={styles.title}>Sort your games</h1>
          <p className={styles.subtitle}>
            Drag games into the right column — we'll use this to fine-tune your recommendations.
          </p>
        </div>
        <button
          className={styles.continueBtn}
          onClick={handleContinue}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Take me to my Queue'}
        </button>
      </div>

      <div className={styles.kanban}>
        {columnConfig.map(col => (
          <div
            key={col.key}
            className={styles.column}
            onDrop={() => handleDrop(col.key)}
            onDragOver={handleDragOver}
          >
            <div className={`${styles.columnHeader} ${col.activeClass}`}>
              <span>{col.label}</span>
              <span className={styles.columnCount}>{columns[col.key].length}</span>
            </div>
            <div className={styles.columnBody}>
              {columns[col.key].map(game => (
                <div
                  key={game.appid}
                  className={`${styles.card} ${draggedGame?.appid === game.appid ? styles.cardDragging : ''}`}
                  draggable
                  onDragStart={() => handleDragStart(game, col.key)}
                >
                  <img
                    className={styles.cover}
                    src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`}
                    alt={game.title}
                    onError={e => { e.target.onerror = null; e.target.style.display = 'none' }}
                  />
                  <div className={styles.cardInfo}>
                    <span className={styles.cardTitle}>{game.title}</span>
                    <div className={styles.cardMeta}>
                      {game.playtime_mins !== null && (
                        <span className={styles.cardPlaytime}>
                          playtime: {Math.round(game.playtime_mins / 60)} hrs
                        </span>
                      )}
                      {game.hltb_playtime && (
                        <span className={styles.cardHltb}>
                          hltb: {Math.round(game.hltb_playtime / 60)} hrs
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {columns[col.key].length === 0 && (
                <div className={styles.emptyCol}>Drop games here</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}