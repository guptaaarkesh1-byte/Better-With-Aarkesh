/**
 * Client-side Video Decryption Utility
 * Synchronously and asynchronously decrypts video tokens encrypted by the server
 */

const SECRET_KEY = 'aarkesh_secure_vault_video_key_2026_x89f92ba4';

// Helper: Convert hex string to Uint8Array
const hexToBytes = (hex) => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
};

// Simple synchronous AES-CBC decryptor in pure JavaScript
// Implements standard AES-128/256 decryption with PKCS#7 unpadding
class SimpleAES {
  static async deriveKey(secret) {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    // Alternatively SHA-256 hash of secret
    const hash = await window.crypto.subtle.digest('SHA-256', enc.encode(secret));
    return window.crypto.subtle.importKey(
      'raw',
      hash,
      { name: 'AES-CBC' },
      false,
      ['decrypt']
    );
  }

  static async decryptWebCrypto(encryptedHex, ivHex) {
    try {
      if (!window.crypto || !window.crypto.subtle) return null;
      const key = await SimpleAES.deriveKey(SECRET_KEY);
      const iv = hexToBytes(ivHex);
      const data = hexToBytes(encryptedHex);
      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-CBC', iv },
        key,
        data
      );
      const dec = new TextDecoder();
      return dec.decode(decrypted);
    } catch (e) {
      console.warn('WebCrypto decrypt fallback:', e);
      return null;
    }
  }
}

// Pure JS Fast AES Decryption implementation (for synchronous and instant rendering)
// Standard AES S-Box and multiplication tables
const sboxInv = [
  0x52, 0x09, 0x6a, 0xd5, 0x30, 0x36, 0xa5, 0x38, 0xbf, 0x40, 0xa3, 0x9e, 0x81, 0xf3, 0xd7, 0xfb,
  0x7c, 0xe3, 0x39, 0x82, 0x9b, 0x2f, 0xff, 0x87, 0x34, 0x8e, 0x43, 0x44, 0xc4, 0xde, 0xe9, 0xcb,
  0x54, 0x7b, 0x94, 0x32, 0xa6, 0xc2, 0x23, 0x3d, 0xee, 0x4c, 0x95, 0x0b, 0x42, 0xfa, 0xc3, 0x4e,
  0x08, 0x2e, 0xa1, 0x66, 0x28, 0xd9, 0x24, 0xb2, 0x76, 0x5b, 0xa2, 0x49, 0x6d, 0x8b, 0xd1, 0x25,
  0x72, 0xf8, 0xf6, 0x64, 0x86, 0x68, 0x98, 0x16, 0xd4, 0xa4, 0x5c, 0xcc, 0x5d, 0x65, 0xb6, 0x92,
  0x6c, 0x70, 0x48, 0x50, 0xfd, 0xed, 0xb9, 0xda, 0x5e, 0x15, 0x46, 0x57, 0xa7, 0x8d, 0x9d, 0x84,
  0x90, 0xd8, 0xab, 0x00, 0x8c, 0xbc, 0xd3, 0x0a, 0xf7, 0xe4, 0x58, 0x05, 0xb8, 0xb3, 0x45, 0x06,
  0xd0, 0x2c, 0x1e, 0x8f, 0xca, 0x3f, 0x0f, 0x02, 0xc1, 0xaf, 0xbd, 0x03, 0x01, 0x13, 0x8a, 0x6b,
  0x3a, 0x91, 0x11, 0x41, 0x4f, 0x67, 0xdc, 0xea, 0x97, 0xf2, 0xcf, 0xce, 0xf0, 0xb4, 0xe6, 0x73,
  0x96, 0xac, 0x74, 0x22, 0xe7, 0xad, 0x35, 0x85, 0xe2, 0xf9, 0x37, 0xe8, 0x1c, 0x75, 0xdf, 0x6e,
  0x47, 0xf1, 0x1a, 0x71, 0x1d, 0x29, 0xc5, 0x89, 0x6f, 0xb7, 0x62, 0x0e, 0xaa, 0x18, 0xbe, 0x1b,
  0xfc, 0x56, 0x3e, 0x4b, 0xc6, 0xd2, 0x79, 0x20, 0x9a, 0xdb, 0xc0, 0xfe, 0x78, 0xcd, 0x5a, 0xf4,
  0x1f, 0xdd, 0xa8, 0x33, 0x88, 0x07, 0xc7, 0x31, 0xb1, 0x12, 0x10, 0x59, 0x27, 0x80, 0xec, 0x5f,
  0x60, 0x51, 0x7f, 0xa9, 0x19, 0xb5, 0x4a, 0x0d, 0x2d, 0xe5, 0x7a, 0x9f, 0x93, 0xc9, 0x9c, 0xef,
  0xa0, 0xe0, 0x3b, 0x4d, 0xae, 0x2a, 0xf5, 0xb0, 0xc8, 0xeb, 0xbb, 0x3c, 0x83, 0x53, 0x99, 0x61,
  0x17, 0x2b, 0x04, 0x7e, 0xba, 0x77, 0xd6, 0x26, 0xe1, 0x69, 0x14, 0x63, 0x55, 0x21, 0x0c, 0x7d
];

