import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
  withCredentials: true,
})

// ── Response interceptor — handle errors globally ─────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status
    const message = error.response?.data?.error || error.message

    // Session expired — reload to trigger login page
    if (status === 401) {
      window.location.reload()
      return Promise.reject(new Error('Session expired. Please log in again.'))
    }

    // API keys not configured — redirect to settings
    if (status === 403 && message.includes('API keys')) {
      window.dispatchEvent(new CustomEvent('oss:goto-settings'))
      return Promise.reject(new Error('API keys not configured. Redirecting to Settings...'))
    }

    // Rate limit hit
    if (status === 429) {
      return Promise.reject(new Error('Rate limit reached. You can make 10 requests per hour. Please wait and try again.'))
    }

    // Coral timeout
    if (error.code === 'ECONNABORTED' || message.includes('timed out')) {
      return Promise.reject(new Error('Coral query timed out (60s). The repo may be too large or GitHub is slow. Please try again.'))
    }

    // Network error (server down)
    if (!error.response) {
      return Promise.reject(new Error('Cannot reach the server. Make sure the backend is running on port 5000.'))
    }

    return Promise.reject(new Error(message || 'Something went wrong. Please try again.'))
  }
)

export const triageIssues   = (owner, repo) => api.post('/api/triage',        { owner, repo })
export const findDuplicates = (owner, repo) => api.post('/api/duplicates',     { owner, repo })
export const getReleaseNotes= (owner, repo) => api.post('/api/release-notes',  { owner, repo })
export const getHistory     = ()            => api.get('/api/history')
export const saveApiKeys    = (keys)        => api.put('/api/settings/keys',   keys)
export const getApiKeys     = ()            => api.get('/api/settings/keys')
export const getSlackLinks  = (owner, repo) => api.post('/api/slack/insights', { owner, repo })