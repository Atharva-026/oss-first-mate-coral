export default function SqlLog({ queries }) {
  if (queries.length === 0) {
    return <div className="text-center text-gray-500 py-20">SQL queries will appear here as you run each feature</div>
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-medium">SQL log</h2>
        <p className="text-sm text-gray-400">Every query Coral ran against GitHub — no glue code</p>
      </div>
      <div className="grid gap-3">
        {queries.map((q, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-green-400 font-mono">Query #{i + 1}</span>
            </div>
            <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">{q}</pre>
          </div>
        ))}
      </div>
    </div>
  )
}