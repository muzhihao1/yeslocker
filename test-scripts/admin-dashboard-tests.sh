#!/bin/bash

# Admin Dashboard API Test Scripts
# Usage: ./admin-dashboard-tests.sh [base_url] [admin_token]

# Default values
BASE_URL=${1:-"http://localhost:8080"}
ADMIN_TOKEN=${2:-"your-admin-jwt-token"}

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Admin Dashboard API Tests ===${NC}"
echo "Base URL: $BASE_URL"
echo "Using token: ${ADMIN_TOKEN:0:20}..."
echo ""

# Function to make API call and pretty print response
make_request() {
    local method=$1
    local endpoint=$2
    local description=$3
    
    echo -e "${BLUE}Test: ${description}${NC}"
    echo "Endpoint: $method $endpoint"
    
    response=$(curl -s -X $method \
        "${BASE_URL}${endpoint}" \
        -H "X-Litemall-Admin-Token: ${ADMIN_TOKEN}" \
        -H "Content-Type: application/json")
    
    # Check if response is valid JSON
    if echo "$response" | jq . >/dev/null 2>&1; then
        errno=$(echo "$response" | jq -r '.errno')
        if [ "$errno" = "0" ]; then
            echo -e "${GREEN}✓ Success${NC}"
        else
            echo -e "${RED}✗ Failed - errno: $errno${NC}"
        fi
        echo "$response" | jq '.'
    else
        echo -e "${RED}✗ Invalid JSON response${NC}"
        echo "$response"
    fi
    echo ""
}

# Test 1: Dashboard Summary
make_request "GET" "/admin/dashboard/summary" "Dashboard Summary"

# Test 2: Revenue Statistics (default last 30 days)
make_request "GET" "/admin/dashboard/revenue" "Revenue Statistics (Default)"

# Test 3: Revenue Statistics with date range
make_request "GET" "/admin/dashboard/revenue?startDate=2024-01-01&endDate=2024-01-31" "Revenue Statistics (January 2024)"

# Test 4: Usage Analytics - Day
make_request "GET" "/admin/dashboard/usage?period=day" "Usage Analytics (Day)"

# Test 5: Usage Analytics - Week
make_request "GET" "/admin/dashboard/usage?period=week" "Usage Analytics (Week)"

# Test 6: Usage Analytics - Month
make_request "GET" "/admin/dashboard/usage?period=month" "Usage Analytics (Month)"

# Test 7: Trends - User Growth (7 days)
make_request "GET" "/admin/dashboard/trends?type=user&days=7" "User Growth Trends (7 days)"

# Test 8: Trends - Operations (30 days)
make_request "GET" "/admin/dashboard/trends?type=operation&days=30" "Operation Trends (30 days)"

# Test 9: Trends - Revenue (14 days)
make_request "GET" "/admin/dashboard/trends?type=revenue&days=14" "Revenue Trends (14 days)"

# Test 10: Invalid period parameter
make_request "GET" "/admin/dashboard/usage?period=invalid" "Usage Analytics (Invalid Period)"

# Test 11: Invalid type parameter
make_request "GET" "/admin/dashboard/trends?type=invalid" "Trends (Invalid Type)"

# Test 12: Excessive days parameter
make_request "GET" "/admin/dashboard/trends?type=operation&days=100" "Trends (Excessive Days)"

echo -e "${BLUE}=== Test Summary ===${NC}"
echo "All tests completed. Check the responses above for any errors."
echo ""
echo "To run specific tests, you can copy individual curl commands:"
echo "curl -X GET \"${BASE_URL}/admin/dashboard/summary\" -H \"X-Litemall-Admin-Token: ${ADMIN_TOKEN}\" | jq"