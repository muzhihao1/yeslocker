const express = require('express');
const cors = require('cors');
const app = express();
const port = 8081;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data storage
let storageRequests = [];
let requestCounter = 1000;

// Mock user data for testing
const mockUsers = {
  1: { id: 1, nickname: "测试用户1", lockerId: 1, storeId: 1, idCardNumber: "310000199001011234" },
  2: { id: 2, nickname: "测试用户2", lockerId: 2, storeId: 1, idCardNumber: "310000199002022345" },
  3: { id: 3, nickname: "测试用户3", lockerId: null, storeId: 1, idCardNumber: null }, // No locker assigned
  4: { id: 4, nickname: "测试用户4", lockerId: 3, storeId: 2, idCardNumber: "310000199003033456" }
};

// Mock locker data
const mockLockers = [
  { id: 1, cabinetNumber: "A01", zone: "A区", status: "available", storeId: 1 },
  { id: 2, cabinetNumber: "A02", zone: "A区", status: "occupied", storeId: 1, currentUserId: 2 },
  { id: 3, cabinetNumber: "B01", zone: "B区", status: "available", storeId: 2 },
  { id: 4, cabinetNumber: "B02", zone: "B区", status: "maintenance", storeId: 2 }
];

// Generate voucher code
function generateVoucherCode() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${date}-${random}`;
}

// POST /wx/locker/request/create
app.post('/wx/locker/request/create', (req, res) => {
  console.log('Received storage request:', req.body);
  
  const { lockerId, storeId, notes, type = 'store' } = req.body;
  
  // Simulate authentication - in real app this would come from JWT/session
  const userId = req.headers['x-user-id'] || 1;
  const user = mockUsers[userId];
  
  if (!user) {
    return res.json({
      errno: 401,
      errmsg: "用户不存在"
    });
  }
  
  // Check if user has ID verification
  if (!user.idCardNumber) {
    return res.json({
      errno: 403,
      errmsg: "请先完成实名认证"
    });
  }
  
  // Check if user has a store selected
  if (!user.storeId && !storeId) {
    return res.json({
      errno: 403,
      errmsg: "请先选择您要使用的门店"
    });
  }
  
  // Generate request data
  const requestId = requestCounter++;
  const voucherCode = generateVoucherCode();
  const qrcodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=VOUCHER:${voucherCode}`;
  
  const newRequest = {
    requestId,
    voucherCode,
    qrcodeUrl,
    lockerId: lockerId || user.lockerId,
    storeId: storeId || user.storeId,
    userId,
    type,
    notes,
    status: 'active',
    createdAt: new Date().toISOString()
  };
  
  storageRequests.push(newRequest);
  
  // Return response matching the expected format
  res.json({
    errno: 0,
    errmsg: "success",
    data: {
      requestId,
      voucherCode,
      qrcodeUrl
    }
  });
});

// GET /wx/locker/available - Get available lockers
app.get('/wx/locker/available', (req, res) => {
  const { zone, storeId } = req.query;
  
  let lockers = mockLockers.filter(l => l.status === 'available');
  
  if (zone) {
    lockers = lockers.filter(l => l.zone === zone);
  }
  
  if (storeId) {
    lockers = lockers.filter(l => l.storeId === parseInt(storeId));
  }
  
  res.json({
    errno: 0,
    errmsg: "success",
    data: lockers
  });
});

// GET /wx/storage/request/:id - Get request details
app.get('/wx/storage/request/:id', (req, res) => {
  const requestId = parseInt(req.params.id);
  const request = storageRequests.find(r => r.requestId === requestId);
  
  if (!request) {
    return res.json({
      errno: 404,
      errmsg: "申请不存在"
    });
  }
  
  res.json({
    errno: 0,
    errmsg: "success",
    data: request
  });
});

// POST /wx/storage/confirm-key-return - Confirm key return
app.post('/wx/storage/confirm-key-return', (req, res) => {
  const { requestId } = req.body;
  
  const request = storageRequests.find(r => r.requestId === requestId);
  
  if (!request) {
    return res.json({
      errno: 404,
      errmsg: "申请不存在"
    });
  }
  
  request.status = 'completed';
  request.completedAt = new Date().toISOString();
  
  res.json({
    errno: 0,
    errmsg: "success",
    data: {
      success: true
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`Mock Storage API server running at http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log('- POST /wx/locker/request/create');
  console.log('- GET /wx/locker/available');
  console.log('- GET /wx/storage/request/:id');
  console.log('- POST /wx/storage/confirm-key-return');
  console.log('\nUse header "X-User-Id" to simulate different users (1-4)');
});