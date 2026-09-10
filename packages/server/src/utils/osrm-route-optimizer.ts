import { DeliveryStop, Route } from '@droute/shared';
import { osrmService } from '../services/osrm-routing';

const TARGET_STOPS_PER_ROUTE = 20;

export async function optimizeRoutesWithOSRM(
  stops: DeliveryStop[],
  drivers: Array<{ id: string; name: string }>,
): Promise<Route[]> {
  if (stops.length === 0) {
    return [];
  }

  // Cluster stops geographically using K-means
  const numClusters = Math.max(drivers.length, Math.ceil(stops.length / TARGET_STOPS_PER_ROUTE));
  const clusters = kMeansClustering(stops, numClusters);

  // Optimize each cluster with OSRM
  const routes: Route[] = [];
  let routeIndex = 0;

  for (const clusterStops of clusters) {
    const subClusters = splitClusterIfNeeded(clusterStops, TARGET_STOPS_PER_ROUTE);

    for (const subCluster of subClusters) {
      try {
        const driverId = drivers[routeIndex % drivers.length].id;

        // Optimize this sub-cluster's order using OSRM
        const optimizedStops = await optimizeStopOrder(subCluster);
        const routeInfo = await osrmService.optimizeRoute(optimizedStops);

        routes.push({
          id: `route_${Date.now()}_${routeIndex}`,
          driverId,
          stops: optimizedStops,
          totalDistance: Math.round(routeInfo.distance * 100) / 100,
          estimatedDuration: routeInfo.duration + 5 * optimizedStops.length,
          status: 'pending',
          createdAt: new Date(),
        });

        routeIndex++;
      } catch (error) {
        console.error('Error optimizing route cluster:', error);
      }
    }
  }

  return routes;
}

async function optimizeStopOrder(stops: DeliveryStop[]): Promise<DeliveryStop[]> {
  if (stops.length <= 2) {
    return stops;
  }

  try {
    // Get distance matrix from OSRM
    const matrix = await osrmService.getMatrix(stops);

    // Use nearest neighbor heuristic with actual road distances
    const ordered: DeliveryStop[] = [stops[0]];
    const remaining = new Set(stops.slice(1));

    while (remaining.size > 0) {
      const lastIndex = stops.indexOf(ordered[ordered.length - 1]);
      let nearestStop: DeliveryStop | null = null;
      let minDistance = Infinity;

      for (const stop of remaining) {
        const stopIndex = stops.indexOf(stop);
        const distance = matrix[lastIndex][stopIndex];

        if (distance < minDistance) {
          minDistance = distance;
          nearestStop = stop;
        }
      }

      if (nearestStop) {
        ordered.push(nearestStop);
        remaining.delete(nearestStop);
      }
    }

    return ordered;
  } catch (error) {
    console.warn('OSRM optimization failed, falling back to geographic ordering:', error);
    return stops;
  }
}

function kMeansClustering(stops: DeliveryStop[], k: number): DeliveryStop[][] {
  interface Coordinate {
    latitude: number;
    longitude: number;
  }

  const centers: Coordinate[] = [];
  const indices = new Set<number>();

  while (centers.length < k) {
    const randomIndex = Math.floor(Math.random() * stops.length);
    if (!indices.has(randomIndex)) {
      indices.add(randomIndex);
      centers.push(stops[randomIndex].coordinates);
    }
  }

  let previousCenters: Coordinate[] = [];
  let iteration = 0;
  const maxIterations = 10;

  while (iteration < maxIterations && !centerConverged(centers, previousCenters)) {
    previousCenters = JSON.parse(JSON.stringify(centers));

    const clusters: DeliveryStop[][] = Array(k)
      .fill(null)
      .map(() => []);

    stops.forEach((stop) => {
      let nearestCenterIndex = 0;
      let minDistance = Infinity;

      centers.forEach((center, index) => {
        const distance = haversineDistance(stop.coordinates, center);
        if (distance < minDistance) {
          minDistance = distance;
          nearestCenterIndex = index;
        }
      });

      clusters[nearestCenterIndex].push(stop);
    });

    centers.forEach((_, index) => {
      if (clusters[index].length > 0) {
        centers[index] = calculateCentroid(clusters[index]);
      }
    });

    iteration++;
  }

  const finalClusters: DeliveryStop[][] = Array(k)
    .fill(null)
    .map(() => []);

  stops.forEach((stop) => {
    let nearestCenterIndex = 0;
    let minDistance = Infinity;

    centers.forEach((center, index) => {
      const distance = haversineDistance(stop.coordinates, center);
      if (distance < minDistance) {
        minDistance = distance;
        nearestCenterIndex = index;
      }
    });

    finalClusters[nearestCenterIndex].push(stop);
  });

  return finalClusters.filter((cluster) => cluster.length > 0);
}

function centerConverged(current: Coordinate[], previous: Coordinate[]): boolean {
  if (current.length !== previous.length) {
    return false;
  }

  const threshold = 0.0001;
  return current.every((center, index) => haversineDistance(center, previous[index]) < threshold);
}

interface Coordinate {
  latitude: number;
  longitude: number;
}

function calculateCentroid(stops: DeliveryStop[]): Coordinate {
  const lat = stops.reduce((sum, stop) => sum + stop.coordinates.latitude, 0) / stops.length;
  const lng = stops.reduce((sum, stop) => sum + stop.coordinates.longitude, 0) / stops.length;

  return { latitude: lat, longitude: lng };
}

function haversineDistance(coord1: Coordinate, coord2: Coordinate): number {
  const EARTH_RADIUS_KM = 6371;
  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLng = toRad(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.latitude)) *
      Math.cos(toRad(coord2.latitude)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function splitClusterIfNeeded(stops: DeliveryStop[], maxSize: number): DeliveryStop[][] {
  if (stops.length <= maxSize) {
    return [stops];
  }

  const subClusters: DeliveryStop[][] = [];
  for (let i = 0; i < stops.length; i += maxSize) {
    subClusters.push(stops.slice(i, i + maxSize));
  }

  return subClusters;
}
