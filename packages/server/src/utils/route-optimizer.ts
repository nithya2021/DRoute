import { DeliveryStop, Route, Coordinate } from '@droute/shared';

const EARTH_RADIUS_KM = 6371;
const NUM_DRIVERS = 5;
const AVERAGE_SPEED_KMH = 20;
const MINUTES_PER_DELIVERY = 5;

export function optimizeRoutes(
  stops: DeliveryStop[],
  drivers: Array<{ id: string; name: string }>
): Route[] {
  if (stops.length === 0 || drivers.length === 0) {
    return [];
  }

  const clusterCount = Math.min(NUM_DRIVERS, drivers.length, stops.length);
  const clusters = clusterStops(stops, clusterCount);
  const createdAt = new Date();

  return clusters.map((clusterStops, index) => {
    const orderedStops = orderStopsForDelivery(clusterStops);
    const totalDistance = calculateRouteTotalDistance(orderedStops);

    return {
      id: `route_${createdAt.getTime()}_${index}`,
      driverId: drivers[index % drivers.length].id,
      stops: orderedStops,
      totalDistance,
      estimatedDuration: estimateRouteDuration(totalDistance, orderedStops.length),
      status: 'pending',
      createdAt,
    };
  });
}

function clusterStops(stops: DeliveryStop[], k: number): DeliveryStop[][] {
  const centers = initializeCenters(stops, k);
  const maxIterations = 20;

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const assignment = assignToNearestCenter(stops, centers);
    const nextCenters = centers.map((center, index) =>
      assignment[index].length > 0 ? calculateCentroid(assignment[index]) : center
    );

    if (centersConverged(centers, nextCenters)) {
      break;
    }
    centers.splice(0, centers.length, ...nextCenters);
  }

  return assignWithCapacity(stops, centers).filter((cluster) => cluster.length > 0);
}

// k-means++ style spread: seed with the first stop, then repeatedly take the
// stop farthest from any existing center. Deterministic, and it cannot loop
// forever the way sampling distinct random indices does when stops.length < k.
function initializeCenters(stops: DeliveryStop[], k: number): Coordinate[] {
  const centers: Coordinate[] = [stops[0].coordinates];

  while (centers.length < k) {
    let farthestStop = stops[0];
    let maxDistance = -1;

    for (const stop of stops) {
      const distance = Math.min(
        ...centers.map((center) => haversineDistance(stop.coordinates, center))
      );
      if (distance > maxDistance) {
        maxDistance = distance;
        farthestStop = stop;
      }
    }
    centers.push(farthestStop.coordinates);
  }

  return centers;
}

function assignToNearestCenter(stops: DeliveryStop[], centers: Coordinate[]): DeliveryStop[][] {
  const clusters: DeliveryStop[][] = centers.map(() => []);

  for (const stop of stops) {
    let nearest = 0;
    let minDistance = Infinity;

    centers.forEach((center, index) => {
      const distance = haversineDistance(stop.coordinates, center);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = index;
      }
    });

    clusters[nearest].push(stop);
  }

  return clusters;
}

// Plain k-means optimizes distance only, which lets one driver take 40 stops
// while another takes 1. Every stop-to-center pair is considered cheapest-first
// and a stop only lands in a cluster that still has room, so each driver ends
// up with a near-equal share while staying as geographically tight as possible.
function assignWithCapacity(stops: DeliveryStop[], centers: Coordinate[]): DeliveryStop[][] {
  const capacity = Math.ceil(stops.length / centers.length);
  const clusters: DeliveryStop[][] = centers.map(() => []);
  const assigned = new Set<string>();

  const pairs = stops.flatMap((stop) =>
    centers.map((center, centerIndex) => ({
      stop,
      centerIndex,
      distance: haversineDistance(stop.coordinates, center),
    }))
  );
  pairs.sort((a, b) => a.distance - b.distance);

  for (const { stop, centerIndex } of pairs) {
    if (assigned.has(stop.id) || clusters[centerIndex].length >= capacity) {
      continue;
    }
    clusters[centerIndex].push(stop);
    assigned.add(stop.id);
  }

  // Rounding on capacity can leave a stop unplaced; put any stragglers in the
  // smallest cluster so no delivery is silently dropped.
  for (const stop of stops) {
    if (assigned.has(stop.id)) {
      continue;
    }
    const smallest = clusters.reduce(
      (best, cluster, index) => (cluster.length < clusters[best].length ? index : best),
      0
    );
    clusters[smallest].push(stop);
    assigned.add(stop.id);
  }

  return clusters;
}

