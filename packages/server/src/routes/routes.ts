import { Router, Request, Response } from 'express';
import { supabaseStore } from '../services/supabase-store';
import { serverError } from './error-response';
import { DeliveryProof } from '@droute/shared';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    res.json(await supabaseStore.getAllRoutes());
  } catch (error) {
    serverError(res, 'Failed to fetch routes', error);
  }
});

router.get('/:id', async (req: Request, res: Response) => {
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

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!status || !['pending', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const route = await supabaseStore.updateRoute(req.params.id, {
      status,
      ...(status === 'completed' && { completedAt: new Date() }),
    });

    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }
    res.json(route);
  } catch (error) {
    serverError(res, 'Failed to update route', error);
  }
});

router.post('/:routeId/proof', async (req: Request, res: Response) => {
  try {
    const { stopId, imageUrl, signatureUrl, notes } = req.body;
    if (!stopId || !imageUrl) {
      return res.status(400).json({ error: 'Missing required fields: stopId, imageUrl' });
    }

    const route = await supabaseStore.getRoute(req.params.routeId);
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    const proof: DeliveryProof = {
      id: `proof_${Date.now()}`,
      stopId,
      routeId: req.params.routeId,
      timestamp: new Date(),
      imageUrl,
      signatureUrl,
      notes,
    };

    await supabaseStore.addDeliveryProof(proof);
    res.status(201).json(proof);
  } catch (error) {
    serverError(res, 'Failed to create delivery proof', error);
  }
});

router.get('/:routeId/proofs', async (req: Request, res: Response) => {
  try {
    res.json(await supabaseStore.getDeliveryProofsByRoute(req.params.routeId));
  } catch (error) {
    serverError(res, 'Failed to fetch delivery proofs', error);
  }
});

export const routeRoutes = router;
