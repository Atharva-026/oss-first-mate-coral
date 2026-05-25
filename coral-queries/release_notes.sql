-- Fetch closed PRs to generate release notes
SELECT number, title, body, merged_at, labels
FROM github.pulls
WHERE owner = 'expressjs'
  AND repo = 'express'
  AND state = 'closed'
ORDER BY number DESC
LIMIT 10;