import { describe, it, expect } from 'vitest';
import { optimizeSingleRoute } from '../src/utils/route-optimizer';
import { DeliveryStop } from '@droute/shared';

describe('optimizeSingleRoute', () => {
  // Every stop needs a distinct coordinate. Repeating a handful of points makes
  // a correctly ordered route measure zero distance, since consecutive stops
  // sharing a location have a zero-length leg between them.
  const createTestStops = (count: number): DeliveryStop[] =>
    Array.from({ length: count }, (_, i) => ({
      id: `stop_${i}`,
      address: `Test Address ${i}`,
      postalCode: `0${String(i % 10).padStart(5, '0')}`,
      coordinates: {
        latitude: 1.28 + (i % 10) * 0.018,
        longitude: 103.75 + Math.floor(i / 10) * 0.02,
      },
      customerName: `Customer ${i}`,
    }));

  const EARTH_RADIUS_KM = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const distance = (a: DeliveryStop, b: DeliveryStop) => {
    const dLat = toRad(b.coordinates.latitude - a.coordinates.latitude);
    const dLng = toRad(b.coordinates.longitude - a.coordinates.longitude);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(a.coordinates.latitude)) *
        Math.cos(toRad(b.coordinates.latitude)) *
        Math.sin(dLng / 2) ** 2;
    return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  };

  const pathLength = (stops: DeliveryStop[]) =>
    stops.reduce((sum, stop, i) => (i === 0 ? 0 : sum + distance(stops[i - 1], stop)), 0);

  it('returns an empty route for no stops', () => {
    const route = optimizeSingleRoute([]);

    expect(route.stops).toEqual([]);
    expect(route.totalDistance).toBe(0);
  });

  it('handles a single stop', () => {
    const route = optimizeSingleRoute(createTestStops(1));

    expect(route.stops).toHaveLength(1);
    expect(route.totalDistance).toBe(0);
    expect(route.legDistances).toEqual([0]);
  });

  it('includes every stop exactly once', () => {
    const stops = createTestStops(50);
    const route = optimizeSingleRoute(stops);

    expect(route.stops).toHaveLength(50);
    expect(new Set(route.stops.map((s) => s.id)).size).toBe(50);
    expect(new Set(route.stops.map((s) => s.id))).toEqual(new Set(stops.map((s) => s.id)));
  });

  it('reports a leg distance per stop, with zero for the first', () => {
    const route = optimizeSingleRoute(createTestStops(20));

    expect(route.legDistances).toHaveLength(route.stops.length);
    expect(route.legDistances[0]).toBe(0);
    expect(route.legDistances.slice(1).every((leg) => leg > 0)).toBe(true);
  });

  it('totals the leg distances', () => {
    const route = optimizeSingleRoute(createTestStops(30));
    const summed = route.legDistances.reduce((sum, leg) => sum + leg, 0);

    expect(route.totalDistance).toBeCloseTo(summed, 6);
    expect(route.totalDistance).toBeGreaterThan(0);
    expect(Number.isFinite(route.totalDistance)).toBe(true);
  });

  it('is no worse than visiting the stops in their original order', () => {
    const stops = createTestStops(40);
    const route = optimizeSingleRoute(stops);

    expect(route.totalDistance).toBeLessThan(pathLength(stops));
  });

  it('leaves no crossing that reversing a segment would shorten', () => {
    const route = optimizeSingleRoute(createTestStops(25));
    const ordered = route.stops;

    for (let i = 1; i < ordered.length - 1; i++) {
      for (let j = i + 1; j < ordered.length; j++) {
        const after = ordered[j + 1];
        const removed =
          distance(ordered[i - 1], ordered[i]) + (after ? distance(ordered[j], after) : 0);
        const added =
          distance(ordered[i - 1], ordered[j]) + (after ? distance(ordered[i], after) : 0);

        expect(added).toBeGreaterThanOrEqual(removed - 1e-9);
      }
    }
  });

  describe('with a start and end point', () => {
    const origin = {
      address: 'Depot, S 079903',
      postalCode: '079903',
      coordinates: { latitude: 1.2764, longitude: 103.8437 },
    };
    const destination = {
      address: 'Yard, S 738099',
      postalCode: '738099',
      coordinates: { latitude: 1.437, longitude: 103.786 },
    };

    it('measures the first leg from the start point, not from zero', () => {
      const stops = createTestStops(20);
      const route = optimizeSingleRoute(stops, { origin });

      expect(route.origin).toBe(origin);
      expect(route.legDistances[0]).toBeGreaterThan(0);
      expect(route.legDistances[0]).toBeCloseTo(
        distance({ coordinates: origin.coordinates } as DeliveryStop, route.stops[0]),
        6
      );
    });

    it('begins at whichever stop is nearest the start point', () => {
      const stops = createTestStops(20);
      const route = optimizeSingleRoute(stops, { origin });

      const nearest = stops.reduce((best, stop) =>
        distance({ coordinates: origin.coordinates } as DeliveryStop, stop) <
        distance({ coordinates: origin.coordinates } as DeliveryStop, best)
          ? stop
          : best
      );

      expect(route.legDistances[0]).toBeLessThanOrEqual(
        distance({ coordinates: origin.coordinates } as DeliveryStop, nearest) + 1e-6
      );
    });

    it('adds a final leg to the end point and counts it in the total', () => {
      const route = optimizeSingleRoute(createTestStops(20), { origin, destination });
      const legSum = route.legDistances.reduce((sum, leg) => sum + leg, 0);

      expect(route.destination).toBe(destination);
      expect(route.finalLeg).toBeGreaterThan(0);
      expect(route.totalDistance).toBeCloseTo(legSum + route.finalLeg, 6);
    });

    it('has no final leg when no end point is given', () => {
      const route = optimizeSingleRoute(createTestStops(20), { origin });

      expect(route.finalLeg).toBe(0);
      expect(route.destination).toBeUndefined();
    });

    it('still visits every stop exactly once', () => {
      const stops = createTestStops(30);
      const route = optimizeSingleRoute(stops, { origin, destination });

      expect(new Set(route.stops.map((s) => s.id))).toEqual(new Set(stops.map((s) => s.id)));
    });

    it('beats the same stops routed without the endpoints in mind', () => {
      const stops = createTestStops(30);
      const aware = optimizeSingleRoute(stops, { origin, destination });

      // Order ignoring the endpoints, then bolt them on: what you get if the
      // start and end are an afterthought rather than part of the optimisation.
      const naive = optimizeSingleRoute(stops);
      const naiveTotal =
        distance({ coordinates: origin.coordinates } as DeliveryStop, naive.stops[0]) +
        naive.totalDistance +
        distance(naive.stops[naive.stops.length - 1], {
          coordinates: destination.coordinates,
        } as DeliveryStop);

      expect(aware.totalDistance).toBeLessThanOrEqual(naiveTotal);
    });
  });

  it('estimates a duration that grows with the route', () => {
    const short = optimizeSingleRoute(createTestStops(5));
    const long = optimizeSingleRoute(createTestStops(40));

    expect(short.estimatedDuration).toBeGreaterThan(0);
    expect(long.estimatedDuration).toBeGreaterThan(short.estimatedDuration);
  });
});
