import axios from 'axios'
const api = axios.create({
  baseURL: 'http://localhost:8000'
})

export async function importLibrary(steamId) {
  const response = await api.post(`/importlib/${steamId}`)  
  return response.data
}


export async function getLibrary(userID) {
  const response = await api.get(`/library/${userID}`) 
  return response.data 
}

export async function getReccomendation(userID){
  const response = await api.get(`/recommendations/${userID}`)
  return response.data
}

export async function updateGameStatus(userID, appID, status) {
  const response = await api.put(`/library/${userID}/${appID}/status`, {status})
  return response.data
}

export async function getLibraryGenres(userID) {
  const response = await api.get(`/library/${userID}/genres`)
  return response.data
}