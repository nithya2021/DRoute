import { Router, Request, Response } from 'express';
import multer from 'multer';
import XLSX from 'xlsx';
import { supabaseStore } from '../services/supabase-store';
import { tspSolver } from '../utils/tsp-solver';
import { osrmService } from '../services/osrm-routing';
import { DeliveryStop } from '@droute/shared';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const batchId = `batch_${Date.now()}`;
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet) as Array<{
      NAME: string;
      ADDRESS: string;
    }>;

    if (data.length === 0) {
      return res.status(400).json({ error: 'No data in Excel file' });
    }

    await supabaseStore.createUploadJob(batchId, req.file.originalname, data.length);

    let processedCount = 0;
    for (const row of data) {
      try {
        const stop: DeliveryStop = {
          id: `address_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          address: row.ADDRESS,
          postalCode: '',
          customerName: row.NAME,
          coordinates: {
            latitude: 1.3521,
            longitude: 103.8198,
          },
        };

        await supabaseStore.addAddress(stop, batchId);
        processedCount++;
      } catch (error) {
        console.error('Error processing row:', error);
      }
    }

    await supabaseStore.updateUploadJob(batchId, 'completed', processedCount);

    res.json({
      batchId,
      totalRecords: data.length,
      processedRecords: processedCount,
      addresses: data.map((d) => d.NAME),
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

router.get('/addresses/:batchId', async (req: Request, res: Response) => {
  try {
    const addresses = await supabaseStore.getAddressesByBatch(req.params.batchId);

    res.json({
      batchId: req.params.batchId,
      addresses: addresses.map((a) => ({
        id: a.id,
        name: a.customerName,
        address: a.address,
      })),
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

router.post('/calculate-route', async (req: Request, res: Response) => {
  try {
    const { batchId, sourceId, destinationId } = req.body;

    if (!batchId || !sourceId || !destinationId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const addresses = await supabaseStore.getAddressesByBatch(batchId);

    const sourceStop = addresses.find((a) => a.id === sourceId);
    const destinationStop = addresses.find((a) => a.id === destinationId);

    if (!sourceStop || !destinationStop) {
      return res.status(404).json({ error: 'Source or destination address not found' });
    }

    const result = await tspSolver.solveWithFixedStartEnd(addresses, sourceStop, destinationStop);

    const routeId = await supabaseStore.saveRouteCalculation(
      batchId,
      sourceId,
      destinationId,
      result.orderedStops.map((s) => s.id),
      result.totalDistance,
      result.totalDuration
    );

    res.json({
      routeId,
      totalDistance: result.totalDistance.toFixed(2),
      totalDuration: result.totalDuration,
      stops: result.orderedStops.length,
    });
  } catch (error) {
    console.error('Error calculating route:', error);
    res.status(500).json({ error: 'Failed to calculate route' });
  }
});

router.get('/download/:routeId', async (req: Request, res: Response) => {
  try {
    const routeData = await supabaseStore.getRouteCalculation(req.params.routeId);

    if (!routeData) {
      return res.status(404).json({ error: 'Route not found' });
    }

    const addresses = await supabaseStore.getAddressesByBatch(routeData.batchId);
    const addressMap = new Map(addresses.map((a) => [a.id, a]));

    const rows: any[] = [];
    let cumulativeDistance = 0;

    for (let i = 0; i < routeData.orderedStopIds.length; i++) {
      const addressId = routeData.orderedStopIds[i];
      const address = addressMap.get(addressId);

      if (address) {
        const prevAddress = i > 0 ? addressMap.get(routeData.orderedStopIds[i - 1]) : null;

        let distanceFromPrevious = 0;
        if (prevAddress) {
          distanceFromPrevious = await osrmService.calculateDistance(prevAddress, address);
          cumulativeDistance += distanceFromPrevious;
        }

        rows.push({
          'Stop #': i + 1,
          Name: address.customerName,
          Address: address.address,
          Latitude: address.coordinates.latitude,
          Longitude: address.coordinates.longitude,
          'Distance from Previous (km)': distanceFromPrevious.toFixed(2),
          'Cumulative Distance (km)': cumulativeDistance.toFixed(2),
        });
      }
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Route');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="route_${req.params.routeId}.xlsx"`);

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.send(buffer);
  } catch (error) {
    console.error('Error downloading route:', error);
    res.status(500).json({ error: 'Failed to download route' });
  }
});

export const shortestRouteRouter = router;
