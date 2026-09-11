#!/usr/bin/env node

/**
 * DRoute API test
 *
 *   node test-api.js [path-to-spreadsheet.xlsx]
 *
 * Defaults to sample-deliveries.xlsx. Writes the optimised route beside it.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const API_URL = process.env.API_URL || 'http://localhost:3001';
const inputFile = process.argv[2] || path.join(__dirname, 'sample-deliveries.xlsx');

let passed = 0;
let failed = 0;

function pass(name, detail) {
  console.log(`  ${name}... PASS${detail ? ` — ${detail}` : ''}`);
  passed++;
}

function fail(name, detail) {
  console.log(`  ${name}... FAIL — ${detail}`);
  failed++;
}

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () =>
        resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) })
      );
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function multipartBody(filePath) {
  const boundary = `----droute${Date.now()}`;
  const head = Buffer.from(
    `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${path.basename(filePath)}"\r\n` +
      `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\r\n\r\n`
  );
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`);
  return { boundary, payload: Buffer.concat([head, fs.readFileSync(filePath), tail]) };
}

async function run() {
  console.log(`DRoute API test against ${API_URL}\n`);

  console.log('Health');
  try {
    const res = await request({ hostname: 'localhost', port: 3001, path: '/health', method: 'GET' });
    res.status === 200
      ? pass('GET /health', JSON.parse(res.body).status)
      : fail('GET /health', `expected 200, got ${res.status}`);
  } catch (error) {
    fail('GET /health', error.code === 'ECONNREFUSED' ? `nothing listening on ${API_URL}` : error.message);
    console.log('\nThe server is not running. Start it with: npm run dev\n');
    process.exit(1);
  }

  console.log('\nRoute optimisation');
  if (!fs.existsSync(inputFile)) {
    fail('POST /api/route', `input file not found: ${inputFile}`);
  } else {
    const { boundary, payload } = multipartBody(inputFile);
    const res = await request(
      {
        hostname: 'localhost',
        port: 3001,
        path: '/api/route',
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': payload.length,
        },
      },
      payload
    );

    if (res.status !== 200) {
      fail('POST /api/route', `expected 200, got ${res.status}: ${res.body.toString().slice(0, 200)}`);
    } else {
      pass('POST /api/route', `${res.body.length} bytes`);

      const isSpreadsheet = res.body.slice(0, 2).toString() === 'PK';
      isSpreadsheet
        ? pass('response is a workbook')
        : fail('response is a workbook', 'missing zip signature');

      const disposition = res.headers['content-disposition'] || '';
      disposition.includes('.xlsx')
        ? pass('filename offered', disposition.split('filename=')[1])
        : fail('filename offered', `got "${disposition}"`);

      const outputFile = path.join(path.dirname(inputFile), 'optimised-route-test.xlsx');
      fs.writeFileSync(outputFile, res.body);
      pass('saved output', outputFile);
    }
  }

  console.log('\nInput validation');
  const res = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/route',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': 0 },
  });
  res.status === 400
    ? pass('POST /api/route with no file rejected', '400')
    : fail('POST /api/route with no file rejected', `expected 400, got ${res.status}`);

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

run().catch((error) => {
  console.error('\nTest run failed:', error.message);
  process.exit(1);
});
