import { Router, Request, Response } from 'express';
import multer from 'multer';
import { parseExcelFile } from '../utils/excel-parser';
import { supabaseStore } from '../services/supabase-store';
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

    // Parse Excel file
    const stops = await parseExcelFile(req.file.buffer);
    job.totalStops = stops.length;
    job.processedStops = stops.length;
    job.status = 'completed';
    job.completedAt = new Date();

    // Clear existing stops and add new ones
    await supabaseStore.clearStops();
    await supabaseStore.addStops(stops);

    await supabaseStore.updateImportJob(jobId, job);

    res.json({
      jobId,
      message: 'File imported successfully',
      stopsCount: stops.length,
    });
  } catch (error) {
    console.error('Import error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';

    res.status(500).json({
      error: 'Failed to process file',
      details: message,
    });
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
    console.error('Error fetching import job:', error);
    res.status(500).json({ error: 'Failed to fetch import job' });
  }
});

router.get('/jobs', async (req: Request, res: Response) => {
  try {
    const jobs = await supabaseStore.getAllImportJobs();
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching import jobs:', error);
    res.status(500).json({ error: 'Failed to fetch import jobs' });
  }
});

export const importRoutes = router;
