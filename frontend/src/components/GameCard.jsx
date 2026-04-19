import { motion } from 'framer-motion'
import {
  formatPlaytime,
  steamHeaderImage,
  steamStoreUrl,
  updateGameStatus,
} from '../api'

const STATUSES = ['backlog', 'playing', 'completed']

export default function GameCard({
  game,
  userId,
  index,
  onStatusUpdated,
}) {
  const { appid, title, playtime_mins, status } = game

  async function handleStatus(next) {
    if (next === status) return
    await updateGameStatus(userId, appid, next)
    onStatusUpdated(appid, next)
  }

  return (
    <motion.article
      className="game-card"
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.28,
        delay: Math.min(index * 0.03, 0.35),
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <a
        className="game-card-media"
        href={steamStoreUrl(appid)}
        target="_blank"
        rel="noreferrer"
      >
        <img
          src={steamHeaderImage(appid)}
          alt=""
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
            const p = e.currentTarget.parentElement
            if (p) p.classList.add('game-card-media--fallback')
          }}
        />
      </a>
      <div className="game-card-body">
        <div className="game-card-top">
          <h3 className="game-title">{title}</h3>
          <span className="game-meta">{formatPlaytime(playtime_mins)}</span>
        </div>
        <div className="status-row">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className={`status-pill${status === s ? ' status-pill--active' : ''}`}
              onClick={() => handleStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </motion.article>
  )
}
