import { utils, write } from 'xlsx';
import { DeliveryStop, SkippedRow, buildMapsLegs } from '@droute/shared';
import { SingleRoute } from './route-optimizer';

function mapsLink(stop: DeliveryStop): string {
  const { latitude, longitude } = stop.coordinates;
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
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

  for (const leg of buildMapsLegs(route.stops)) {
    rows.push([`Open in Maps (stops ${leg.firstStop}-${leg.lastStop})`, leg.url]);
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
    'Google Maps',
  ]);

  let cumulative = 0;
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
      mapsLink(stop),
    ]);
  });

  const sheet = utils.aoa_to_sheet(rows);
  sheet['!cols'] = [
    { wch: 6 },
    { wch: 20 },
    { wch: 56 },
    { wch: 12 },
    { wch: 14 },
    { wch: 22 },
    { wch: 10 },
    { wch: 16 },
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
