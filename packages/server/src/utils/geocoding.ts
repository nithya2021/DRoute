import { Coordinate } from '@droute/shared';

// Singapore bounds for validation
const SINGAPORE_BOUNDS = {
  north: 1.4654,
  south: 1.1304,
  east: 104.9140,
  west: 103.6315,
};

// Mock postal code to coordinates mapping (Singapore)
// In production, this would use Google Maps Geocoding API
const POSTAL_CODE_MAP: Record<string, Coordinate> = {
  '018953': { latitude: 1.2832, longitude: 103.8589 }, // Marina Bay
  '039802': { latitude: 1.3763, longitude: 103.8479 }, // Changi Airport
  '388860': { latitude: 1.3314, longitude: 103.9115 }, // Changi Area
  '456318': { latitude: 1.3450, longitude: 103.9630 }, // Tampines
  '520098': { latitude: 1.3900, longitude: 103.8900 }, // Bedok
  '640084': { latitude: 1.2800, longitude: 103.7550 }, // Bukit Merah
  '678568': { latitude: 1.3800, longitude: 103.7800 }, // Clementi
  '737570': { latitude: 1.3300, longitude: 103.7900 }, // Queenstown
  '308649': { latitude: 1.2900, longitude: 103.8350 }, // City Center
};

export async function geocodeAddress(address: string, postalCode: string): Promise<Coordinate> {
  // Try exact postal code match first
  if (POSTAL_CODE_MAP[postalCode]) {
    return POSTAL_CODE_MAP[postalCode];
  }

  // Generate approximate coordinates based on postal code
  // Singapore postal codes are 6 digits
  const firstTwoDigits = postalCode.substring(0, 2);
  const coordinates = generateApproximateCoordinates(firstTwoDigits);

  if (coordinates) {
    return coordinates;
  }

  // Fallback to default Singapore center
  return {
    latitude: 1.3521,
    longitude: 103.8198,
  };
}

function generateApproximateCoordinates(postalPrefix: string): Coordinate | null {
  // Map postal code prefixes to Singapore regions
  const regionMap: Record<string, Coordinate> = {
    '01': { latitude: 1.2832, longitude: 103.8589 }, // CBD
    '02': { latitude: 1.2902, longitude: 103.8626 }, // Marina Bay
    '03': { latitude: 1.3763, longitude: 103.8479 }, // East Coast
    '04': { latitude: 1.3450, longitude: 103.9630 }, // Tampines
    '05': { latitude: 1.3900, longitude: 103.8900 }, // Bedok
    '06': { latitude: 1.2800, longitude: 103.7550 }, // Bukit Merah
    '07': { latitude: 1.3800, longitude: 103.7800 }, // Clementi
    '08': { latitude: 1.3300, longitude: 103.7900 }, // Queenstown
    '09': { latitude: 1.3521, longitude: 103.7957 }, // Orchard
    '10': { latitude: 1.3710, longitude: 103.8341 }, // Novena
  };

  return regionMap[postalPrefix] || null;
}

export function validateCoordinates(coords: Coordinate): boolean {
  return (
    coords.latitude >= SINGAPORE_BOUNDS.south &&
    coords.latitude <= SINGAPORE_BOUNDS.north &&
    coords.longitude >= SINGAPORE_BOUNDS.west &&
    coords.longitude <= SINGAPORE_BOUNDS.east
  );
}
