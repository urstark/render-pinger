import http from 'http';
import authHandler from './api/auth.js';

const server = http.createServer((req, res) => {
  // Simulate Vercel req/res for a simple test
  let body = '';
  req.on('data', chunk => body += chunk.toString());
  req.on('end', () => {
    req.body = body ? JSON.parse(body) : {};
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (data) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    };
    
    authHandler(req, res).catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    });
  });
});

server.listen(3000, () => {
  console.log('Test server listening on 3000');
});
