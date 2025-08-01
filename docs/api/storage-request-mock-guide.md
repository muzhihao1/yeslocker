# Storage Request API Mock Guide

## For Terminal A - A03 Task Support

### Quick Start

1. **Install dependencies** (if not already installed):
```bash
npm install express cors
```

2. **Start the mock server**:
```bash
node mock-storage-api.js
```

The mock server will run on port 8081.

### API Endpoints

#### 1. Create Storage Request
**Endpoint**: `POST http://localhost:8081/wx/locker/request/create`

**Request Body**:
```json
{
  "lockerId": 1,
  "storeId": 1,
  "notes": "存放备注",
  "type": "store"  // or "retrieve"
}
```

**Headers** (optional):
- `X-User-Id`: Simulate different users (1-4)

**Success Response**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "requestId": 1001,
    "voucherCode": "20250727-0001",
    "qrcodeUrl": "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=VOUCHER:20250727-0001"
  }
}
```

**Error Responses**:
- 401: User not found
- 403: User not verified or no store selected

#### 2. Get Available Lockers
**Endpoint**: `GET http://localhost:8081/wx/locker/available`

**Query Parameters**:
- `zone`: Filter by zone (e.g., "A区", "B区")
- `storeId`: Filter by store ID

**Response**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": [
    {
      "id": 1,
      "cabinetNumber": "A01",
      "zone": "A区",
      "status": "available",
      "storeId": 1
    }
  ]
}
```

#### 3. Get Request Details
**Endpoint**: `GET http://localhost:8081/wx/storage/request/:id`

**Response**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "requestId": 1001,
    "voucherCode": "20250727-0001",
    "qrcodeUrl": "https://...",
    "lockerId": 1,
    "storeId": 1,
    "userId": 1,
    "type": "store",
    "notes": "存放备注",
    "status": "active",
    "createdAt": "2025-07-27T08:00:00.000Z"
  }
}
```

#### 4. Confirm Key Return
**Endpoint**: `POST http://localhost:8081/wx/storage/confirm-key-return`

**Request Body**:
```json
{
  "requestId": 1001
}
```

**Response**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "success": true
  }
}
```

### Test Users

The mock server includes 4 test users:

| User ID | Status | Has Locker | Has ID Verification | Store ID |
|---------|--------|------------|-------------------|----------|
| 1 | Normal user | Yes (Locker 1) | Yes | Store 1 |
| 2 | Normal user | Yes (Locker 2) | Yes | Store 1 |
| 3 | New user | No | No | Store 1 |
| 4 | Different store | Yes (Locker 3) | Yes | Store 2 |

### Testing Scenarios

1. **Successful storage request**:
   - Use User 1 or 2
   - They have ID verification and assigned lockers

2. **User without ID verification**:
   - Use User 3
   - Will return error 403

3. **Cross-store testing**:
   - User 4 is in Store 2
   - Can test store-specific logic

### Integration with Frontend

In your frontend code, update the API base URL for development:

```javascript
// For development with mock
const API_BASE = 'http://localhost:8081';

// For production or real backend
// const API_BASE = 'http://localhost:8080';
```

### Database Test Data

We've also prepared SQL script with 60+ test lockers:
- Location: `/sql/test-lockers-data.sql`
- 40 available lockers
- 12 occupied lockers
- 5 maintenance lockers
- Across 3 zones and 2 stores

To load test data into MySQL:
```bash
mysql -u root -p yeslocker < sql/test-lockers-data.sql
```

### Notes

- The mock server generates real QR codes using qrserver.com API
- Voucher codes follow the format: YYYYMMDD-XXXX
- All responses follow the standard format: `{ errno, errmsg, data }`
- The server logs all incoming requests for debugging