import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const count = await kv.get('download_count') || 0;
    return res.status(200).json({ count: parseInt(count) });
  } catch (e) {
    return res.status(200).json({ count: 0, error: e.message });
  }
}
