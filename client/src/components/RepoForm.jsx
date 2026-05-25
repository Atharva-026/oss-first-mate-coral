import { useEffect, useState } from 'react'

export default function RepoForm({ repo, setRepo }) {
  const [owner, setOwner] = useState(repo.owner)
  const [repoName, setRepoName] = useState(repo.repo)

  useEffect(() => {
    setOwner(repo.owner)
    setRepoName(repo.repo)
  }, [repo])

  const handleSubmit = () => setRepo({ owner, repo: repoName })

  return (
    <div className="flex gap-2 items-center">
      <input
        value={owner}
        onChange={e => setOwner(e.target.value)}
        placeholder="owner"
        className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white w-32 focus:outline-none focus:border-blue-500"
      />
      <span className="text-gray-500">/</span>
      <input
        value={repoName}
        onChange={e => setRepoName(e.target.value)}
        placeholder="repo"
        className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white w-40 focus:outline-none focus:border-blue-500"
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded transition-colors"
      >
        Load
      </button>
    </div>
  )
}