#!/bin/bash

# Test script for batch update locker API

echo "Testing Batch Update Locker API"
echo "================================"

# First login as admin to get token
echo -e "\n1. Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8083/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin123",
    "password": "admin123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Failed to login. Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "Login successful. Token: ${TOKEN:0:20}..."

# Test batch update - change status to maintenance for lockers 1,2,3
echo -e "\n2. Testing batch update - changing status to maintenance..."
BATCH_RESPONSE=$(curl -s -X POST http://localhost:8083/admin/locker/batch-update \
  -H "Content-Type: application/json" \
  -H "X-Litemall-Admin-Token: $TOKEN" \
  -d '{
    "ids": [1, 2, 3],
    "status": "maintenance",
    "notes": "批量维护测试"
  }')

echo "Batch update response:"
echo $BATCH_RESPONSE | python -m json.tool 2>/dev/null || echo $BATCH_RESPONSE

# Test invalid status
echo -e "\n3. Testing with invalid status..."
INVALID_RESPONSE=$(curl -s -X POST http://localhost:8083/admin/locker/batch-update \
  -H "Content-Type: application/json" \
  -H "X-Litemall-Admin-Token: $TOKEN" \
  -d '{
    "ids": [1],
    "status": "invalid_status"
  }')

echo "Invalid status response:"
echo $INVALID_RESPONSE | python -m json.tool 2>/dev/null || echo $INVALID_RESPONSE

# Test empty IDs
echo -e "\n4. Testing with empty IDs..."
EMPTY_RESPONSE=$(curl -s -X POST http://localhost:8083/admin/locker/batch-update \
  -H "Content-Type: application/json" \
  -H "X-Litemall-Admin-Token: $TOKEN" \
  -d '{
    "ids": [],
    "status": "available"
  }')

echo "Empty IDs response:"
echo $EMPTY_RESPONSE | python -m json.tool 2>/dev/null || echo $EMPTY_RESPONSE

echo -e "\n================================"
echo "Test completed!"