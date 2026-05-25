import { useState } from 'react'
import RepoForm from './components/RepoForm'
import TriageBoard from './components/TriageBoard'
import DuplicatesPanel from './components/DuplicatesPanel'
import ReleaseNotes from './components/ReleaseNotes'
import SqlLog from './components/SqlLog'

export default function App() {
  const [repo, setRepo] = useState({ owner: 'expressjs', repo: 'express' })
  const [activeTab, setActiveTab] = useState('triage')
  const [sqlLog, setSqlLog] = useState([])

  const tabs = ['triage', 'duplicates', 'release-notes']

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">⚓ OSS First Mate</h1>
          <p className="text-sm text-gray-400">AI-powered OSS maintainer assistant</p>
        </div>
        <RepoForm repo={repo} setRepo={setRepo} />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 px-6 flex gap-1 pt-2">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm rounded-t capitalize transition-colors ${
              activeTab === tab
                ? 'bg-gray-800 text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
        <button
          onClick={() => setActiveTab('sql-log')}
          className={`px-4 py-2 text-sm rounded-t transition-colors ml-auto ${
            activeTab === 'sql-log'
              ? 'bg-gray-800 text-white border-b-2 border-green-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          SQL log
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'triage' && (
          <TriageBoard owner={repo.owner} repo={repo.repo} onSql={q => setSqlLog(l => [...l, q])} />
        )}
        {activeTab === 'duplicates' && (
          <DuplicatesPanel owner={repo.owner} repo={repo.repo} onSql={q => setSqlLog(l => [...l, q])} />
        )}
        {activeTab === 'release-notes' && (
          <ReleaseNotes owner={repo.owner} repo={repo.repo} onSql={q => setSqlLog(l => [...l, q])} />
        )}
        {activeTab === 'sql-log' && <SqlLog queries={sqlLog} />}
      </div>
    </div>
  )
}