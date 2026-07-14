import clientPromise from './db.js';
import { checkAuth } from './auth.js';

export default async function handler(req, res) {
  if (!checkAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const client = await clientPromise;
  const db = client.db('renderPinger');
  const collection = db.collection('logs');

  if (req.method === 'GET') {
    try {
      // Get the last 100 logs, sorted by newest first
      const logs = await collection.find({}).sort({ timestamp: -1 }).limit(100).toArray();
      res.status(200).json(logs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch logs' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
