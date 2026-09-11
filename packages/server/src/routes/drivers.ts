import { Router, Request, Response } from 'express';
import { supabaseStore } from '../services/supabase-store';
import { serverError } from './error-response';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    res.json(await supabaseStore.getAllDrivers());
  } catch (error) {
    serverError(res, 'Failed to fetch drivers', error);
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const driver = await supabaseStore.getDriver(req.params.id);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    serverError(res, 'Failed to fetch driver', error);
  }
});

router.get('/:id/routes', async (req: Request, res: Response) => {
  try {
    const driver = await supabaseStore.getDriver(req.params.id);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(await supabaseStore.getRoutesByDriver(req.params.id));
  } catch (error) {
    serverError(res, 'Failed to fetch driver routes', error);
  }
});

export const driverRoutes = router;
