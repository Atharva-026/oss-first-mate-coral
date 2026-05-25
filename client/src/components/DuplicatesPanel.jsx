import { useState } from 'react'
import { findDuplicates } from '../api'

const confidenceColor = {
  high: 'bg-red-900 text-red-300',
  medium: 'bg-yellow-900 text-yellow-300',
  low: 'bg-gray-700 text-gray-300',
}

export default function DuplicatesPanel({ owner, repo, onSql }) {
  const [duplicates, setDuplicates] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const run = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await findDuplicates(owner, repo)
      setDuplicates(data.duplicates)
      onSql(data.sqlQuery)
    } catch (e) {
      setError(e.response?.data?.error || e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-medium">Duplicate detection</h2>
          <p className="text-sm text-gray-400">Find issues that are likely the same problem</p>
        </div>
        <button
          onClick={run}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm transition-colors"
        >
          {loading ? 'Scanning...' : 'Find duplicates'}
        </button>
      </div>

      {error && <div className="bg-red-900/50 border border-red-700 rounded p-3 text-red-300 text-sm mb-4">{error}</div>}

      {duplicates.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-20">Click "Find duplicates" to scan open issues</div>
      )}

      <div className="grid gap-3">
        {duplicates.map((d, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-blue-400 text-sm font-mono">#{d.issue1}</span>
              <span className="text-gray-500">↔</span>
              <span className="text-blue-400 text-sm font-mono">#{d.issue2}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ml-auto ${confidenceColor[d.confidence]}`}>
                {d.confidence} confidence
              </span>
            </div>
            <p className="text-sm text-gray-300">{d.reason}</p>
          </div>
        ))}
      </div>
    </div>
  )
}