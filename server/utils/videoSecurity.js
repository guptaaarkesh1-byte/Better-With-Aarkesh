import crypto from 'crypto';

const SECRET_KEY = process.env.VIDEO_TOKEN_SECRET || 'aarkesh_secure_vault_video_key_2026_x89f92ba4';

// Derive 32-byte key from secret using SHA-256
const getDerivedKey = (secret) => {
  return crypto.createHash('sha256').update(secret).digest();
};

/**
 * Encrypts a YouTube Video ID or payload object into a secure token
 * @param {string|object} data - YouTube ID or payload object
 * @returns {string} Encrypted token string prefixed with 'enc_'
 */
export const encryptVideoPayload = (data) => {
  try {
    if (!data) return '';
    const text = typeof data === 'string' ? data : JSON.stringify(data);
    const key = getDerivedKey(SECRET_KEY);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const checksum = crypto.createHmac('sha256', key).update(encrypted).digest('hex').substring(0, 12);
    return `enc_${iv.toString('hex')}_${encrypted}_${checksum}`;
  } catch (err) {
    console.error('Video encryption error:', err);
    return '';
  }
};

/**
 * Decrypts a secure video token back into the original ID or payload object
 * @param {string} token
 * @returns {string|object} Decrypted string or parsed object
 */
export const decryptVideoPayload = (token) => {
  try {
    if (!token || typeof token !== 'string') return '';
    if (!token.startsWith('enc_')) return token; // If not encrypted, return as-is
    
    const parts = token.slice(4).split('_');
    if (parts.length < 2) return '';
    
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedHex = parts[1];
    const key = getDerivedKey(SECRET_KEY);
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch (err) {
    console.error('Video decryption error:', err);
    return '';
  }
};

export default {
  encryptVideoPayload,
  decryptVideoPayload
};
