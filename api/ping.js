export default async function handler(req, res) {
  // Supports single RENDER_URL or multiple RENDER_URLS (comma-separated)
  const urlsString = process.env.RENDER_URLS || process.env.RENDER_URL || "https://sonic-search-pouc.onrender.com";
  
  // Split by comma, trim whitespace, and filter out empty strings
  const urls = urlsString.split(",").map(url => url.trim()).filter(url => url);

  // Ping all URLs in parallel
  const results = await Promise.all(urls.map(async (url) => {
    try {
      const start = Date.now();
      // Ensure the URL starts with http/https
      const targetUrl = url.startsWith('http') ? url : `https://${url}`;
      
      const userAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0"
      ];
      const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];

      const response = await fetch(targetUrl, { 
        method: "GET",
        headers: { "User-Agent": randomUA }
      });
      const duration = Date.now() - start;
      
      return {
        url: targetUrl,
        status: "success",
        responseTime: `${duration}ms`,
        statusCode: response.status
      };
    } catch (error) {
      return {
        url,
        status: "error",
        message: error.message
      };
    }
  }));

  // Check if any pings failed
  const anyError = results.some(r => r.status === "error");
  
  res.status(anyError ? 207 : 200).json({ 
    totalPings: results.length,
    results 
  });
}
