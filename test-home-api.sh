#!/bin/bash

echo "Testing YesLocker Home Page APIs"
echo "================================"

# Base URL for the backend
BASE_URL="http://localhost:8080/wx"

# Test token (you may need to update this with a valid token)
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTczNzkzMDAwMCwiZXhwIjoxNzM4NTM0ODAwfQ.test"

echo -e "\n1. Testing getMyLocker API:"
curl -X GET "${BASE_URL}/locker/my-locker" \
  -H "X-Litemall-Token: ${TOKEN}" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n\n2. Testing getMyVouchers API (active vouchers):"
curl -X GET "${BASE_URL}/voucher/list?status=active&limit=1" \
  -H "X-Litemall-Token: ${TOKEN}" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n\n3. Testing getActiveRequest API:"
curl -X GET "${BASE_URL}/storage/active-request" \
  -H "X-Litemall-Token: ${TOKEN}" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n\nDone!"