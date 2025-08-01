const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 8080;

// Enable CORS for all origins during development
app.use(cors());

// Serve static files from the admin panel dist directory
app.use('/admin', express.static(path.join(__dirname, 'litemall-admin/dist')));

// Serve static files from the litemall-all resources (if exists)
app.use('/admin', express.static(path.join(__dirname, 'litemall-all/src/main/resources/static/admin')));

// Mock API endpoints for admin panel
app.use(express.json());

// Mock login endpoint
app.post('/admin/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin123' && password === 'admin123') {
    res.json({
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
    });
  } else {
    res.json({
      errno: 605,
      errmsg: '用户帐号或密码不正确'
    });
  }
});

// Mock user info endpoint
app.get('/admin/auth/info', (req, res) => {
  res.json({
    errno: 0,
    data: {
      name: 'admin123',
      avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
      roles: ['超级管理员'],
      perms: ['*']
    },
    errmsg: '成功'
  });
});

// Mock dashboard data
app.get('/admin/dashboard', (req, res) => {
  res.json({
    errno: 0,
    data: {
      userTotal: 156,
      goodsTotal: 42,
      productTotal: 89,
      orderTotal: 234
    },
    errmsg: '成功'
  });
});

// Mock locker statistics
app.get('/admin/locker/stats', (req, res) => {
  res.json({
    errno: 0,
    data: {
      totalLockers: 100,
      availableLockers: 65,
      occupiedLockers: 35,
      maintenanceLockers: 0,
      todayOperations: 12,
      activeVouchers: 35
    },
    errmsg: '成功'
  });
});

// Default route - redirect to admin panel
app.get('/', (req, res) => {
  res.redirect('/admin/index.html');
});

// Catch all API routes and return mock data
app.all('/admin/api/*', (req, res) => {
  res.json({
    errno: 0,
    data: [],
    errmsg: '成功'
  });
});

app.listen(PORT, () => {
  console.log(`Admin panel server running at http://localhost:${PORT}`);
  console.log(`Admin panel URL: http://localhost:${PORT}/admin/index.html`);
  console.log('\nDefault login credentials:');
  console.log('Username: admin123');
  console.log('Password: admin123');
});