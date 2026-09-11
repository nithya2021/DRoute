import { Router, Request, Response } from 'express';
import multer from 'multer';
import { parseExcelFile } from '../utils/excel-parser';
import { optimizeSingleRoute } from '../utils/route-optimizer';
import { buildSingleRouteWorkbook } from '../utils/excel-export';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload a spreadsheet of addresses, get one optimised route back as a
// spreadsheet. Nothing is stored.
router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { stops, skipped } = await parseExcelFile(req.file.buffer);
    if (stops.length === 0) {
      return res.status(400).json({
        error: 'No deliverable addresses found in the file',
        details: 'Every row was missing a six-digit postal code.',
        skipped: skipped.slice(0, 20),
      });
    }

    const workbook = buildSingleRouteWorkbook(optimizeSingleRoute(stops), skipped);
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
