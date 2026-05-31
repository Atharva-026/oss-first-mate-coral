const { spawn } = require('child_process');

const CORAL_PATH = process.env.CORAL_PATH || 'coral';

const runQuery = (sql) => {
  return new Promise((resolve, reject) => {
    const child = spawn(CORAL_PATH, ['sql', '--format', 'json', sql], {
      cwd: process.cwd(),
      env: process.env,
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