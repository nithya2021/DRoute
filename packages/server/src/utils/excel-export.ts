import { utils, write } from 'xlsx';
import { SkippedRow, buildMapsLegs, Coordinate, LocationSource } from '@droute/shared';
import { SingleRoute } from './route-optimizer';

function mapsLink(coordinates: Coordinate): string {
  return `https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}`;
}

// A driver needs to know when a pin is the building versus somewhere in the
// right district, because an approximate stop is one they should read the
// address for rather than trust the map.
function locationLabel(source?: LocationSource): string {
  if (source === 'onemap') return 'Exact';
  if (source === 'district') return 'Approx (district)';
  return 'Unknown';
}

export function buildSingleRouteWorkbook(route: SingleRoute, skipped: SkippedRow[]): Buffer {
  const book = utils.book_new();

  const rows: (string | number)[][] = [
    ['Optimised Delivery Route'],
    [
      `${route.stops.length} stops`,
      `${route.totalDistance.toFixed(2)} km total`,
      `${route.estimatedDuration} min estimated`,
    ],
    [],
  ];

  if (route.origin) {
    rows.push(['Start', route.origin.address]);
  }
  if (route.destination) {
    rows.push(['End', route.destination.address]);
  }
  if (route.origin || route.destination) {
    rows.push([]);
  }

  // Maps needs the endpoints in the chain, not just the deliveries, or it
  // routes from the first delivery instead of where the driver actually starts.
  const mapPoints = [
    ...(route.origin ? [route.origin] : []),
    ...route.stops,
    ...(route.destination ? [route.destination] : []),
  ];
  for (const leg of buildMapsLegs(mapPoints)) {
    rows.push([`Open in Maps (points ${leg.firstStop}-${leg.lastStop})`, leg.url]);
  }

  rows.push([]);
  rows.push([
    'Stop',
    'Customer',
    'Address',
    'Postal Code',
    'Contact',
    'Notes',
    'Leg (km)',
    'Cumulative (km)',
    'Location',
    'Google Maps',
  ]);

  let cumulative = 0;

  if (route.origin) {
    rows.push([
      'Start',
      '',
      route.origin.address,
      route.origin.postalCode,
      '',
      '',
      0,
      0,
      locationLabel(route.origin.locationSource),
      mapsLink(route.origin.coordinates),
    ]);
  }

  route.stops.forEach((stop, index) => {
    cumulative += route.legDistances[index];
    rows.push([
      index + 1,
      stop.customerName,
      stop.address,
      stop.postalCode,
      stop.contactNumber ?? '',
      stop.notes ?? '',
      Number(route.legDistances[index].toFixed(2)),
      Number(cumulative.toFixed(2)),
      locationLabel(stop.locationSource),
      mapsLink(stop.coordinates),
    ]);
  });

  if (route.destination) {
    cumulative += route.finalLeg;
    rows.push([
      'End',
      '',
      route.destination.address,
      route.destination.postalCode,
      '',
      '',
      Number(route.finalLeg.toFixed(2)),
      Number(cumulative.toFixed(2)),
      locationLabel(route.destination.locationSource),
      mapsLink(route.destination.coordinates),
    ]);
  }

  const sheet = utils.aoa_to_sheet(rows);
  sheet['!cols'] = [
    { wch: 7 },
    { wch: 20 },
    { wch: 56 },
    { wch: 12 },
    { wch: 14 },
    { wch: 22 },
    { wch: 10 },
    { wch: 16 },
    { wch: 18 },
    { wch: 46 },
  ];
  utils.book_append_sheet(book, sheet, 'Route');

  // Rows that could not be placed are listed rather than dropped: silently
  // losing a delivery is worse than importing none.
  const skippedRows: (string | number)[][] = [['Excel Row', 'Cell Contents', 'Reason']];
  for (const row of skipped) {
    skippedRows.push([row.row, row.value, row.reason]);
  }
  const skippedSheet = utils.aoa_to_sheet(skippedRows);
  skippedSheet['!cols'] = [{ wch: 10 }, { wch: 62 }, { wch: 28 }];
  utils.book_append_sheet(book, skippedSheet, 'Not Routed');

  return write(book, { type: 'buffer', bookType: 'xlsx' });
}
