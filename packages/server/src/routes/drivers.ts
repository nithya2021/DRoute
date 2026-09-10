import { Router, Request, Response } from 'express';
import { supabaseStore } from '../services/supabase-store';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const drivers = await supabaseStore.getAllDrivers();
    res.json(drivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ error: 'Failed to fetch drivers' });
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
    console.error('Error fetching driver:', error);
    res.status(500).json({ error: 'Failed to fetch driver' });
  }
});

router.get('/:id/routes', async (req: Request, res: Response) => {
  try {
    const driver = await supabaseStore.getDriver(req.params.id);

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const routes = await supabaseStore.getRoutesByDriver(req.params.id);
    res.json(routes);
  } catch (error) {
    console.error('Error fetching driver routes:', error);
    res.status(500).json({ error: 'Failed to fetch driver routes' });
  }
});

export const driverRoutes = router;
