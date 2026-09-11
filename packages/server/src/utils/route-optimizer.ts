import { DeliveryStop, Coordinate } from '@droute/shared';

const EARTH_RADIUS_KM = 6371;
const AVERAGE_SPEED_KMH = 20;
const MINUTES_PER_DELIVERY = 5;

export interface Waypoint {
  address: string;
  postalCode: string;
  coordinates: Coordinate;
}

export interface SingleRoute {
  origin?: Waypoint;
  destination?: Waypoint;
  stops: DeliveryStop[];
  /** Distance to each stop from whatever precedes it: the origin, or the previous stop. */
  legDistances: number[];
  /** Last stop to the destination. Zero when no destination was given. */
  finalLeg: number;
  totalDistance: number;
  estimatedDuration: number;
}

export interface RouteEndpoints {
  origin?: Waypoint;
  destination?: Waypoint;
}

export function optimizeSingleRoute(
  stops: DeliveryStop[],
  endpoints: RouteEndpoints = {}
): SingleRoute {
  const { origin, destination } = endpoints;

  if (stops.length === 0) {
    return {
      origin,
      destination,
      stops: [],
      legDistances: [],
      finalLeg: 0,
      totalDistance: 0,
      estimatedDuration: 0,
    };
  }

  const seeded = orderStopsFrom(origin ? origin.coordinates : stops[0].coordinates, stops);
  const ordered = improveWithTwoOpt(seeded, origin, destination);

  const legDistances = ordered.map((stop, index) => {
    const previous = index === 0 ? origin?.coordinates : ordered[index - 1].coordinates;
    return previous ? haversineDistance(previous, stop.coordinates) : 0;
  });

  const finalLeg = destination
    ? haversineDistance(ordered[ordered.length - 1].coordinates, destination.coordinates)
    : 0;

  const totalDistance = legDistances.reduce((sum, leg) => sum + leg, 0) + finalLeg;

  return {
    origin,
    destination,
    stops: ordered,
    legDistances,
    finalLeg,
    totalDistance,
    estimatedDuration: estimateRouteDuration(totalDistance, ordered.length),
  };
}

// Nearest-neighbour commits to whatever is closest at each step, which strands
// outliers and forces long jumps back across the island later. 2-opt repeatedly
// reverses a segment whenever doing so shortens the route, which removes those
// crossings. The origin and destination are fixed points, so their edges are
// counted but they are never reordered.
function improveWithTwoOpt(
  stops: DeliveryStop[],
  origin?: Waypoint,
  destination?: Waypoint
): DeliveryStop[] {
  if (stops.length < 3) {
    return stops;
  }

  const route = [...stops];
  const distance = (a: Coordinate, b: Coordinate) => haversineDistance(a, b);
  const maxPasses = 40;

  // Without an origin the first stop starts the route and has no preceding
  // edge to trade, so leave it in place.
  const firstMovable = origin ? 0 : 1;

  for (let pass = 0; pass < maxPasses; pass++) {
    let improved = false;

    for (let i = firstMovable; i < route.length - 1; i++) {
      for (let j = i + 1; j < route.length; j++) {
        const before = i === 0 ? origin!.coordinates : route[i - 1].coordinates;
        const after =
          j === route.length - 1 ? destination?.coordinates : route[j + 1].coordinates;

        const start = route[i].coordinates;
        const end = route[j].coordinates;

        // Reversing i..j swaps edges (before,start) and (end,after) for
        // (before,end) and (start,after). With nothing after j the route ends
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

function orderStopsFrom(start: Coordinate, stops: DeliveryStop[]): DeliveryStop[] {
  const ordered: DeliveryStop[] = [];
  const remaining = [...stops];
  let current = start;

  while (remaining.length > 0) {
    let nearestIndex = 0;
    let minDistance = Infinity;

    remaining.forEach((stop, index) => {
      const distance = haversineDistance(current, stop.coordinates);
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = index;
      }
    });

    current = remaining[nearestIndex].coordinates;
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

function estimateRouteDuration(distanceKm: number, stopCount: number): number {
  const drivingMinutes = (distanceKm / AVERAGE_SPEED_KMH) * 60;
  return Math.round(drivingMinutes + MINUTES_PER_DELIVERY * stopCount);
}
