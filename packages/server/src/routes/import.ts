import { Router, Request, Response } from 'express';
import multer from 'multer';
import { parseExcelFile } from '../utils/excel-parser';
import { supabaseStore } from '../services/supabase-store';
import { serverError } from './error-response';
import { ImportJob } from '@droute/shared';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/excel', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const jobId = `import_${Date.now()}`;
    const job: ImportJob = {
      id: jobId,
      filename: req.file.originalname,
      totalStops: 0,
      processedStops: 0,
      status: 'processing',
      createdAt: new Date(),
    };

    await supabaseStore.addImportJob(job);

    const { stops, skipped } = await parseExcelFile(req.file.buffer);
    job.totalStops = stops.length;
    job.processedStops = stops.length;
    job.skippedRows = skipped;
    job.status = 'completed';
    job.completedAt = new Date();

    await supabaseStore.clearStops();
    await supabaseStore.addStops(stops);
    await supabaseStore.updateImportJob(jobId, job);

    res.json({
      jobId,
      message: 'File imported successfully',
      stopsCount: stops.length,
      skippedCount: skipped.length,
      skipped: skipped.slice(0, 20),
    });
  } catch (error) {
    serverError(res, 'Failed to process file', error);
  }
});

router.get('/jobs/:id', async (req: Request, res: Response) => {
  try {
    const job = await supabaseStore.getImportJob(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    serverError(res, 'Failed to fetch import job', error);
  }
});

router.get('/jobs', async (req: Request, res: Response) => {
  try {
    res.json(await supabaseStore.getAllImportJobs());
  } catch (error) {
    serverError(res, 'Failed to fetch import jobs', error);
  }
});

export const importRoutes = router;
