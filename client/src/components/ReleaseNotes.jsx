import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { getReleaseNotes } from '../api'

export default function ReleaseNotes({ owner, repo, onSql }) {
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)

  const run = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await getReleaseNotes(owner, repo)
      setNotes(data.notes)
      onSql(data.sqlQuery)
    } catch (e) {
      setError(e.response?.data?.error || e.message)
    } finally {
      setLoading(false)
    }
  }

  const copy = () => {
    navigator.clipboard.writeText(notes)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-medium">Release notes</h2>
          <p className="text-sm text-gray-400">Draft changelog from merged pull requests</p>
        </div>
        <div className="flex gap-2">
          {notes && (
            <button
              onClick={copy}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
          <button
            onClick={run}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm transition-colors"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      {error && <div className="bg-red-900/50 border border-red-700 rounded p-3 text-red-300 text-sm mb-4">{error}</div>}

      {!notes && !loading && (
        <div className="text-center text-gray-500 py-20">Click "Generate" to draft release notes</div>
      )}

      {notes && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{notes}</ReactMarkdown>
        </div>
      )}
    </div>
  )
}