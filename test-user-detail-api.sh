#!/bin/bash

# Test User Detail API
# B03 user detail API for admin panel

echo "Testing User Detail API..."

# Login as admin first
echo "1. Admin login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin123",
    "password": "admin123"
  }')

echo "Login response: $LOGIN_RESPONSE"

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ -z "$TOKEN" ]; then
  echo "Failed to get token. Login response: $LOGIN_RESPONSE"
  exit 1
fi

echo "Token obtained: $TOKEN"

# Test user detail API
USER_ID=1  # Test with user ID 1
echo -e "\n2. Testing GET /admin/user/$USER_ID/detail..."
curl -X GET "http://localhost:8080/admin/user/$USER_ID/detail" \
  -H "X-Litemall-Admin-Token: $TOKEN" \
  -H "Content-Type: application/json" | jq .

# Test with non-existent user
echo -e "\n3. Testing with non-existent user (ID: 99999)..."
curl -X GET "http://localhost:8080/admin/user/99999/detail" \
  -H "X-Litemall-Admin-Token: $TOKEN" \
  -H "Content-Type: application/json" | jq .

# Test without token (should fail)
echo -e "\n4. Testing without token (should fail)..."
curl -X GET "http://localhost:8080/admin/user/$USER_ID/detail" \
  -H "Content-Type: application/json" | jq .

echo -e "\nTest completed!"