import axios from 'axios'

const baseURL = (import.meta.env.VITE_API_URL || 'http://localhost:5050').replace(/\/$/, '')

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

const TOKEN_KEY = 'backendJwt'
const TOKEN_WALLET_KEY = 'backendJwtWallet'

export function getStoredJwt() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function setStoredJwt(token, walletAddress) {
  localStorage.setItem(TOKEN_KEY, token)
  if (walletAddress) localStorage.setItem(TOKEN_WALLET_KEY, walletAddress.toLowerCase())
}

export function clearStoredJwt() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_WALLET_KEY)
}

api.interceptors.request.use((config) => {
  const token = getStoredJwt()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export async function postSession({ walletAddress, chainId }) {
  const res = await api.post('/api/public/session', { walletAddress, chainId })
  return res.data
}

export async function postEvent({ walletAddress, eventType, metadata }) {
  const res = await api.post('/api/public/event', { walletAddress, eventType, metadata })
  return res.data
}

export async function getNonce() {
  const { data } = await api.get('/api/auth/nonce')
  return data
}

export async function postLogin(payload) {
  const { data } = await api.post('/api/auth/login', payload)
  return data
}
