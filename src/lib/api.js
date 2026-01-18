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

export function decodeJwtPayload(token) {
  try {
    const parts = String(token || '').split('.')
    if (parts.length < 2) return null
    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const json = atob(padded)
    return JSON.parse(json)
  } catch {
    return null
  }
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

export async function postAdminLogin({ email, password }) {
  const { data } = await api.post('/api/auth/admin/login', { email, password })
  return data
}

export async function getAdminWallets() {
  const { data } = await api.get('/api/admin/wallets')
  return data
}
