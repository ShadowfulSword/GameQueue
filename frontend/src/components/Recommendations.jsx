import { motion } from 'framer-motion'
import { steamHeaderImage, steamStoreUrl } from '../api'

export default function Recommendations({ items, libraryByAppId }) {
  if (!items?.length) return null

  return (
    <motion.section
      className="panel recs-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.08 }}
    >
      <div className="recs-head">
        <p className="eyebrow">Queue</p>
        <h2 className="panel-title">Recommended next</h2>
        <p className="panel-desc">
          Ranked from your backlog using genres you actually play.
        </p>
      </div>
      <div className="recs-scroll">
        {items.map((appid, i) => {
          const meta = libraryByAppId.get(appid)
          const title = meta?.title ?? `App ${appid}`
          return (
            <motion.a
              key={appid}
              href={steamStoreUrl(appid)}
              target="_blank"
              rel="noreferrer"
              className="rec-card"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.25,
                delay: i * 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -3 }}
            >
              <div className="rec-card-img-wrap">
                <img src={steamHeaderImage(appid)} alt="" loading="lazy" />
              </div>
              <span className="rec-card-title">{title}</span>
            </motion.a>
          )
        })}
      </div>
    </motion.section>
  )
}
