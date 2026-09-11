import { DeliveryStop } from './types';

// The Maps URLs API accepts at most 9 waypoints between origin and
// destination, so a single link covers 11 stops. Longer routes are split into
// consecutive links that overlap by one stop, letting a driver resume from
// where the previous leg ended.
const MAX_STOPS_PER_LINK = 11;

export interface MapsLeg {
  url: string;
  firstStop: number;
  lastStop: number;
}

function coordinate(stop: DeliveryStop): string {
  return `${stop.coordinates.latitude},${stop.coordinates.longitude}`;
}

export function buildMapsLegs(stops: DeliveryStop[]): MapsLeg[] {
  if (stops.length === 0) {
    return [];
  }

  if (stops.length === 1) {
    return [
      {
        url: `https://www.google.com/maps/search/?api=1&query=${coordinate(stops[0])}`,
        firstStop: 1,
        lastStop: 1,
      },
    ];
  }

  const legs: MapsLeg[] = [];

  for (let start = 0; start < stops.length - 1; start += MAX_STOPS_PER_LINK - 1) {
    const chunk = stops.slice(start, start + MAX_STOPS_PER_LINK);
    const params = new URLSearchParams({
      api: '1',
      origin: coordinate(chunk[0]),
      destination: coordinate(chunk[chunk.length - 1]),
      travelmode: 'driving',
    });

    const waypoints = chunk.slice(1, -1).map(coordinate).join('|');
    if (waypoints) {
      params.set('waypoints', waypoints);
    }

    legs.push({
      url: `https://www.google.com/maps/dir/?${params.toString()}`,
      firstStop: start + 1,
      lastStop: start + chunk.length,
    });
  }

  return legs;
}
