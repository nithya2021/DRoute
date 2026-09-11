#!/usr/bin/env node

/**
 * DRoute API Testing Script
 * Run: node test-api.js
 *
 * Tests all API endpoints and verifies responses
 */

const http = require('http');

const API_URL = 'http://localhost:3001';
let passed = 0;
let failed = 0;

// Utility function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// Test function
async function test(name, method, path, data = null, expectedStatus = 200) {
  process.stdout.write(`Testing: ${name}... `);
  try {
    const response = await makeRequest(method, path, data);

    if (response.status === expectedStatus) {
      console.log('✅ PASS');
      passed++;
      return response.body;
    } else {
      console.log(`❌ FAIL (Expected ${expectedStatus}, got ${response.status})`);
      console.log(`   Response: ${JSON.stringify(response.body)}`);
      failed++;
      return null;
    }
  } catch (error) {
    // error.message is empty for some socket failures, and a bare "Error:"
    // says nothing about whether the server is down or the request was bad.
    const detail = error.code || error.message || 'no error detail available';
    console.log(`❌ FAIL (${detail})`);
    if (error.code === 'ECONNREFUSED') {
      console.log(`   Nothing is listening on ${API_URL} — is the server running?`);
    }
    failed++;
    return null;
  }
}

// Main test suite
async function runTests() {
  console.log('🧪 DRoute API Testing Suite');
  console.log('=====================================\n');

  // 1. Health Check
  console.log('1️⃣  HEALTH CHECK');
  console.log('---');
  await test('Health endpoint', 'GET', '/health');
  console.log();

  // 2. Drivers
  console.log('2️⃣  DRIVERS ENDPOINT');
  console.log('---');
  const drivers = await test('Get all drivers', 'GET', '/api/drivers');
  if (drivers && Array.isArray(drivers)) {
    console.log(`   Found ${drivers.length} drivers`);
  }
  await test('Get driver 1', 'GET', '/api/drivers/driver_1');
  await test('Get driver 1 routes', 'GET', '/api/drivers/driver_1/routes');
  console.log();

  // 3. Routes
  console.log('3️⃣  ROUTES ENDPOINT');
  console.log('---');
  const routes = await test('Get all routes', 'GET', '/api/optimization/routes');
  if (routes && Array.isArray(routes)) {
    console.log(`   Found ${routes.length} routes`);
  }
  console.log();

  // 4. Import Jobs
  console.log('4️⃣  IMPORT JOBS');
  console.log('---');
  const jobs = await test('Get import jobs', 'GET', '/api/import/jobs');
  if (jobs && Array.isArray(jobs)) {
    console.log(`   Found ${jobs.length} import jobs`);
  }
  console.log();

  // 5. Error Cases
  console.log('5️⃣  ERROR HANDLING');
  console.log('---');
  await test('Invalid route (404)', 'GET', '/api/routes/invalid_id', null, 404);
  await test('Invalid driver (404)', 'GET', '/api/drivers/invalid_id', null, 404);
  console.log();

  // 6. Route Status Update
  console.log('6️⃣  ROUTE STATUS UPDATE');
  console.log('---');
  if (routes && routes.length > 0) {
    const routeId = routes[0].id;
    await test(
      `Update route ${routeId} status`,
      'PATCH',
      `/api/routes/${routeId}`,
      { status: 'in-progress' }
    );
  } else {
    console.log('⚠️  No routes found for testing status update');
  }
  console.log();

  // Summary
  console.log('=====================================');
  console.log('Test Results:');
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log('=====================================');

  if (failed === 0) {
    console.log('\n✅ All tests passed!\n');
    process.exit(0);
  } else {
    console.log(`\n❌ ${failed} test(s) failed\n`);
    process.exit(1);
  }
}

// Run tests
console.log('Connecting to API at:', API_URL);
console.log('');

// Give server 2 seconds to be ready
setTimeout(runTests, 2000);
