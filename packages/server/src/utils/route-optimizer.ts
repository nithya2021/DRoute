import { DeliveryStop } from '@droute/shared';

const EARTH_RADIUS_KM = 6371;
const AVERAGE_SPEED_KMH = 20;
const MINUTES_PER_DELIVERY = 5;

export interface SingleRoute {
  stops: DeliveryStop[];
  legDistances: number[];
  totalDistance: number;
  estimatedDuration: number;
}

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
// crossings.
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
    return [...stops];
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

function haversineDistance(
  coord1: { latitude: number; longitude: number },
  coord2: { latitude: number; longitude: number }
): number {
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

function estimateRouteDuration(distanceKm: number, stopCount: number): number {
  const drivingMinutes = (distanceKm / AVERAGE_SPEED_KMH) * 60;
  return Math.round(drivingMinutes + MINUTES_PER_DELIVERY * stopCount);
}
