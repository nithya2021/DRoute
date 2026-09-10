import { Router, Request, Response } from 'express';
import { optimizeRoutes } from '../utils/route-optimizer';
import { optimizeRoutesWithOSRM } from '../utils/osrm-route-optimizer';
import { supabaseStore } from '../services/supabase-store';
import { OptimizationResult } from '@droute/shared';

const router = Router();

router.post('/optimize', async (req: Request, res: Response) => {
  try {
    const stops = await supabaseStore.getAllStops();

    if (stops.length === 0) {
      return res.status(400).json({ error: 'No delivery stops available for optimization' });
    }

    const drivers = await supabaseStore.getAllDrivers();
    const activeDrivers = drivers.filter((d) => d.status === 'active');

    if (activeDrivers.length === 0) {
      return res.status(400).json({ error: 'No active drivers available' });
    }

    // Optimize routes
    const routes = optimizeRoutes(stops, activeDrivers);

    // Store the routes
    await supabaseStore.addRoutes(routes);

    // Calculate statistics
    const averageStopsPerRoute = routes.length > 0 ? Math.round(stops.length / routes.length) : 0;
    const totalDistance = routes.reduce((sum, route) => sum + route.totalDistance, 0);

    const result: OptimizationResult = {
      routes,
      totalStops: stops.length,
      averageStopsPerRoute,
      totalDistance: Math.round(totalDistance * 100) / 100,
    };

    res.json(result);
  } catch (error) {
    console.error('Optimization error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';

    res.status(500).json({
      error: 'Failed to optimize routes',
      details: message,
    });
  }
});

router.get('/routes', async (req: Request, res: Response) => {
  try {
    const routes = await supabaseStore.getAllRoutes();
    res.json(routes);
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
});

router.get('/routes/:id', async (req: Request, res: Response) => {
  try {
    const route = await supabaseStore.getRoute(req.params.id);

    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    res.json(route);
  } catch (error) {
    console.error('Error fetching route:', error);
    res.status(500).json({ error: 'Failed to fetch route' });
  }
});

router.post('/optimize/osrm', async (req: Request, res: Response) => {
  try {
    const stops = await supabaseStore.getAllStops();

    if (stops.length === 0) {
      return res.status(400).json({ error: 'No delivery stops available for optimization' });
    }

    const drivers = await supabaseStore.getAllDrivers();
    const activeDrivers = drivers.filter((d) => d.status === 'active');

    if (activeDrivers.length === 0) {
      return res.status(400).json({ error: 'No active drivers available' });
    }

    const routes = await optimizeRoutesWithOSRM(stops, activeDrivers);
    await supabaseStore.addRoutes(routes);

    const averageStopsPerRoute = routes.length > 0 ? Math.round(stops.length / routes.length) : 0;
    const totalDistance = routes.reduce((sum, route) => sum + route.totalDistance, 0);

    const result: OptimizationResult = {
      routes,
      totalStops: stops.length,
      averageStopsPerRoute,
      totalDistance: Math.round(totalDistance * 100) / 100,
    };

    res.json(result);
  } catch (error) {
    console.error('OSRM optimization error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';

    res.status(500).json({
      error: 'Failed to optimize routes with OSRM',
      details: message,
    });
  }
});

export const optimizationRoutes = router;
