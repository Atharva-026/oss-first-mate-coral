const { execFile } = require('child_process');

const CORAL_PATH = 'D:\\coral.exe';

const runQuery = (sql) => {
  return new Promise((resolve, reject) => {
    console.log('CORAL_PATH:', CORAL_PATH);
    console.log('SQL:', sql);

    execFile(
      CORAL_PATH,
      ['sql', '--format', 'json', sql],
      { timeout:120000},
      (error, stdout, stderr) => {
        console.log('stdout:', stdout?.slice(0, 200));
        console.log('stderr:', stderr);
        if (error) {
          reject(new Error(stderr || error.message));
          return;
        }
        try {
          const result = JSON.parse(stdout);
          resolve(Array.isArray(result) ? result : [result]);
        } catch (e) {
          resolve([]);
        }
      }
    );
  });
};

module.exports = { runQuery };