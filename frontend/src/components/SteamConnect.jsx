import { motion } from 'framer-motion'

export default function SteamConnect({
  steamId,
  onSteamIdChange,
  onSync,
  onResume,
  loading,
  error,
}) {
  return (
    <motion.section
      className="panel steam-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="eyebrow">Steam</p>
      <h2 className="panel-title">Connect your library</h2>
      <p className="panel-desc">
        Paste your 17-digit Steam ID (profile URL or Steam settings). Games must be
        public for sync to succeed.
      </p>
      <label className="sr-only" htmlFor="steam-id">
        Steam ID
      </label>
      <input
        id="steam-id"
        className="input"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="76561198…"
        value={steamId}
        onChange={(e) => onSteamIdChange(e.target.value)}
      />
      <div className="steam-actions">
        <button
          type="button"
          className="btn btn-primary"
          disabled={loading || !steamId.trim()}
          onClick={onSync}
        >
          {loading ? 'Syncing…' : 'Sync library'}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={loading || !steamId.trim()}
          onClick={onResume}
        >
          Continue without sync
        </button>
      </div>
      {error ? (
        <motion.p
          className="error-msg"
          role="alert"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.p>
      ) : null}
    </motion.section>
  )
}
