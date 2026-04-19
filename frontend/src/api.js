import axios from 'axios'

function apiUrl(path) {
  const root = import.meta.env.VITE_API_URL
  const base = root ? root.replace(/\/$/, '') : ''
  if (base) return `${base}${path}`
  return `/api${path}`
}

export function steamHeaderImage(appid) {
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`
}

export function steamStoreUrl(appid) {
  return `https://store.steampowered.com/app/${appid}`
}

export function formatPlaytime(minutes) {
  if (minutes == null || minutes === 0) return 'Not played'
  const h = Math.round(minutes / 60)
  if (h < 1) return `${minutes} min`
  return `${h} h`
}

export async function importLibrary(steamId) {
  const { data } = await axios.post(apiUrl(`/importlib/${encodeURIComponent(steamId)}`))
  return data
}

export async function fetchUserBySteam(steamId) {
  const { data } = await axios.get(apiUrl(`/user/by-steam/${encodeURIComponent(steamId)}`))
  return data
}

export async function fetchLibrary(userId) {
  const { data } = await axios.get(apiUrl(`/library/${userId}`))
  return data
}

export async function fetchRecommendations(userId) {
  const { data } = await axios.get(apiUrl(`/recommendations/${userId}`))
  return data
}

export async function updateGameStatus(userId, appId, status) {
  const { data } = await axios.put(
    apiUrl(`/library/${userId}/${appId}/status`),
    { status },
  )
  return data
}
