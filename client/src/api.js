import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
  withCredentials: true,
})

export const triageIssues = (owner, repo) =>
  api.post('/api/triage', { owner, repo })

export const findDuplicates = (owner, repo) =>
  api.post('/api/duplicates', { owner, repo })

export const getReleaseNotes = (owner, repo) =>
  api.post('/api/release-notes', { owner, repo })