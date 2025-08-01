# API Integration Summary

## Overview
This document summarizes the frontend-backend API integration for the storage request flow in the YesLocker WeChat Mini Program.

## Changes Made

### 1. API Module Updates (`/src/api/locker.js`)
- Updated all request-based API endpoints to use correct backend paths
- Added proper API paths under `/wx/storage/` prefix
- Added new APIs:
  - `getActiveRequest()` - Get user's active request
  - `cancelRequest()` - Cancel a request

### 2. Storage Request Page (`/pages/storage/request.vue`)
- Replaced mock data with real API calls to `createStorageRequest()`
- Added proper error handling and loading states
- Fetches user's locker information using `getMyLocker()` API
- Validates user has an assigned locker before allowing requests

### 3. Request Detail Page (`/pages/storage/request-detail.vue`)
- Updated to use request ID instead of request code
- Integrated with `getRequestDetail()` API
- Connected key return confirmation with `confirmKeyReturn()` API
- Updates locker status in cache after successful operations

### 4. Requests List Page (`/pages/storage/requests.vue`)
- Replaced mock data with `getRequestList()` API
- Added real cancel functionality using `cancelRequest()` API
- Properly formats API response data for display
- Maintains fallback to mock data if API fails

### 5. Home Page (`/pages/home/index.vue`)
- Added `getActiveRequest()` check on load and show
- Updates storage status using `getMyLocker()` API
- Shows prompt if user has an active request
- Refreshes data when returning to the page

## API Endpoints Used

### Storage Request APIs
- `POST /wx/storage/request` - Create new request
- `GET /wx/storage/requests` - List user's requests
- `GET /wx/storage/request/{id}` - Get request details
- `POST /wx/storage/confirm-key-return` - Confirm key return
- `GET /wx/storage/active-request` - Get active request
- `POST /wx/storage/cancel` - Cancel request

### Locker APIs
- `GET /wx/locker/my-locker` - Get user's assigned locker info
- `POST /wx/locker/assign` - Assign locker to user (registration)

## Error Handling

All pages implement proper error handling:
1. Try-catch blocks around API calls
2. User-friendly error messages via `uni.showToast`
3. Fallback to cached data when API fails
4. Console logging for debugging

## Data Flow

1. **Create Request Flow**:
   - User clicks "申请存杆" or "申请取杆" on home page
   - Request page loads user's locker info via API
   - Submit creates request via API
   - Redirects to request detail page with request ID

2. **View Request Flow**:
   - Request detail page loads data using request ID
   - Shows current status and next steps
   - Allows key return confirmation
   - Updates locker status after completion

3. **List Requests Flow**:
   - Fetches all user's requests from API
   - Allows filtering by type and status
   - Click navigates to detail page
   - Cancel action calls API and updates list

## Testing Recommendations

1. Test with real backend API running
2. Verify error handling with network offline
3. Check data consistency across pages
4. Test concurrent request scenarios
5. Verify locker status updates correctly

## Next Steps

1. Add pull-to-refresh on list pages
2. Implement real-time status updates
3. Add push notifications for status changes
4. Optimize API calls with caching
5. Add offline support with data sync