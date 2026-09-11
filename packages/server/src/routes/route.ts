import { Router, Request, Response } from 'express';
import multer from 'multer';
import { parseExcelFile, extractPostalCode } from '../utils/excel-parser';
import { geocodeAddress, isKnownPostalDistrict } from '../utils/geocoding';
import { optimizeSingleRoute, Waypoint } from '../utils/route-optimizer';
import { buildSingleRouteWorkbook } from '../utils/excel-export';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

class EndpointError extends Error {}

// The start and end are typed by hand rather than read from the sheet, so the
// postal code has to be pulled out of whatever the user wrote.
async function toWaypoint(raw: unknown, label: string): Promise<Waypoint | undefined> {
  const address = typeof raw === 'string' ? raw.trim() : '';
  if (!address) {
    return undefined;
  }

  const postalCode = extractPostalCode(address);
  if (!postalCode) {
    throw new EndpointError(
      `The ${label} needs a six-digit Singapore postal code. Received "${address}".`
    );
  }

  if (!isKnownPostalDistrict(postalCode)) {
    throw new EndpointError(
      `Postal code ${postalCode} in the ${label} is not a recognised Singapore district.`
    );
  }

  return { address, postalCode, coordinates: await geocodeAddress(address, postalCode) };
}

router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let origin: Waypoint | undefined;
    let destination: Waypoint | undefined;
    try {
      origin = await toWaypoint(req.body?.origin, 'start point');
      destination = await toWaypoint(req.body?.destination, 'end point');
    } catch (error) {
      if (error instanceof EndpointError) {
        return res.status(400).json({ error: 'Invalid start or end point', details: error.message });
      }
      throw error;
    }

    const { stops, skipped } = await parseExcelFile(req.file.buffer);
    if (stops.length === 0) {
      return res.status(400).json({
        error: 'No deliverable addresses found in the file',
        details: 'Every row was missing a six-digit postal code.',
        skipped: skipped.slice(0, 20),
      });
    }

    const route = optimizeSingleRoute(stops, { origin, destination });
    const workbook = buildSingleRouteWorkbook(route, skipped);
    const filename = `optimised-route-${new Date().toISOString().slice(0, 10)}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(workbook);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Failed to build optimised route]', message);
    res.status(500).json({ error: 'Failed to build optimised route', details: message });
  }
});

export const routeRoutes = router;
