import { DeliveryStop, Route, Coordinate } from '@droute/shared';

const EARTH_RADIUS_KM = 6371;
const NUM_DRIVERS = 5;
const TARGET_STOPS_PER_ROUTE = 20;

export function optimizeRoutes(stops: DeliveryStop[], drivers: Array<{ id: string; name: string }>): Route[] {
  if (stops.length === 0) {
    return [];
  }

  // Determine number of clusters needed
  const numClusters = Math.max(NUM_DRIVERS, Math.ceil(stops.length / TARGET_STOPS_PER_ROUTE));

  // Cluster stops using K-means clustering
  const clusters = kMeansClustering(stops, numClusters);

  // Create routes from clusters, splitting if necessary
  const routes: Route[] = [];
  let routeIndex = 0;

  clusters.forEach((clusterStops) => {
    // Split large clusters into multiple routes
    const subClusters = splitClusterIfNeeded(clusterStops, TARGET_STOPS_PER_ROUTE);

    subClusters.forEach((subCluster) => {
      const driverId = drivers[routeIndex % drivers.length].id;
      const orderedStops = orderStopsForDelivery(subCluster);
      const totalDistance = calculateRouteTotalDistance(orderedStops);
      const estimatedDuration = estimateRouteDuration(totalDistance, orderedStops.length);

      routes.push({
        id: `route_${Date.now()}_${routeIndex}`,
        driverId,
        stops: orderedStops,
        totalDistance,
        estimatedDuration,
        status: 'pending',
        createdAt: new Date(),
      });

      routeIndex++;
    });
  });

  return routes;
}

function kMeansClustering(stops: DeliveryStop[], k: number): DeliveryStop[][] {
  // Initialize cluster centers randomly from stops
  const centers: Coordinate[] = [];
  const indices = new Set<number>();

  while (centers.length < k) {
    const randomIndex = Math.floor(Math.random() * stops.length);
    if (!indices.has(randomIndex)) {
      indices.add(randomIndex);
      centers.push(stops[randomIndex].coordinates);
    }
  }

  // Iterate K-means algorithm
  let previousCenters: Coordinate[] = [];
  let iteration = 0;
  const maxIterations = 10;

  while (iteration < maxIterations && !centerConverged(centers, previousCenters)) {
    previousCenters = JSON.parse(JSON.stringify(centers));

    // Assign points to nearest center
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

    // Recalculate centers
    centers.forEach((_, index) => {
      if (clusters[index].length > 0) {
        centers[index] = calculateCentroid(clusters[index]);
      }
    });

    iteration++;
  }

  // Final assignment
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

function calculateCentroid(stops: DeliveryStop[]): Coordinate {
  const lat = stops.reduce((sum, stop) => sum + stop.coordinates.latitude, 0) / stops.length;
  const lng = stops.reduce((sum, stop) => sum + stop.coordinates.longitude, 0) / stops.length;

  return { latitude: lat, longitude: lng };
}

function orderStopsForDelivery(stops: DeliveryStop[]): DeliveryStop[] {
  if (stops.length <= 1) {
    return stops;
  }

  // Nearest neighbor algorithm for TSP
  const ordered: DeliveryStop[] = [stops[0]];
  const remaining = new Set(stops.slice(1));

  while (remaining.size > 0) {
    const lastStop = ordered[ordered.length - 1];
    let nearestStop: DeliveryStop | null = null;
    let minDistance = Infinity;

    remaining.forEach((stop) => {
      const distance = haversineDistance(lastStop.coordinates, stop.coordinates);
      if (distance < minDistance) {
        minDistance = distance;
        nearestStop = stop;
      }
    });

    if (nearestStop) {
      ordered.push(nearestStop);
      remaining.delete(nearestStop);
    }
  }

  return ordered;
}

function haversineDistance(coord1: Coordinate, coord2: Coordinate): number {
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

function calculateRouteTotalDistance(stops: DeliveryStop[]): number {
  let total = 0;

  for (let i = 0; i < stops.length - 1; i++) {
    total += haversineDistance(stops[i].coordinates, stops[i + 1].coordinates);
  }

  return total;
}

function estimateRouteDuration(distanceKm: number, numStops: number): number {
  // Average speed in Singapore: ~20 km/h (accounting for traffic)
  // Add 5 minutes per stop for delivery
  const drivingTime = (distanceKm / 20) * 60; // in minutes
  const deliveryTime = 5 * numStops;
  return Math.round(drivingTime + deliveryTime);
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
