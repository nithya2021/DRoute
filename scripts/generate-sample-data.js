#!/usr/bin/env node

/**
 * Generate sample delivery data for testing DRoute
 * Usage: node scripts/generate-sample-data.js
 */

const fs = require('fs');
const path = require('path');

// Singapore postal codes and areas
const singaporeAreas = [
  { area: 'Marina Bay', postalCode: '018953', lat: 1.2832, lng: 103.8589 },
  { area: 'Changi Airport', postalCode: '039802', lat: 1.3763, lng: 103.8479 },
  { area: 'Tampines', postalCode: '456318', lat: 1.3450, lng: 103.9630 },
  { area: 'Bedok', postalCode: '520098', lat: 1.3900, lng: 103.8900 },
  { area: 'Bukit Merah', postalCode: '640084', lat: 1.2800, lng: 103.7550 },
  { area: 'Clementi', postalCode: '678568', lat: 1.3800, lng: 103.7800 },
  { area: 'Queenstown', postalCode: '737570', lat: 1.3300, lng: 103.7900 },
  { area: 'CBD', postalCode: '308649', lat: 1.2900, lng: 103.8350 },
  { area: 'Novena', postalCode: '307623', lat: 1.3710, lng: 103.8341 },
  { area: 'Orchard', postalCode: '238843', lat: 1.3521, lng: 103.8341 },
];

const streets = [
  'Main Street',
  'Parkway',
  'Avenue',
  'Boulevard',
  'Drive',
  'Street',
  'Road',
  'Lane',
  'Court',
  'Plaza',
];

const customerNames = [
  'John Lim',
  'Sarah Tan',
  'Ahmed Hassan',
  'Lisa Wong',
  'Rajesh Kumar',
  'Michelle Chua',
  'David Chen',
  'Priya Nair',
  'Benny Lee',
  'Sophie Ng',
];

function generateSampleData(count = 100) {
  const data = [];

  for (let i = 0; i < count; i++) {
    const area = singaporeAreas[i % singaporeAreas.length];
    const street = streets[Math.floor(Math.random() * streets.length)];
    const building = Math.floor(Math.random() * 999) + 1;

    data.push({
      address: `${building} ${street}, ${area.area}, Singapore`,
      postalCode: area.postalCode,
      customerName: customerNames[i % customerNames.length] + (i > 0 ? ` #${i}` : ''),
      contactNumber: `658${String(1000000 + Math.floor(Math.random() * 9000000)).slice(-7)}`,
      notes: Math.random() > 0.7 ? 'Please deliver after 6pm' : '',
    });
  }

  return data;
}

function saveAsJSON(data, filename) {
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  console.log(`✓ Sample data saved to ${filename}`);
}

function saveAsCSV(data, filename) {
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header] || '';
          return typeof value === 'string' && value.includes(',')
            ? `"${value}"`
            : value;
        })
        .join(',')
    ),
  ].join('\n');

  fs.writeFileSync(filename, csv);
  console.log(`✓ Sample data saved to ${filename}`);
}

// Create samples directory if it doesn't exist
const samplesDir = path.join(__dirname, '../samples');
if (!fs.existsSync(samplesDir)) {
  fs.mkdirSync(samplesDir, { recursive: true });
}

// Generate data
const sampleData = generateSampleData(100);

// Save formats
saveAsJSON(sampleData, path.join(samplesDir, 'sample-data.json'));
saveAsCSV(sampleData, path.join(samplesDir, 'sample-data.csv'));

console.log('\n📊 Sample data generation complete!');
console.log(`Generated ${sampleData.length} sample delivery records`);
console.log(`\nTo use this data:`);
console.log(`1. Convert CSV to Excel (.xlsx) using your preferred tool`);
console.log(`2. Upload the Excel file via the DRoute UI`);