function centersConverged(current: Coordinate[], next: Coordinate[]): boolean {
  const threshold = 0.0001;
  return current.every((center, index) => haversineDistance(center, next[index]) < threshold);
}

function calculateCentroid(stops: DeliveryStop[]): Coordinate {
  const latitude = stops.reduce((sum, stop) => sum + stop.coordinates.latitude, 0) / stops.length;
  const longitude = stops.reduce((sum, stop) => sum + stop.coordinates.longitude, 0) / stops.length;
  return { latitude, longitude };
}

export interface SingleRoute {
  stops: DeliveryStop[];
  legDistances: number[];
  totalDistance: number;
  estimatedDuration: number;
}

// One route over every stop, rather than a cluster per driver.
export function optimizeSingleRoute(stops: DeliveryStop[]): SingleRoute {
  const ordered = improveWithTwoOpt(orderStopsForDelivery(stops));

  const legDistances = ordered.map((stop, index) =>
    index === 0 ? 0 : haversineDistance(ordered[index - 1].coordinates, stop.coordinates)
  );
  const totalDistance = legDistances.reduce((sum, leg) => sum + leg, 0);

  return {
    stops: ordered,
    legDistances,
    totalDistance,
    estimatedDuration: estimateRouteDuration(totalDistance, ordered.length),
  };
}

// Nearest-neighbour commits to whatever is closest at each step, which strands
// outliers and forces long jumps back across the island later. 2-opt repeatedly
// reverses a segment whenever doing so shortens the route, which removes those
// crossings. Worth the extra passes here because this single route is the
// whole deliverable.
function improveWithTwoOpt(stops: DeliveryStop[]): DeliveryStop[] {
  if (stops.length < 4) {
    return stops;
  }

  const route = [...stops];
  const distance = (a: DeliveryStop, b: DeliveryStop) =>
    haversineDistance(a.coordinates, b.coordinates);
  const maxPasses = 40;

  for (let pass = 0; pass < maxPasses; pass++) {
    let improved = false;

    for (let i = 1; i < route.length - 1; i++) {
      for (let j = i + 1; j < route.length; j++) {
        const before = route[i - 1];
        const start = route[i];
        const end = route[j];
        const after = route[j + 1];

        // Reversing i..j swaps edges (before,start) and (end,after) for
        // (before,end) and (start,after). With no stop after j the route ends
        // there, so only the leading edge changes.
        const removed = distance(before, start) + (after ? distance(end, after) : 0);
        const added = distance(before, end) + (after ? distance(start, after) : 0);

        if (added < removed - 1e-9) {
          const segment = route.slice(i, j + 1).reverse();
          route.splice(i, segment.length, ...segment);
          improved = true;
        }
      }
    }

    if (!improved) {
      break;
    }
  }

  return route;
}

function orderStopsForDelivery(stops: DeliveryStop[]): DeliveryStop[] {
  if (stops.length <= 1) {
    return stops;
  }

  const ordered: DeliveryStop[] = [stops[0]];
  const remaining = stops.slice(1);

  while (remaining.length > 0) {
    const lastStop = ordered[ordered.length - 1];
    let nearestIndex = 0;
    let minDistance = Infinity;

    remaining.forEach((stop, index) => {
      const distance = haversineDistance(lastStop.coordinates, stop.coordinates);
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = index;
      }
    });

    ordered.push(remaining[nearestIndex]);
    remaining.splice(nearestIndex, 1);
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

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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

function estimateRouteDuration(distanceKm: number, stopCount: number): number {
  const drivingMinutes = (distanceKm / AVERAGE_SPEED_KMH) * 60;
  return Math.round(drivingMinutes + MINUTES_PER_DELIVERY * stopCount);
}
