import { describe, it, expect } from 'vitest';
import { optimizeRoutes } from '../src/utils/route-optimizer';
import { DeliveryStop } from '@droute/shared';

describe('Route Optimizer', () => {
  // Every stop needs a distinct coordinate. Repeating a handful of points makes
  // a correctly-clustered route measure zero distance, since the clustering
  // groups the identical points together and every leg within it is zero-length.
  const createTestStops = (count: number): DeliveryStop[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `stop_${i}`,
      address: `Test Address ${i}`,
      postalCode: `0${String(i % 10).padStart(5, '0')}`,
      coordinates: {
        latitude: 1.28 + (i % 10) * 0.018,
        longitude: 103.75 + Math.floor(i / 10) * 0.02,
      },
      customerName: `Customer ${i}`,
    }));
  };

  const createTestDrivers = () => [
    { id: 'driver_1', name: 'Driver 1' },
    { id: 'driver_2', name: 'Driver 2' },
    { id: 'driver_3', name: 'Driver 3' },
    { id: 'driver_4', name: 'Driver 4' },
    { id: 'driver_5', name: 'Driver 5' },
  ];

  it('should optimize empty stops', () => {
    const stops: DeliveryStop[] = [];
    const drivers = createTestDrivers();

    const routes = optimizeRoutes(stops, drivers);

    expect(routes).toEqual([]);
  });

  it('should create routes for multiple stops', () => {
    const stops = createTestStops(100);
    const drivers = createTestDrivers();

    const routes = optimizeRoutes(stops, drivers);

    expect(routes.length).toBeGreaterThan(0);
    expect(routes.length).toBeLessThanOrEqual(5);
  });

  it('should distribute stops across drivers', () => {
    const stops = createTestStops(100);
    const drivers = createTestDrivers();

    const routes = optimizeRoutes(stops, drivers);
    const totalStops = routes.reduce((sum, route) => sum + route.stops.length, 0);

    expect(totalStops).toBe(100);
  });

  it('should have realistic stop counts per route', () => {
    const stops = createTestStops(100);
    const drivers = createTestDrivers();

    const routes = optimizeRoutes(stops, drivers);

    routes.forEach((route) => {
      expect(route.stops.length).toBeGreaterThan(0);
      expect(route.stops.length).toBeLessThanOrEqual(25);
    });
  });

  it('should set correct route properties', () => {
    const stops = createTestStops(50);
    const drivers = createTestDrivers();

    const routes = optimizeRoutes(stops, drivers);

    routes.forEach((route) => {
      expect(route.id).toBeDefined();
      expect(route.driverId).toBeDefined();
      expect(route.stops).toBeDefined();
      expect(route.totalDistance).toBeGreaterThan(0);
      expect(route.estimatedDuration).toBeGreaterThan(0);
      expect(route.status).toBe('pending');
      expect(route.createdAt).toBeDefined();
    });
  });

  it('should calculate route distance', () => {
    const stops = createTestStops(20);
    const drivers = createTestDrivers();

    const routes = optimizeRoutes(stops, drivers);

    routes.forEach((route) => {
      expect(route.totalDistance).toBeGreaterThan(0);
      expect(Number.isFinite(route.totalDistance)).toBe(true);
    });
  });

  it('should assign stops to specific drivers', () => {
    const stops = createTestStops(25);
    const drivers = createTestDrivers();

    const routes = optimizeRoutes(stops, drivers);

    const assignedDrivers = new Set(routes.map((r) => r.driverId));
    routes.forEach((route) => {
      expect(drivers.some((d) => d.id === route.driverId)).toBe(true);
    });
  });
});
