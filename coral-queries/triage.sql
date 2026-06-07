-- Fetch open issues for AI triage and classification
SELECT number, title, body, labels, created_at, state
FROM github.issues
WHERE owner = 'expressjs'
  AND repo = 'express'
  AND state = 'open'
ORDER BY created_at DESC
LIMIT 10;