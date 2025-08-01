const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'font/eot'
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Litemall-Admin-Token');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Handle API requests
  if (req.url.startsWith('/admin/auth/login') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (data.username === 'admin123' && data.password === 'admin123') {
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(200);
          res.end(JSON.stringify({
            errno: 0,
            data: {
              token: 'mock-jwt-token-' + Date.now(),
              adminInfo: {
                id: 1,
                username: 'admin123',
                avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
                roleIds: [1]
              }
            },
            errmsg: '成功'
          }));
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(200);
          res.end(JSON.stringify({
            errno: 605,
            errmsg: '用户帐号或密码不正确'
          }));
        }
      } catch (e) {
        res.writeHead(400);
        res.end('Bad Request');
      }
    });
    return;
  }

  // Handle auth info request
  if (req.url.startsWith('/admin/auth/info')) {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({
      errno: 0,
      data: {
        name: 'admin123',
        avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
        roles: ['超级管理员'],
        perms: ['*']
      },
      errmsg: '成功'
    }));
    return;
  }

  // Handle dashboard request
  if (req.url.includes('/admin/dashboard')) {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({
      errno: 0,
      data: {
        userTotal: 156,
        goodsTotal: 42,
        productTotal: 89,
        orderTotal: 234
      },
      errmsg: '成功'
    }));
    return;
  }

  // Handle store creation
  if (req.url === '/admin/store/create' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('Creating store:', data);
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify({
          errno: 0,
          data: {
            id: Date.now(),
            name: data.name || '新门店',
            address: data.address || '默认地址',
            phone: data.phone || '13800138000',
            manager: data.manager || '店长',
            status: 1,
            createTime: new Date().toISOString()
          },
          errmsg: '成功'
        }));
      } catch (e) {
        res.writeHead(400);
        res.end('Bad Request');
      }
    });
    return;
  }

  // Handle store list
  if (req.url.includes('/admin/store/list')) {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({
      errno: 0,
      data: {
        total: 2,
        items: [
          {
            id: 1,
            name: '耶氏体育旗舰店',
            address: '上海市浦东新区张江高科技园区',
            phone: '021-12345678',
            manager: '张三',
            status: 1,
            lockerCount: 100,
            availableCount: 65,
            createTime: '2025-01-01T10:00:00'
          },
          {
            id: 2,
            name: '耶氏体育徐汇店',
            address: '上海市徐汇区漕河泾开发区',
            phone: '021-87654321',
            manager: '李四',
            status: 1,
            lockerCount: 80,
            availableCount: 45,
            createTime: '2025-01-15T10:00:00'
          }
        ]
      },
      errmsg: '成功'
    }));
    return;
  }

  // Handle locker list
  if (req.url.includes('/admin/locker/list')) {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({
      errno: 0,
      data: {
        total: 100,
        items: [
          {
            id: 1,
            number: 'A001',
            storeId: 1,
            storeName: '耶氏体育旗舰店',
            status: 'AVAILABLE',
            size: 'LARGE',
            location: 'A区1排',
            lastOperation: null
          },
          {
            id: 2,
            number: 'A002',
            storeId: 1,
            storeName: '耶氏体育旗舰店',
            status: 'OCCUPIED',
            size: 'MEDIUM',
            location: 'A区1排',
            lastOperation: {
              type: 'STORE',
              userName: '王五',
              operationTime: '2025-01-20T14:30:00'
            }
          }
        ]
      },
      errmsg: '成功'
    }));
    return;
  }

  // Handle user list
  if (req.url.includes('/admin/user/list')) {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({
      errno: 0,
      data: {
        total: 156,
        items: [
          {
            id: 1,
            username: 'user001',
            nickname: '张三',
            mobile: '13812345678',
            avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
            gender: 1,
            birthday: '1990-01-01',
            lastLoginTime: '2025-01-27T09:00:00',
            lastLoginIp: '192.168.1.100',
            userLevel: 1,
            status: 0
          }
        ]
      },
      errmsg: '成功'
    }));
    return;
  }

  // Handle other API requests with mock data
  if (req.url.startsWith('/admin/') && !req.url.includes('.')) {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({
      errno: 0,
      data: [],
      errmsg: '成功'
    }));
    return;
  }

  // Redirect root to admin panel
  if (req.url === '/') {
    res.writeHead(302, { 'Location': '/admin/index.html' });
    res.end();
    return;
  }

  // Serve static files
  let filePath = req.url;
  if (filePath.startsWith('/admin/')) {
    // Try admin dist first
    const adminDistPath = path.join(__dirname, 'litemall-admin/dist', filePath.substring(7));
    if (fs.existsSync(adminDistPath)) {
      serveFile(adminDistPath, res);
      return;
    }
    
    // Try litemall-all resources
    const resourcePath = path.join(__dirname, 'litemall-all/src/main/resources/static', filePath);
    if (fs.existsSync(resourcePath)) {
      serveFile(resourcePath, res);
      return;
    }
  }

  // 404
  res.writeHead(404);
  res.end('Not Found');
});

function serveFile(filePath, res) {
  const extname = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(500);
      res.end('Server Error');
    } else {
      res.setHeader('Content-Type', contentType);
      res.writeHead(200);
      res.end(content);
    }
  });
}

server.listen(PORT, () => {
  console.log(`Admin panel server running at http://localhost:${PORT}`);
  console.log(`Admin panel URL: http://localhost:${PORT}/admin/index.html`);
  console.log('\nDefault login credentials:');
  console.log('Username: admin123');
  console.log('Password: admin123');
});