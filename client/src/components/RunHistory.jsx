import { useState, useEffect } from 'react'
import axios from 'axios'

const typeColor = {
  triage: 'bg-blue-900 text-blue-300',
  duplicates: 'bg-yellow-900 text-yellow-300',
  'release-notes': 'bg-purple-900 text-purple-300',
}

export default function RunHistory() {
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/history')
      .then(r => setRuns(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="grid gap-3">
      {Array(4).fill(0).map((_, i) => (
        <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-4 animate-pulse h-16"/>
      ))}
    </div>
  )

  if (runs.length === 0) return (
    <div className="text-center text-gray-500 py-20">No runs yet — use triage, duplicates or release notes to see history here</div>
  )

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-medium">Run history</h2>
        <p className="text-sm text-gray-400">All past agent runs stored in MongoDB</p>
      </div>
      <div className="grid gap-3">
        {runs.map(run => (
          <div key={run._id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${typeColor[run.type]}`}>{run.type}</span>
              <span className="text-sm text-white font-mono">{run.repo}</span>
              <span className="text-xs text-gray-500 ml-auto">{new Date(run.createdAt).toLocaleString()}</span>
              <span className="text-xs text-gray-400">{run.resultCount} results</span>
            </div>
            <pre className="text-xs text-gray-500 font-mono truncate">{run.sqlQuery}</pre>
          </div>
        ))}
      </div>
    </div>
  )
}