import clientPromise from './db.js';

export default async function handler(req, res) {
  // We allow GET (from Cron) or POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let db, endpointsCol, logsCol;
  let endpoints = [];

  try {
    const client = await clientPromise;
    db = client.db('renderPinger');
    endpointsCol = db.collection('endpoints');
    logsCol = db.collection('logs');
    
    // Fetch URLs from database
    endpoints = await endpointsCol.find({}).toArray();
  } catch (err) {
    console.error("Database connection failed:", err);
    // Fallback to RENDER_URLS if DB fails or isn't set up yet
    const fallbackUrls = (process.env.RENDER_URLS || process.env.RENDER_URL || "https://sonic-search-pouc.onrender.com")
      .split(",").map(url => url.trim()).filter(url => url);
    endpoints = fallbackUrls.map(url => ({ url, headers: {} }));
  }

  if (endpoints.length === 0) {
    return res.status(200).json({ message: "No endpoints configured" });
  }

  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0"
  ];

  // Ping all URLs in parallel
  const results = await Promise.all(endpoints.map(async (endpoint) => {
    const url = endpoint.url;
    try {
      const start = Date.now();
      const targetUrl = url.startsWith('http') ? url : `https://${url}`;
      const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
      
      const fetchHeaders = { "User-Agent": randomUA, ...endpoint.headers };

      const response = await fetch(targetUrl, { 
        method: "GET",
        headers: fetchHeaders
      });
      
      const duration = Date.now() - start;
      
      return {
        url: targetUrl,
        status: response.ok ? "success" : "failed",
        responseTime: duration,
        statusCode: response.status,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        url,
        status: "error",
        message: error.message,
        timestamp: new Date()
      };
    }
  }));

  // Save logs to MongoDB
  if (logsCol && results.length > 0) {
    try {
      await logsCol.insertMany(results);
    } catch (err) {
      console.error("Failed to save logs:", err);
    }
  }

  const anyError = results.some(r => r.status === "error" || r.status === "failed");
  
  res.status(anyError ? 207 : 200).json({ 
    totalPings: results.length,
    results 
  });
}
