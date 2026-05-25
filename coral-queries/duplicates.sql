-- Fetch open issues for duplicate detection
SELECT number, title, body, labels, created_at
FROM github.issues
WHERE owner = 'expressjs'
  AND repo = 'express'
  AND state = 'open'
ORDER BY created_at DESC
LIMIT 20;