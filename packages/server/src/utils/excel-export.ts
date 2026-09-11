import { utils, write } from 'xlsx';
import { Route, Driver, DeliveryStop } from '@droute/shared';

function mapsLink(stop: DeliveryStop): string {
  const { latitude, longitude } = stop.coordinates;
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

// Excel rejects sheet names over 31 characters or containing : \ / ? * [ ]
function safeSheetName(name: string, fallback: string): string {
  const cleaned = name.replace(/[:\\/?*[\]]/g, ' ').trim();
  return cleaned ? cleaned.slice(0, 31) : fallback;
}

function summarySheet(routes: Route[], driverById: Map<string, Driver>) {
  const rows: (string | number)[][] = [
    ['Driver', 'Vehicle', 'Phone', 'Stops', 'Distance (km)', 'Est. Duration (min)', 'Status'],
  ];

  for (const route of routes) {
    const driver = driverById.get(route.driverId);
    rows.push([
      driver?.name ?? route.driverId,
      driver?.vehicleNumber ?? '',
      driver?.phoneNumber ?? '',
      route.stops.length,
      Number(route.totalDistance.toFixed(2)),
      route.estimatedDuration,
      route.status,
    ]);
  }

  const totalStops = routes.reduce((sum, r) => sum + r.stops.length, 0);
  const totalDistance = routes.reduce((sum, r) => sum + r.totalDistance, 0);
  rows.push([]);
  rows.push(['TOTAL', '', '', totalStops, Number(totalDistance.toFixed(2)), '', '']);

  const sheet = utils.aoa_to_sheet(rows);
  sheet['!cols'] = [{ wch: 16 }, { wch: 10 }, { wch: 14 }, { wch: 8 }, { wch: 14 }, { wch: 18 }, { wch: 12 }];
  return sheet;
}

function driverSheet(route: Route, driver: Driver | undefined) {
  const name = driver?.name ?? route.driverId;
  const rows: (string | number)[][] = [
    [`Driver: ${name}`, driver?.vehicleNumber ?? '', driver?.phoneNumber ?? ''],
    [
      `${route.stops.length} stops`,
      `${route.totalDistance.toFixed(2)} km`,
      `${route.estimatedDuration} min`,
      `Status: ${route.status}`,
    ],
    [],
    ['Stop', 'Customer', 'Address', 'Postal Code', 'Contact', 'Notes', 'Google Maps'],
  ];

  route.stops.forEach((stop, index) => {
    rows.push([
      index + 1,
      stop.customerName,
      stop.address,
      stop.postalCode,
      stop.contactNumber ?? '',
      stop.notes ?? '',
      mapsLink(stop),
    ]);
  });

  const sheet = utils.aoa_to_sheet(rows);
  sheet['!cols'] = [
    { wch: 6 },
    { wch: 20 },
    { wch: 52 },
    { wch: 12 },
    { wch: 14 },
    { wch: 24 },
    { wch: 46 },
  ];
  return sheet;
}

export function buildRoutesWorkbook(routes: Route[], drivers: Driver[]): Buffer {
  const driverById = new Map(drivers.map((d) => [d.id, d]));
  const book = utils.book_new();

  utils.book_append_sheet(book, summarySheet(routes, driverById), 'Summary');

  const usedNames = new Set(['Summary']);
  routes.forEach((route, index) => {
    const driver = driverById.get(route.driverId);
    let name = safeSheetName(driver?.name ?? route.driverId, `Route ${index + 1}`);

    // Two drivers can share a name; Excel will not accept duplicate sheets.
    let suffix = 2;
    while (usedNames.has(name)) {
      name = `${name.slice(0, 28)} ${suffix++}`;
    }
    usedNames.add(name);

    utils.book_append_sheet(book, driverSheet(route, driver), name);
  });

  return write(book, { type: 'buffer', bookType: 'xlsx' });
}
