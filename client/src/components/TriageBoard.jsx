import { useState } from 'react'
import { triageIssues } from '../api'

const priorityColor = {
  high: 'bg-red-900 text-red-300',
  medium: 'bg-yellow-900 text-yellow-300',
  low: 'bg-green-900 text-green-300',
}

const typeColor = {
  bug: 'bg-red-800 text-red-200',
  feature: 'bg-blue-800 text-blue-200',
  docs: 'bg-purple-800 text-purple-200',
  question: 'bg-orange-800 text-orange-200',
  other: 'bg-gray-700 text-gray-300',
}

export default function TriageBoard({ owner, repo, onSql }) {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const run = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await triageIssues(owner, repo)
      setIssues(data.issues)
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
          <h2 className="text-lg font-medium">Issue triage</h2>
          <p className="text-sm text-gray-400">Classify and prioritize open issues using AI</p>
        </div>
        <button
          onClick={run}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm transition-colors"
        >
          {loading ? 'Analyzing...' : 'Run triage'}
        </button>
      </div>

      {error && <div className="bg-red-900/50 border border-red-700 rounded p-3 text-red-300 text-sm mb-4">{error}</div>}

      {issues.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-20">Click "Run triage" to analyze open issues</div>
      )}

      <div className="grid gap-3">
        {issues.map(issue => (
          <div key={issue.number} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-500 text-xs">#{issue.number}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${typeColor[issue.type] || typeColor.other}`}>
                    {issue.type}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColor[issue.priority]}`}>
                    {issue.priority}
                  </span>
                </div>
                <p className="text-sm text-white">{issue.summary}</p>
                <span className="text-xs text-gray-500 mt-1 inline-block">→ {issue.suggestedLabel}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}