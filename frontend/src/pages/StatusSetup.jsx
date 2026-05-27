import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getLibrary, saveStatuses } from '../api/index.js'
import styles from './StatusSetup.module.css'



//Second onboarding page let the user drag their games into proper buckets
//The sstatuses are setup on this page and fed into prefrences in the DB
export default function StatusSetup() {
  const [columns, setColumns] = useState({
    backlog: [],
    playing: [],
    completed: []
  })
  const [draggedGame, setDraggedGame] = useState(null)  //select the game being dragged
  const [draggedFrom, setDraggedFrom] = useState(null)  //which col the drag started from so you know what the initail state is
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const userId = location.state?.user_id

  //Grab the whole library 
  //Sort by playtime in decending order
  useEffect(() => {
    if (!userId) return

    getLibrary(userId).then(data => {
      const sorted = [...data].sort((a, b) => {
        return (b.playtime_mins || 0) - (a.playtime_mins || 0)
      })
      //set all games to backlog and leave playing and completed empty 
      setColumns({
        backlog: sorted,
        playing: [],
        completed: []
      })
    })
  }, [userId])

  //Record which game is being dragged and where its from
  function handleDragStart(game, fromColumn) {
    setDraggedGame(game)
    setDraggedFrom(fromColumn)
  }

  //Move the dragged game from source to destination
  function handleDrop(toColumn) {
    if (!draggedGame || toColumn === draggedFrom) return
    setColumns(prev => ({
      ...prev,
      //remove from original and append it to the dropped col
      [draggedFrom]: prev[draggedFrom].filter(g => g.appid !== draggedGame.appid),
      [toColumn]: [...prev[toColumn], draggedGame]
    }))
    setDraggedGame(null)
    setDraggedFrom(null)
  }

  //overwrite the browser's block
  function handleDragOver(e) {
    e.preventDefault()
  }

  //Flattenn the the cols into lists and save/update backend
  async function handleContinue() {
    setLoading(true)
    try {
      const statuses = {}
      //iterate through each col and map agme to their current status
      Object.entries(columns).forEach(([status, games]) => {
        games.forEach(game => {
          statuses[game.appid] = status
        })
      })
      //update DB and sent user to lib page
      await saveStatuses(userId, statuses)
      navigate('/library', { state: { user_id: userId } })
    } catch (e) {
      console.error('Failed to save statuses', e)
    } finally {
      setLoading(false)
    }
  }

  //create the config thatt drives the kanban render
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
            {/*Col headder and changes from the col configs above*/}
            <div className={`${styles.columnHeader} ${col.activeClass}`}>
              <span>{col.label}</span>
              <span className={styles.columnCount}>{columns[col.key].length}</span>
            </div>
            <div className={styles.columnBody}>
              {columns[col.key].map(game => (
                <div
                  key={game.appid}
                  //fade the card out while its being dragged so the user can visally see what they're affecting from the list
                  className={`${styles.card} ${draggedGame?.appid === game.appid ? styles.cardDragging : ''}`}
                  draggable
                  onDragStart={() => handleDragStart(game, col.key)}
                >
                  {/*Grab the image if we can leave it fully empty if we have nothing -- steam pic is clipped in this render*/}
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
                      {/*Shoiw HLTB time is we have it already in the DB*/}
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