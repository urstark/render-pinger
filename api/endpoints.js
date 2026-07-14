import clientPromise from './db.js';
import { checkAuth } from './auth.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (!checkAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const client = await clientPromise;
  const db = client.db('renderPinger');
  const collection = db.collection('endpoints');

  switch (req.method) {
    case 'GET':
      try {
        const endpoints = await collection.find({}).toArray();
        res.status(200).json(endpoints);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch endpoints' });
      }
      break;

    case 'POST':
      try {
        const { url, headers } = req.body;
        if (!url) return res.status(400).json({ error: 'URL is required' });
        
        const newEndpoint = { url, headers: headers || {}, createdAt: new Date() };
        await collection.insertOne(newEndpoint);
        res.status(201).json(newEndpoint);
      } catch (error) {
        res.status(500).json({ error: 'Failed to add endpoint' });
      }
      break;

    case 'PUT':
      try {
        const { id, url, headers } = req.body;
        if (!id) return res.status(400).json({ error: 'ID is required' });
        if (!url) return res.status(400).json({ error: 'URL is required' });
        
        await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { url, headers: headers || {} } }
        );
        res.status(200).json({ success: true });
      } catch (error) {
        res.status(500).json({ error: 'Failed to update endpoint' });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'ID is required' });
        
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).json({ success: true });
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete endpoint' });
      }
      break;

    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}
