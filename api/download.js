import { kv } from '@vercel/kv';

const APK_URL = 'https://github.com/LikeNmuFF/Novu/releases/latest/download/app-release.apk';

export default async function handler(req, res) {
  try {
    await kv.incr('download_count');
  } catch (e) {
    // Ignore KV errors, still redirect
  }
  return res.redirect(302, APK_URL);
}