// SHA-256 for browser synchronous key derivation
function sha256Sync(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let lengthProperty = 'length';
  let i, j;
  let result = '';

  const words = [];
  const asciiBitLength = ascii[lengthProperty] * 8;
  
  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];
  
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let currentBlock = 0;
  let wordIndex = 0;
  for (i = 0; i < ascii[lengthProperty]; i++) {
    currentBlock = (currentBlock << 8) | ascii.charCodeAt(i);
    if ((i % 4) === 3) {
      words[wordIndex++] = currentBlock;
      currentBlock = 0;
    }
  }
  const remaining = ascii[lengthProperty] % 4;
  if (remaining > 0) {
    currentBlock = currentBlock << ((4 - remaining) * 8);
    words[wordIndex++] = currentBlock;
  }

  words[asciiBitLength >> 5] |= 0x80 << (24 - (asciiBitLength % 32));
  words[(((asciiBitLength + 64) >> 9) << 4) + 15] = asciiBitLength;

  for (i = 0; i < words[lengthProperty]; i += 16) {
    const w = words.slice(i, i + 16);
    const oldHash = hash;
    hash = hash.slice(0);

    for (j = 0; j < 64; j++) {
      let w15 = w[j - 15], w2 = w[j - 2];
      let s0 = (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3));
      let s1 = (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10));
      w[j] = (j < 16) ? (w[j] || 0) : ((w[j - 16] + s0 + w[j - 7] + s1) | 0);

      let ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      let maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      let temp1 = (hash[7] + (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) + ch + k[j] + w[j]) | 0;
      let temp2 = ((rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + maj) | 0;

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
      hash.pop();
    }

    for (j = 0; j < 8; j++) {
      hash[j] = (hash[j] + oldHash[j]) | 0;
    }
  }

  const keyBytes = new Uint8Array(32);
  for (i = 0; i < 8; i++) {
    keyBytes[i * 4] = (hash[i] >>> 24) & 0xff;
    keyBytes[i * 4 + 1] = (hash[i] >>> 16) & 0xff;
    keyBytes[i * 4 + 2] = (hash[i] >>> 8) & 0xff;
    keyBytes[i * 4 + 3] = hash[i] & 0xff;
  }
  return keyBytes;
}

// AES-256 Decrypt single block (16 bytes)
function decryptBlock(input, keySchedule) {
  const Nb = 4;
  const Nr = 14;
  let state = new Uint8Array(16);
  for (let i = 0; i < 16; i++) state[i] = input[i];

  // AddRoundKey with last round key
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      state[r + 4 * c] ^= keySchedule[Nr * 16 + c * 4 + r];
    }
  }

  for (let round = Nr - 1; round > 0; round--) {
    // InvShiftRows
    let temp = new Uint8Array(16);
    temp[0] = state[0]; temp[4] = state[4]; temp[8] = state[8]; temp[12] = state[12];
    temp[1] = state[13]; temp[5] = state[1]; temp[9] = state[5]; temp[13] = state[9];
    temp[2] = state[10]; temp[6] = state[14]; temp[10] = state[2]; temp[14] = state[6];
    temp[3] = state[7]; temp[7] = state[11]; temp[11] = state[15]; temp[15] = state[3];

    // InvSubBytes
    for (let i = 0; i < 16; i++) {
      temp[i] = sboxInv[temp[i]];
    }

    // AddRoundKey
    for (let c = 0; c < 4; c++) {
      for (let r = 0; r < 4; r++) {
        temp[r + 4 * c] ^= keySchedule[round * 16 + c * 4 + r];
      }
    }

    // InvMixColumns
    for (let c = 0; c < 4; c++) {
      let a = temp[4 * c], b = temp[4 * c + 1], c_val = temp[4 * c + 2], d = temp[4 * c + 3];
      state[4 * c] = gmul(a, 14) ^ gmul(b, 11) ^ gmul(c_val, 13) ^ gmul(d, 9);
      state[4 * c + 1] = gmul(a, 9) ^ gmul(b, 14) ^ gmul(c_val, 11) ^ gmul(d, 13);
      state[4 * c + 2] = gmul(a, 13) ^ gmul(b, 9) ^ gmul(c_val, 14) ^ gmul(d, 11);
      state[4 * c + 3] = gmul(a, 11) ^ gmul(b, 13) ^ gmul(c_val, 9) ^ gmul(d, 14);
    }
  }

  // Final Round
  let finalTemp = new Uint8Array(16);
  finalTemp[0] = state[0]; finalTemp[4] = state[4]; finalTemp[8] = state[8]; finalTemp[12] = state[12];
  finalTemp[1] = state[13]; finalTemp[5] = state[1]; finalTemp[9] = state[5]; finalTemp[13] = state[9];
  finalTemp[2] = state[10]; finalTemp[6] = state[14]; finalTemp[10] = state[2]; finalTemp[14] = state[6];
  finalTemp[3] = state[7]; finalTemp[7] = state[11]; finalTemp[11] = state[15]; finalTemp[15] = state[3];

  for (let i = 0; i < 16; i++) {
    finalTemp[i] = sboxInv[finalTemp[i]];
  }

  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      state[r + 4 * c] = finalTemp[r + 4 * c] ^ keySchedule[c * 4 + r];
    }
  }

  return state;
}

