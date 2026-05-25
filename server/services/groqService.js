const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const analyzeIssues = async (issues) => {
  const prompt = `You are an OSS maintainer assistant. Analyze these GitHub issues and for each one return:
- type: one of [bug, feature, question, docs, other]
- priority: one of [high, medium, low]
- summary: one sentence explaining the issue
- suggestedLabel: a short label string

Issues data:
${JSON.stringify(issues, null, 2)}

Respond with a JSON array only, no extra text. Each item must have: number, type, priority, summary, suggestedLabel.`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 2000,
  });

  const text = response.choices[0].message.content;
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};

const findDuplicates = async (issues) => {
  const prompt = `You are an OSS maintainer assistant. From this list of GitHub issues, identify pairs that are likely duplicates based on title and body similarity.

Issues:
${JSON.stringify(issues.map(i => ({ number: i.number, title: i.title, body: i.body?.slice(0, 200) })), null, 2)}

Respond with a JSON array only. Each item: { issue1: number, issue2: number, reason: string, confidence: "high"|"medium"|"low" }
If no duplicates found, return an empty array [].`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    max_tokens: 1000,
  });

  const text = response.choices[0].message.content;
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};

const generateReleaseNotes = async (prs) => {
  const prompt = `You are a technical writer. Generate clean, well-structured release notes from these merged pull requests.

PRs:
${JSON.stringify(prs.map(p => ({ number: p.number, title: p.title, body: p.body?.slice(0, 300), labels: p.labels })), null, 2)}

Format the release notes in markdown with sections: ## New Features, ## Bug Fixes, ## Other Changes.
Only include sections that have items. Be concise. Start directly with the markdown, no preamble.`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
    max_tokens: 1500,
  });

  return response.choices[0].message.content;
};

module.exports = { analyzeIssues, findDuplicates, generateReleaseNotes };