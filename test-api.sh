#!/bin/bash

# DRoute API Test Suite
# Run this script to test all endpoints automatically

echo "🧪 DRoute API Testing Suite"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:3001"
PASSED=0
FAILED=0

# Test function
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4

    echo -n "Testing: $name ... "

    if [ "$method" = "GET" ]; then
        response=$(curl -s "$API_URL$endpoint")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -X POST "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi

    if echo "$response" | grep -q "error"; then
        echo -e "${RED}FAIL${NC}"
        echo "  Response: $response"
        ((FAILED++))
    else
        echo -e "${GREEN}PASS${NC}"
        ((PASSED++))
    fi
    echo ""
}

# 1. Health Check
echo "1️⃣  HEALTH CHECK"
echo "---"
test_endpoint "Health endpoint" "GET" "/health"

# 2. Drivers
echo "2️⃣  DRIVERS ENDPOINT"
echo "---"
test_endpoint "Get all drivers" "GET" "/api/drivers"
test_endpoint "Get driver 1" "GET" "/api/drivers/driver_1"
test_endpoint "Get driver 1 routes" "GET" "/api/drivers/driver_1/routes"

# 3. Routes
echo "3️⃣  ROUTES ENDPOINT"
echo "---"
test_endpoint "Get all routes" "GET" "/api/optimization/routes"

# 4. Import Jobs
echo "4️⃣  IMPORT JOBS"
echo "---"
test_endpoint "Get import jobs" "GET" "/api/import/jobs"

# 5. Error Cases
echo "5️⃣  ERROR HANDLING"
echo "---"
test_endpoint "Invalid route (404)" "GET" "/api/routes/invalid_id"
test_endpoint "Invalid driver (404)" "GET" "/api/drivers/invalid_id"

# Summary
echo "=================================="
echo "Test Results:"
echo -e "  ${GREEN}Passed: $PASSED${NC}"
echo -e "  ${RED}Failed: $FAILED${NC}"
echo "=================================="

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
