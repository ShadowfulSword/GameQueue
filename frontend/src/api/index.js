// Written by: Alec
// Tested by: Jake
// Debugged by: Ayush

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

export async function savePreferences(userId, genreIds) {
  const response = await api.post(`/onboarding/${userId}/preferences`, { genre_ids: genreIds })
  return response.data
}

export async function saveStatuses(userId, statuses) {
  const response = await api.post(`/onboarding/${userId}/statuses`, { statuses })
  return response.data
}

export async function getSavedPreferences(userId) {
  const response = await api.get(`/onboarding/${userId}/preferences`)
  return response.data
}