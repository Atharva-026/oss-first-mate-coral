import axios from 'axios'

const api = axios.create({ timeout: 180000 })

export const triageIssues = (owner, repo) =>
  api.post('/api/triage', { owner, repo })

export const findDuplicates = (owner, repo) =>
  api.post('/api/duplicates', { owner, repo })

export const getReleaseNotes = (owner, repo) =>
  api.post('/api/release-notes', { owner, repo })