// Galois Field multiplication helper
function gmul(a, b) {
  let p = 0;
  for (let counter = 0; counter < 8; counter++) {
    if ((b & 1) !== 0) p ^= a;
    let hi_bit_set = (a & 0x80) !== 0;
    a = (a << 1) & 0xff;
    if (hi_bit_set) a ^= 0x1b;
    b >>= 1;
  }
  return p;
}

// AES Key Expansion (256-bit)
const sbox = [
  0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
  0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
  0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
  0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
  0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
  0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
  0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
  0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
  0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
  0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
  0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5e, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
  0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
  0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
  0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
  0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
  0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
];

const Rcon = [
  0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36
];

function expandKey(key) {
  const Nk = 8;
  const Nr = 14;
  const expandedKey = new Uint8Array(16 * (Nr + 1));
  for (let i = 0; i < 32; i++) expandedKey[i] = key[i];

  let i = Nk;
  let temp = new Uint8Array(4);
  while (i < 4 * (Nr + 1)) {
    for (let k = 0; k < 4; k++) temp[k] = expandedKey[(i - 1) * 4 + k];
    if (i % Nk === 0) {
      const t = temp[0];
      temp[0] = sbox[temp[1]] ^ Rcon[i / Nk];
      temp[1] = sbox[temp[2]];
      temp[2] = sbox[temp[3]];
      temp[3] = sbox[t];
    } else if (Nk > 6 && (i % Nk) === 4) {
      for (let k = 0; k < 4; k++) temp[k] = sbox[temp[k]];
    }
    for (let k = 0; k < 4; k++) {
      expandedKey[i * 4 + k] = expandedKey[(i - Nk) * 4 + k] ^ temp[k];
    }
    i++;
  }
  return expandedKey;
}

/**
 * Synchronous AES-256-CBC Decryption
 */
export function decryptVideoTokenSync(token) {
  if (!token || typeof token !== 'string') return '';
  if (!token.startsWith('enc_')) return token;

  try {
    const parts = token.slice(4).split('_');
    if (parts.length < 2) return '';

    const iv = hexToBytes(parts[0]);
    const ciphertext = hexToBytes(parts[1]);
    const key = sha256Sync(SECRET_KEY);
    const keySchedule = expandKey(key);

    const decryptedBytes = new Uint8Array(ciphertext.length);
    let prevBlock = iv;

    for (let i = 0; i < ciphertext.length; i += 16) {
      const block = ciphertext.subarray(i, i + 16);
      const decryptedBlock = decryptBlock(block, keySchedule);
      for (let j = 0; j < 16; j++) {
        decryptedBytes[i + j] = decryptedBlock[j] ^ prevBlock[j];
      }
      prevBlock = block;
    }

    // PKCS#7 unpad
    const padLen = decryptedBytes[decryptedBytes.length - 1];
    if (padLen > 0 && padLen <= 16) {
      const unpadded = decryptedBytes.subarray(0, decryptedBytes.length - padLen);
      const text = new TextDecoder('utf-8').decode(unpadded);
      try {
        const parsed = JSON.parse(text);
        return parsed?.id || parsed?.youtubeVideoId || parsed;
      } catch {
        return text;
      }
    }

    const text = new TextDecoder('utf-8').decode(decryptedBytes);
    return text;
  } catch (err) {
    console.error('Video token decryption error:', err);
    return '';
  }
}

/**
 * Universal video resolver that extracts a playable videoId from raw or encrypted payload
 */
export function resolvePlayableVideoId(lessonOrToken) {
  if (!lessonOrToken) return '';
  
  if (typeof lessonOrToken === 'string') {
    if (lessonOrToken.startsWith('enc_')) {
      return decryptVideoTokenSync(lessonOrToken);
    }
    return lessonOrToken;
  }

  // If lesson object passed
  if (lessonOrToken.videoToken) {
    return decryptVideoTokenSync(lessonOrToken.videoToken);
  }
  if (lessonOrToken.encryptedVideoToken) {
    return decryptVideoTokenSync(lessonOrToken.encryptedVideoToken);
  }
  if (lessonOrToken.youtubeVideoId) {
    return lessonOrToken.youtubeVideoId;
  }
  if (lessonOrToken.youtubeUrl) {
    const match = lessonOrToken.youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : '';
  }

  return '';
}

export default {
  decryptVideoTokenSync,
  resolvePlayableVideoId
};
