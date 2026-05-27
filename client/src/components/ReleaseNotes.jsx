import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { getReleaseNotes } from '../api'

function SkeletonNotes() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 animate-pulse space-y-3">
      <div className="h-5 bg-gray-700 rounded w-32"/>
      <div className="h-3 bg-gray-800 rounded w-full"/>
      <div className="h-3 bg-gray-800 rounded w-5/6"/>
      <div className="h-3 bg-gray-800 rounded w-4/6"/>
      <div className="h-5 bg-gray-700 rounded w-24 mt-4"/>
      <div className="h-3 bg-gray-800 rounded w-full"/>
      <div className="h-3 bg-gray-800 rounded w-3/4"/>
    </div>
  )
}

export default function ReleaseNotes({ owner, repo, onSql }) {
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (loading) {
      setElapsed(0)
      timerRef.current = setInterval(() => {
        setElapsed(e => e + 1)
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [loading])

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

  const exportMd = () => {
    const blob = new Blob([notes], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `release-notes-${owner}-${repo}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-medium">Release notes</h2>
          <p className="text-sm text-gray-400">Draft changelog from merged pull requests</p>
        </div>
        <div className="flex gap-2 items-center">
          {loading && (
            <span className="text-sm text-gray-400 font-mono">{elapsed}s</span>
          )}
          {notes && !loading && (
            <>
              <button onClick={exportMd} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors">
                Export .md
              </button>
              <button onClick={copy} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </>
          )}
          <button
            onClick={run}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm transition-colors"
          >
            {loading ? `Generating... ${elapsed}s` : 'Generate'}
          </button>
        </div>
      </div>

      {error && <div className="bg-red-900/50 border border-red-700 rounded p-3 text-red-300 text-sm mb-4">{error}</div>}

      {!notes && !loading && (
        <div className="text-center text-gray-500 py-20">Click "Generate" to draft release notes</div>
      )}

      {loading && <SkeletonNotes />}

      {notes && !loading && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{notes}</ReactMarkdown>
        </div>
      )}
    </div>
  )
}