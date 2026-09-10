import { Router, Request, Response } from 'express';
import { dataStore } from '../services/data-store';
import { DeliveryProof } from '@droute/shared';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const routes = dataStore.getAllRoutes();
  res.json(routes);
});

router.get('/:id', (req: Request, res: Response) => {
  const route = dataStore.getRoute(req.params.id);

  if (!route) {
    return res.status(404).json({ error: 'Route not found' });
  }

  res.json(route);
});

router.patch('/:id', (req: Request, res: Response) => {
  const { status } = req.body;

  if (!status || !['pending', 'in-progress', 'completed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const route = dataStore.updateRoute(req.params.id, {
    status,
    ...(status === 'completed' && { completedAt: new Date() }),
  });

  if (!route) {
    return res.status(404).json({ error: 'Route not found' });
  }

  res.json(route);
});

router.post('/:routeId/proof', (req: Request, res: Response) => {
  try {
    const { stopId, imageUrl, signatureUrl, notes } = req.body;

    if (!stopId || !imageUrl) {
      return res.status(400).json({ error: 'Missing required fields: stopId, imageUrl' });
    }

    const route = dataStore.getRoute(req.params.routeId);
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

    dataStore.addDeliveryProof(proof);

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

router.get('/:routeId/proofs', (req: Request, res: Response) => {
  const proofs = dataStore.getDeliveryProofsByRoute(req.params.routeId);
  res.json(proofs);
});

export const routeRoutes = router;
