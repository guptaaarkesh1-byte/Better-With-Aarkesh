import dotenv from 'dotenv';
import Mux from '@mux/mux-node';

dotenv.config();

const tokenId = process.env.MUX_TOKEN_ID;
const tokenSecret = process.env.MUX_TOKEN_SECRET;

console.log('Testing Mux Token ID:', tokenId ? `${tokenId.slice(0, 8)}...` : 'MISSING');
console.log('Testing Mux Token Secret:', tokenSecret ? `${tokenSecret.slice(0, 8)}...` : 'MISSING');

try {
  const mux = new Mux({
    tokenId,
    tokenSecret,
  });

  const upload = await mux.video.uploads.create({
    new_asset_settings: {
      playback_policy: ['public'],
      video_quality: 'basic',
    },
    cors_origin: '*',
  });

  console.log('SUCCESS! Created Mux direct upload URL:', upload.url);
  console.log('Upload ID:', upload.id);
} catch (err) {
  console.error('Mux test error:', err.message, err.status);
}
