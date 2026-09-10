import { Router, Request, Response } from 'express';
import { dataStore } from '../services/data-store';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const drivers = dataStore.getAllDrivers();
  res.json(drivers);
});

router.get('/:id', (req: Request, res: Response) => {
  const driver = dataStore.getDriver(req.params.id);

  if (!driver) {
    return res.status(404).json({ error: 'Driver not found' });
  }

  res.json(driver);
});

router.get('/:id/routes', (req: Request, res: Response) => {
  const driver = dataStore.getDriver(req.params.id);

  if (!driver) {
    return res.status(404).json({ error: 'Driver not found' });
  }

  const routes = dataStore.getRoutesByDriver(req.params.id);
  res.json(routes);
});

export const driverRoutes = router;
