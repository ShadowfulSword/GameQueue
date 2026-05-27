import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getLibrary, updateGameStatus, getLibraryGenres } from '../api/index.js'
import styles from './Library.module.css'



//Main library page to show the full library and allow filtering opptions
export default function Library() {
  const [games, setGames] = useState([])
  const [failedImages, setFailedImages] = useState({})
  const [search, setSearch] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [genres, setGenres] = useState([])
  const [activeStatuses, setActiveStatuses] = useState([])
  const [activeGenres, setActiveGenres] = useState([])
  const [hltbRange, setHltbRange] = useState([0, 0])
  const filterRef = useRef(null) //ref to the filter button's dropdown -- when we click outside -> close it
  const sliderRef = useRef(null) //ref to the slider to keep track of how far its been dragged
  const dragging = useRef(null) //tracks which side (min or max) is being altered
  const navigate = useNavigate()
  const location = useLocation()
  const userId = location.state?.user_id ?? 1

  //Find the highest HLTB time for any game in the library and set the right side of the slider
  const HLTB_MAX = Math.ceil(
    Math.max(0, ...games.map(g => g.hltb_playtime ? g.hltb_playtime / 60 : 0))
  ) || 200

  //Get the genres and the library and organize it alphabetically
  useEffect(() => {
    getLibrary(userId).then(data =>
      setGames([...data].sort((a, b) => a.title.localeCompare(b.title)))
    )
    getLibraryGenres(userId).then(setGenres)
  }, [])

  //once you have all the games pulled -- set the slider
  useEffect(() => {
    if (games.length > 0) {
      const max = Math.ceil(Math.max(...games.map(g => g.hltb_playtime ? g.hltb_playtime / 60 : 0))) || 200
      setHltbRange([0, max])
    }
  }, [games])

  //Close the filter if you click outside of the filter drop dwon section
  useEffect(() => {
    function handleClick(e) {
      if (filterRef.current && !filterRef.current.contains(e.target))
        setShowFilter(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  //Dragging the HLTB range slider
  //Get the distance from mouse to the slider side and let the user only drag that
  function handleSliderMouseDown(e) {
    const rect = sliderRef.current.getBoundingClientRect()
    //get tthe mouse position and within a 0-1% range in the slider track
    const pct = (e.clientX - rect.left) / rect.width
    const val = Math.round(pct * HLTB_MAX)
    //calculate whichever is closer left or righ 
    const distToMin = Math.abs(val - hltbRange[0])
    const distToMax = Math.abs(val - hltbRange[1])
    //snap to the closer side
    dragging.current = distToMin <= distToMax ? 'min' : 'max'

    function onMove(e) {
      //hold the pct in the range so you dont get outside the slider stack
      const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
      const val = Math.round(pct * HLTB_MAX)
      setHltbRange(prev => {
        //let the min or max be withing 1 distance for eachother as to not allow direct overlap
        if (dragging.current === 'min') return [Math.min(val, prev[1] - 1), prev[1]]
        return [prev[0], Math.max(val, prev[0] + 1)]
      })
    }

    //clean up the mouse event listening when the user lets go 
    function onUp() {
      dragging.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }
  //add status to the top if active remove said chip if not
  function toggleStatus(s) {
    setActiveStatuses(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  //add genere filters at the top if active remove said chip if not
  function toggleGenre(g) {
    setActiveGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  }

  //reset filters
  function clearFilters() {
    setActiveStatuses([])
    setActiveGenres([])
    setHltbRange([0, HLTB_MAX])
  }

  //show number of active filters and have range of hltb times as 1 chip
  const activeCount = activeStatuses.length + activeGenres.length + (hltbRange[0] > 0 || hltbRange[1] < HLTB_MAX ? 1 : 0)

  //allow multiple filters to be set ad shown at once making use of every()
  const visibleGames = games
    .filter(g => !search || g.title.toLowerCase().includes(search.toLowerCase()))
    .filter(g => activeStatuses.length === 0 || activeStatuses.includes(g.status))
    .filter(g => activeGenres.length === 0 || activeGenres.every(genre => g.genres.includes(genre)))
    .filter(g => {
      const hours = g.hltb_playtime ? g.hltb_playtime / 60 : null
      if (hours === null) return hltbRange[0] === 0
      return hours >= hltbRange[0] && hours <= hltbRange[1]
    })

  //update the status in the DB when the user changes button from one status
  async function handleStatus(appid, status) {
    try {
      await updateGameStatus(userId, appid, status)
      setGames(prev => {
        const updated = prev.map(game =>
          game.appid === appid ? { ...game, status } : game
        )
        return [...updated].sort((a, b) => a.title.localeCompare(b.title))
      })
    } catch (e) {
      console.error('Failed to update status', e)
    }
  }

  //return the style for the button (highlighting) according to the current status
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
        <div className={styles.navLogo} onClick={() => navigate('/library', { state: { user_id: userId } })}>
          <img src="/GameQueueLogo.png" alt="GameQueue" />
        </div>
        {/*Render the nav bar at the top and link to the right routes*/}
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

      <div className={styles.toolbar}>
        <input
          className={styles.search}
          placeholder="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {/*Attach the ref for clicking outside the filter*/}
        <div className={styles.filterWrap} ref={filterRef}>
          <button
            className={`${styles.filterBtn} ${showFilter || activeCount > 0 ? styles.filterBtnActive : ''}`}
            onClick={() => setShowFilter(v => !v)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            {/*Get the count so you know when a filter is active and needs to be shown as a chip*/}
            {activeCount > 0 && <span className={styles.filterBadge}>{activeCount}</span>}
          </button>

          {showFilter && (
            <div className={styles.filterDropdown}>
              <div className={styles.filterSection}>
                <span className={styles.filterSectionLabel}>Status</span>
                {['backlog', 'playing', 'completed'].map(s => (
                  <label key={s} className={styles.filterOption}>
                    <input
                      type="checkbox"
                      checked={activeStatuses.includes(s)}
                      onChange={() => toggleStatus(s)}
                    />
                    <span>{s}</span>
                  </label>
                ))}
              </div>

              <div className={styles.filterDivider} />

              <div className={styles.filterSection}>
                <span className={styles.filterSectionLabel}>Genre</span>
                <div className={styles.genreList}>
                  {genres.map(g => (
                    <label key={g.genre_id} className={styles.filterOption}>
                      <input
                        type="checkbox"
                        checked={activeGenres.includes(g.genre_name)}
                        onChange={() => toggleGenre(g.genre_name)}
                      />
                      <span>{g.genre_name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.filterDivider} />
              <div className={styles.filterSection}>
                <span className={styles.filterSectionLabel}>HLTB Hours</span>
                {/*Show the range make sure you leave upper bound active with + at the end*/}
                <div className={styles.rangeDisplay}>
                  {hltbRange[0]}h — {hltbRange[1] >= HLTB_MAX ? `${HLTB_MAX}h+` : `${hltbRange[1]}h`}
                </div>
                {/*Handle and link the slider to the ref defined earlier set sliderRef to be able to track the mouse distance*/}
                <div
                  className={styles.sliderWrap}
                  ref={sliderRef}
                  onMouseDown={handleSliderMouseDown}
                >
                  <div className={styles.sliderBg} />
                  {/*Set the color between the two distances min and max using percentages to determine how fille it is*/}
                  <div
                    className={styles.sliderTrack}
                    style={{
                      left: `${(hltbRange[0] / HLTB_MAX) * 100}%`,
                      right: `${100 - (hltbRange[1] / HLTB_MAX) * 100}%`
                    }}
                  />
                  <div
                    className={styles.sliderThumb}
                    style={{ left: `${(hltbRange[0] / HLTB_MAX) * 100}%` }}
                  />
                  <div
                    className={styles.sliderThumb}
                    style={{ left: `${(hltbRange[1] / HLTB_MAX) * 100}%` }}
                  />
                </div>
              </div>

              {/*Shwo the active filters as chips at teh top, attach a close button to dismiss filters*/}
              {activeCount > 0 && (
                <>
                  <div className={styles.filterDivider} />
                  <button className={styles.clearBtn} onClick={clearFilters}>
                    Clear all
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {activeCount > 0 && (
          <div className={styles.chips}>
            {activeStatuses.map(s => (
              <span key={s} className={styles.chip} onClick={() => toggleStatus(s)}>
                {s} ×
              </span>
            ))}
            {activeGenres.map(g => (
              <span key={g} className={styles.chip} onClick={() => toggleGenre(g)}>
                {g} ×
              </span>
            ))}
            {(hltbRange[0] > 0 || hltbRange[1] < HLTB_MAX) && (
              <span className={styles.chip} onClick={() => setHltbRange([0, HLTB_MAX])}>
                HLTB {hltbRange[0]}h–{hltbRange[1] >= HLTB_MAX ? `${HLTB_MAX}h+` : `${hltbRange[1]}h`} ×
              </span>
            )}
          </div>
        )}
      </div>
      
      {/*Check the output of the filters and inform the user accordingly for what their filters reurn */}
      {visibleGames.length === 0 && (
        <div className={styles.emptyWrapper}>
          <div className={styles.emptyState}>
            {activeStatuses.length === 1
              ? `You currently have no ${activeStatuses[0]} games`
              : activeGenres.length > 0
                ? `No games match the selected filters`
                : `Your library is empty`
            }
          </div>
        </div>
      )}

      <div className={styles.grid}>
        {visibleGames.map(game => (
          <div className={styles.card} key={game.appid}>
            {/*Make a call to the cdn link i found with portraits of the games for game cards. fall back to the steam provided one if none */}
            <img
              className={styles.cover}
              src={
                failedImages[game.appid]
                  ? `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`
                  : `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/library_600x900.jpg`
              }
              alt={game.title}
              onError={(e) => {
                e.target.onerror = null
                setFailedImages(prev => ({ ...prev, [game.appid]: true }))  //dont search for too long
              }}
            />
            <div className={styles.info}>
              <div className={styles.top}>
                <h2 className={styles.gameTitle}>{game.title}</h2>
                <div className={styles.meta}>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Playtime</span>
                    {/*Display the hours (passesd as mins from backend which converts it from secs from the CSV) */}
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
                {/*Buttons to update the filters for the game status*/}
                <button
                  className={getStatusClass(game.status, 'backlog')}
                  onClick={() => handleStatus(game.appid, 'backlog')}
                >Backlog</button>
                <button
                  className={getStatusClass(game.status, 'playing')}
                  onClick={() => handleStatus(game.appid, 'playing')}
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