const { spawn } = require('child_process');

const CORAL_PATH = 'D:\\coral.exe';

const runQuery = (sql) => {
  return new Promise((resolve, reject) => {
    const child = spawn(CORAL_PATH, ['sql', '--format', 'json', sql], {
      timeout: 120000,
      env: { ...process.env },
      windowsHide: true
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', d => { stdout += d.toString(); });
    child.stderr.on('data', d => { stderr += d.toString(); });

    child.on('close', (code) => {
      if (code !== 0 && code !== null) {
        reject(new Error(stderr || `Coral exited with code ${code}`));
        return;
      }
      if (!stdout) {
        reject(new Error(stderr || 'No output from Coral'));
        return;
      }
      try {
        const result = JSON.parse(stdout);
        resolve(Array.isArray(result) ? result : [result]);
      } catch (e) {
        resolve([]);
      }
    });

    child.on('error', err => reject(new Error(err.message)));
  });
};

module.exports = { runQuery };