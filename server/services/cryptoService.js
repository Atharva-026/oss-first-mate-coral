const crypto = require('crypto');

// Add ENCRYPTION_KEY to your .env — must be exactly 32 chars
const KEY = process.env.ENCRYPTION_KEY || 'oss-first-mate-default-key-32chr';
const IV_LENGTH = 16;

const encrypt = (text) => {
  if (!text) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(KEY.padEnd(32).slice(0, 32)),
    iv
  );
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const decrypt = (text) => {
  if (!text) return '';
  try {
    const [ivHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(KEY.padEnd(32).slice(0, 32)),
      iv
    );
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString();
  } catch {
    return '';
  }
};

module.exports = { encrypt, decrypt };