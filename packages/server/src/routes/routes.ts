import { Router, Request, Response } from 'express';
import { supabaseStore } from '../services/supabase-store';
import { DeliveryProof } from '@droute/shared';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const routes = await supabaseStore.getAllRoutes();
    res.json(routes);
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ error: 'Failed to fetch routes' });
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
    console.error('Error fetching route:', error);
    res.status(500).json({ error: 'Failed to fetch route' });
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
      ...(status === 'completed' && { updatedAt: new Date() }),
    });

    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    res.json(route);
  } catch (error) {
    console.error('Error updating route:', error);
    res.status(500).json({ error: 'Failed to update route' });
  }
});

router.post('/:routeId/proof', async (req: Request, res: Response) => {
  try {
    const { imageUrl, signatureUrl, notes } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Missing required field: imageUrl' });
    }

    const route = await supabaseStore.getRoute(req.params.routeId);
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    const proof: DeliveryProof = {
      id: `proof_${Date.now()}`,
      stopId: '',
      routeId: req.params.routeId,
      timestamp: new Date(),
      imageUrl,
      signatureUrl,
      notes,
    };

    await supabaseStore.addDeliveryProof(proof);

    res.status(201).json(proof);
  } catch (error) {
    console.error('Error creating delivery proof:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';

    res.status(500).json({
      error: 'Failed to create delivery proof',
      details: message,
    });
  }
});

router.get('/:routeId/proofs', async (req: Request, res: Response) => {
  try {
    const proofs = await supabaseStore.getDeliveryProofsByRoute(req.params.routeId);
    res.json(proofs);
  } catch (error) {
    console.error('Error fetching proofs:', error);
    res.status(500).json({ error: 'Failed to fetch proofs' });
  }
});

export const routeRoutes = router;
