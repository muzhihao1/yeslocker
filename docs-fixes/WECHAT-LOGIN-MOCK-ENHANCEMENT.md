# 🔧 WeChat Login Mock Enhancement

## Overview

Enhanced Mock data system for WeChat login to support comprehensive testing scenarios without real WeChat authentication.

## Backend Mock Mode

### Configuration

Enable Mock mode in `application-dev.yml`:

```yaml
litemall:
  wx:
    mock-mode: true  # Enable Mock mode for development
```

### Available Test Users

When Mock mode is enabled, you can use these special codes in WeChat login to generate different test users:

| Test Code | Description | Features |
|-----------|-------------|----------|
| `test-new-user-XXX` | New unverified user | No mobile, no locker assigned |
| `test-verified-user-XXX` | Verified user | Mobile verified, locker assigned |
| `test-active-storage-XXX` | User with active storage | Has cue stick stored |
| `test-expired-storage-XXX` | User with expired storage | Storage > 30 days |
| `test-vip-user-XXX` | VIP member | VIP privileges, priority access |
| `test-admin-XXX` | Admin user | System administrator |

### API Endpoint

Get available test users (Mock mode only):
```
GET /wx/auth/mock-users
```

## Frontend Mock Data

### WeChat Login Test Scenarios

The frontend Mock system now supports multiple user scenarios:

```javascript
// Example: Login as new user
wx.login({
  success: (res) => {
    // Use test code instead of real WeChat code
    const testCode = 'test-new-user-001';
    
    // Call login API
    auth.loginByWeixin({
      code: testCode,
      userInfo: {
        nickName: '新用户测试',
        avatarUrl: '/static/default-avatar.png',
        gender: 1
      }
    });
  }
});
```

### Mock User Data Structure

Each Mock user includes:

```javascript
{
  id: 101,
  username: 'mock-new-user-001',
  nickname: '新用户001',
  avatar: '/static/default-avatar.png',
  mobile: null,
  identityVerified: false,
  lockerId: null,
  storeId: null,
  userLevel: 0,
  
  // Additional fields for specific scenarios
  hasActiveStorage: true,      // For active storage users
  activeStorageInfo: {...},    // Storage details
  vipInfo: {...},             // VIP membership details
  realName: '张*',            // For verified users
  idCard: '110***1234'        // For verified users
}
```

## Testing Guide

### 1. Test New User Registration Flow

```javascript
// Login with new user code
const code = 'test-new-user-001';

// Expected behavior:
// - User not verified
// - No locker assigned
// - Redirect to registration flow
```

### 2. Test Verified User Flow

```javascript
// Login with verified user code  
const code = 'test-verified-user-001';

// Expected behavior:
// - User already verified
// - Has locker assigned
// - Can directly store cue stick
```

### 3. Test Active Storage Flow

```javascript
// Login with active storage code
const code = 'test-active-storage-001';

// Expected behavior:
// - Shows active storage on home page
// - Can retrieve cue stick
// - Shows voucher code
```

### 4. Test VIP User Flow

```javascript
// Login with VIP user code
const code = 'test-vip-user-001';

// Expected behavior:
// - Shows VIP badge
// - Access to VIP lockers
// - Extended storage period
```

## Implementation Details

### Backend Changes

1. Added `mockMode` property to `WxAuthController`
2. Created `generateMockOpenId()` method to generate different user types
3. Created `setupMockUserData()` method to configure user properties
4. Added `/wx/auth/mock-users` endpoint to list available test users

### Frontend Changes

1. Enhanced Mock data with multiple user scenarios
2. Updated Mock request handler to recognize test codes
3. Added comprehensive user data for each scenario
4. Support for different user states and privileges

## Usage in Development

1. Start backend with Mock mode enabled:
```bash
cd litemall-all
java -jar target/litemall-all-*-exec.jar --spring.profiles.active=dev
```

2. In frontend, use test codes instead of real WeChat codes:
```javascript
// In your WeChat login handler
if (process.env.NODE_ENV === 'development') {
  // Use test code for development
  const testCode = 'test-verified-user-001';
  handleLogin(testCode);
} else {
  // Use real WeChat code in production
  wx.login({
    success: (res) => {
      handleLogin(res.code);
    }
  });
}
```

## Benefits

1. **No WeChat Dependencies**: Test without WeChat Developer account
2. **Comprehensive Scenarios**: Test all user states and flows
3. **Consistent Data**: Predictable test data for development
4. **Easy Switching**: Toggle between Mock and real mode via config
5. **Team Collaboration**: Frontend can work independently of backend

## Notes

- Mock mode is only for development environment
- Production must use real WeChat authentication
- Test users are not persisted between restarts
- Each code generates consistent user data