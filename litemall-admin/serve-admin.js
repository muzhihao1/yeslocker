const http = require('http');
const httpProxy = require('http-proxy');
const fs = require('fs');
const path = require('path');
const url = require('url');

const proxy = httpProxy.createProxyServer({});
const PORT = 9527;

const server = http.createServer((req, res) => {
  // Proxy API requests
  if (req.url.startsWith('/admin')) {
    proxy.web(req, res, {
      target: 'http://localhost:8081',
      changeOrigin: true
    });
    return;
  }

  // Serve static files
  let filePath = path.join(__dirname, 'dist', req.url === '/' ? 'index.html' : req.url);
  
  // Handle client-side routing
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, 'dist', 'index.html');
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }

    // Set content type
    const ext = path.extname(filePath);
    let contentType = 'text/html';
    if (ext === '.js') contentType = 'text/javascript';
    else if (ext === '.css') contentType = 'text/css';
    else if (ext === '.json') contentType = 'application/json';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg') contentType = 'image/jpg';
    else if (ext === '.svg') contentType = 'image/svg+xml';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content, 'utf-8');
  });
});

server.listen(PORT, () => {
  console.log(`Admin server running at http://localhost:${PORT}`);
});