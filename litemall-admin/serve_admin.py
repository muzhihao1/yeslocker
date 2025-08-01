#!/usr/bin/env python3
import http.server
import socketserver
import urllib.request
import urllib.parse
import os

PORT = 9527
BACKEND_URL = "http://localhost:8080"

class ProxyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory="dist", **kwargs)
    
    def do_GET(self):
        if self.path.startswith('/admin'):
            self.proxy_request()
        else:
            # Serve static files
            if self.path == '/':
                self.path = '/index.html'
            elif not os.path.exists(os.path.join("dist", self.path.lstrip('/'))):
                self.path = '/index.html'
            super().do_GET()
    
    def do_POST(self):
        if self.path.startswith('/admin'):
            self.proxy_request()
        else:
            self.send_error(404)
    
    def proxy_request(self):
        # Forward request to backend
        try:
            url = BACKEND_URL + self.path
            headers = {key: val for key, val in self.headers.items() if key != 'Host'}
            
            # Read POST data if present
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length) if content_length > 0 else None
            
            # Create request
            req = urllib.request.Request(url, data=post_data, headers=headers)
            req.get_method = lambda: self.command
            
            # Make request
            response = urllib.request.urlopen(req)
            
            # Send response
            self.send_response(response.getcode())
            for header, value in response.headers.items():
                if header.lower() not in ['connection', 'transfer-encoding']:
                    self.send_header(header, value)
            self.end_headers()
            
            # Copy response body
            self.wfile.write(response.read())
            
        except Exception as e:
            print(f"Proxy error: {e}")
            self.send_error(502, f"Bad Gateway: {str(e)}")

with socketserver.TCPServer(("", PORT), ProxyHTTPRequestHandler) as httpd:
    print(f"Server running at http://localhost:{PORT}")
    httpd.serve_forever()