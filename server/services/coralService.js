const { spawn } = require('child_process');

const CORAL_PATH = process.env.CORAL_PATH || 'coral';

// `githubToken` (optional) is injected only into THIS child process's env.
// This avoids mutating the shared process.env.GITHUB_TOKEN, which would race
// across concurrent requests and leak one user's token into another's query.
const runQuery = (sql, githubToken) => {
  return new Promise((resolve, reject) => {
    const childEnv = githubToken
      ? { ...process.env, GITHUB_TOKEN: githubToken }
      : process.env;

    const child = spawn(CORAL_PATH, ['sql', '--format', 'json', sql], {
      cwd: process.cwd(),
      env: childEnv,
    });

    let stdout = '';
    let stderr = '';
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        child.kill();
        reject(new Error('Coral query timed out after 60s'));
      }
    }, 60000);

    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', (d) => { stderr += d.toString(); });

    child.on('close', (code) => {
      clearTimeout(timer);
      if (settled) return;
      settled = true;

      console.log('Coral closed with code:', code);
      console.log('stdout length:', stdout.length);
      console.log('stderr:', stderr.slice(0, 200));

      if (!stdout.trim()) {
        reject(new Error(stderr || 'No output from Coral'));
        return;
      }
      try {
        const parsed = JSON.parse(stdout);
        resolve(Array.isArray(parsed) ? parsed : [parsed]);
      } catch (e) {
        resolve([]);
      }
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      if (!settled) {
        settled = true;
        reject(new Error(err.message));
      }
    });
  });
};

module.exports = { runQuery };