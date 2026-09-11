import { Router, Request, Response } from 'express';
import { optimizeRoutes } from '../utils/route-optimizer';
import { buildRoutesWorkbook, buildExceptionsWorkbook } from '../utils/excel-export';
import { isKnownPostalDistrict } from '../utils/geocoding';
import { supabaseStore } from '../services/supabase-store';
import { serverError } from './error-response';
import { OptimizationResult } from '@droute/shared';

const router = Router();

router.post('/optimize', async (req: Request, res: Response) => {
  try {
    const stops = await supabaseStore.getAllStops();
    if (stops.length === 0) {
      return res.status(400).json({ error: 'No delivery stops available for optimization' });
    }

    const drivers = (await supabaseStore.getAllDrivers()).filter((d) => d.status === 'active');
    if (drivers.length === 0) {
      return res.status(400).json({ error: 'No active drivers available' });
    }

    const routes = optimizeRoutes(stops, drivers);
    await supabaseStore.addRoutes(routes);

    const totalDistance = routes.reduce((sum, route) => sum + route.totalDistance, 0);
    const result: OptimizationResult = {
      routes,
      totalStops: stops.length,
      averageStopsPerRoute: routes.length > 0 ? Math.round(stops.length / routes.length) : 0,
      totalDistance: Math.round(totalDistance * 100) / 100,
    };

    res.json(result);
  } catch (error) {
    serverError(res, 'Failed to optimize routes', error);
  }
});

router.get('/exceptions', async (req: Request, res: Response) => {
  try {
    const [stops, routes, jobs] = await Promise.all([
      supabaseStore.getAllStops(),
      supabaseStore.getAllRoutes(),
      supabaseStore.getAllImportJobs(),
    ]);

    const latestJob = jobs.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

    const assignedIds = new Set(routes.flatMap((route) => route.stops.map((stop) => stop.id)));

    const workbook = buildExceptionsWorkbook({
      skippedAtImport: latestJob?.skippedRows ?? [],
      unknownDistrict: stops.filter((stop) => !isKnownPostalDistrict(stop.postalCode)),
      unassigned: stops.filter((stop) => !assignedIds.has(stop.id)),
    });

    const filename = `droute-exceptions-${new Date().toISOString().slice(0, 10)}.xlsx`;
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(workbook);
  } catch (error) {
    serverError(res, 'Failed to export exception report', error);
  }
});

router.get('/export', async (req: Request, res: Response) => {
  try {
    const routes = await supabaseStore.getAllRoutes();
    if (routes.length === 0) {
      return res.status(400).json({ error: 'No routes to export. Optimize deliveries first.' });
    }

    const workbook = buildRoutesWorkbook(routes, await supabaseStore.getAllDrivers());
    const filename = `droute-routes-${new Date().toISOString().slice(0, 10)}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(workbook);
  } catch (error) {
    serverError(res, 'Failed to export routes', error);
  }
});

router.get('/routes', async (req: Request, res: Response) => {
  try {
    res.json(await supabaseStore.getAllRoutes());
  } catch (error) {
    serverError(res, 'Failed to fetch routes', error);
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
    serverError(res, 'Failed to fetch route', error);
  }
});

export const optimizationRoutes = router;
