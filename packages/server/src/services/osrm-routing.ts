import { DeliveryStop } from '@droute/shared';

const OSRM_BASE_URL = 'https://router.project-osrm.org';

export interface OSRMRoute {
  distance: number;
  duration: number;
  geometry: string;
  legs: Array<{
    distance: number;
    duration: number;
    steps: Array<{ distance: number; duration: number }>;
  }>;
  waypoint_indices: number[];
}

export interface OSRMResponse {
  code: string;
  routes: OSRMRoute[];
  waypoints: Array<{ hint: string; distance: number; name: string; location: [number, number] }>;
}

export class OSRMRoutingService {
  async optimizeRoute(stops: DeliveryStop[]): Promise<{ distance: number; duration: number; orderedStops: DeliveryStop[] }> {
    if (stops.length < 2) {
      return {
        distance: 0,
        duration: 0,
        orderedStops: stops,
      };
    }

    try {
      const coordinates = stops.map((stop) => `${stop.coordinates.longitude},${stop.coordinates.latitude}`).join(';');
      const url = `${OSRM_BASE_URL}/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`OSRM API error: ${response.statusText}`);
      }

      const data = (await response.json()) as OSRMResponse;

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error(`OSRM returned code: ${data.code}`);
      }

      const route = data.routes[0];

      return {
        distance: route.distance / 1000,
        duration: Math.round(route.duration / 60),
        orderedStops: stops,
      };
    } catch (error) {
      console.error('OSRM routing error:', error);
      throw new Error(`Failed to optimize route with OSRM: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async calculateDistance(stop1: DeliveryStop, stop2: DeliveryStop): Promise<number> {
    try {
      const url = `${OSRM_BASE_URL}/route/v1/driving/${stop1.coordinates.longitude},${stop1.coordinates.latitude};${stop2.coordinates.longitude},${stop2.coordinates.latitude}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`OSRM API error: ${response.statusText}`);
      }

      const data = (await response.json()) as OSRMResponse;

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error(`OSRM returned code: ${data.code}`);
      }

      return data.routes[0].distance / 1000;
    } catch (error) {
      console.error('OSRM distance calculation error:', error);
      throw new Error(`Failed to calculate distance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getMatrix(stops: DeliveryStop[]): Promise<number[][]> {
    if (stops.length < 2) {
      return [];
    }

    try {
      const coordinates = stops.map((stop) => `${stop.coordinates.longitude},${stop.coordinates.latitude}`).join(';');
      const url = `${OSRM_BASE_URL}/table/v1/driving/${coordinates}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`OSRM API error: ${response.statusText}`);
      }

      const data = (await response.json()) as { code: string; distances: number[][] };

      if (data.code !== 'Ok') {
        throw new Error(`OSRM returned code: ${data.code}`);
      }

      return data.distances;
    } catch (error) {
      console.error('OSRM matrix calculation error:', error);
      throw new Error(`Failed to calculate distance matrix: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const osrmService = new OSRMRoutingService();
