import { Coordinate } from '@droute/shared';

const SINGAPORE_BOUNDS = {
  north: 1.4654,
  south: 1.1304,
  east: 104.914,
  west: 103.6315,
};

const SINGAPORE_CENTER: Coordinate = { latitude: 1.3521, longitude: 103.8198 };

// Singapore's 28 postal districts, keyed by the first two digits of the postal
// code. Approximate district centres — swap for the Google Geocoding API when a
// key is available. Every valid prefix (01-82) must appear here: an unmapped
// prefix falls back to a shared centre point, which collapses distinct
// addresses onto one coordinate and yields zero-distance routes.
const DISTRICT_COORDINATES: Record<string, Coordinate> = {
  '01': { latitude: 1.283, longitude: 103.8513 },
  '02': { latitude: 1.283, longitude: 103.8513 },
  '03': { latitude: 1.283, longitude: 103.8513 },
  '04': { latitude: 1.283, longitude: 103.8513 },
  '05': { latitude: 1.283, longitude: 103.8513 },
  '06': { latitude: 1.283, longitude: 103.8513 },
  '07': { latitude: 1.2764, longitude: 103.8437 },
  '08': { latitude: 1.2764, longitude: 103.8437 },
  '09': { latitude: 1.2653, longitude: 103.822 },
  '10': { latitude: 1.2653, longitude: 103.822 },
  '11': { latitude: 1.301, longitude: 103.765 },
  '12': { latitude: 1.301, longitude: 103.765 },
  '13': { latitude: 1.301, longitude: 103.765 },
  '14': { latitude: 1.2947, longitude: 103.8063 },
  '15': { latitude: 1.2947, longitude: 103.8063 },
  '16': { latitude: 1.2947, longitude: 103.8063 },
  '17': { latitude: 1.2905, longitude: 103.852 },
  '18': { latitude: 1.3005, longitude: 103.856 },
  '19': { latitude: 1.3005, longitude: 103.856 },
  '20': { latitude: 1.3067, longitude: 103.8517 },
  '21': { latitude: 1.3067, longitude: 103.8517 },
  '22': { latitude: 1.305, longitude: 103.832 },
  '23': { latitude: 1.305, longitude: 103.832 },
  '24': { latitude: 1.322, longitude: 103.8 },
  '25': { latitude: 1.322, longitude: 103.8 },
  '26': { latitude: 1.322, longitude: 103.8 },
  '27': { latitude: 1.322, longitude: 103.8 },
  '28': { latitude: 1.321, longitude: 103.843 },
  '29': { latitude: 1.321, longitude: 103.843 },
  '30': { latitude: 1.321, longitude: 103.843 },
  '31': { latitude: 1.334, longitude: 103.856 },
  '32': { latitude: 1.334, longitude: 103.856 },
  '33': { latitude: 1.334, longitude: 103.856 },
  '34': { latitude: 1.338, longitude: 103.876 },
  '35': { latitude: 1.338, longitude: 103.876 },
  '36': { latitude: 1.338, longitude: 103.876 },
  '37': { latitude: 1.338, longitude: 103.876 },
  '38': { latitude: 1.318, longitude: 103.89 },
  '39': { latitude: 1.318, longitude: 103.89 },
  '40': { latitude: 1.318, longitude: 103.89 },
  '41': { latitude: 1.318, longitude: 103.89 },
  '42': { latitude: 1.305, longitude: 103.902 },
  '43': { latitude: 1.305, longitude: 103.902 },
  '44': { latitude: 1.305, longitude: 103.902 },
  '45': { latitude: 1.305, longitude: 103.902 },
  '46': { latitude: 1.324, longitude: 103.93 },
  '47': { latitude: 1.324, longitude: 103.93 },
  '48': { latitude: 1.324, longitude: 103.93 },
  '49': { latitude: 1.356, longitude: 103.977 },
  '50': { latitude: 1.356, longitude: 103.977 },
  '81': { latitude: 1.356, longitude: 103.977 },
  '51': { latitude: 1.354, longitude: 103.944 },
  '52': { latitude: 1.354, longitude: 103.944 },
  '53': { latitude: 1.37, longitude: 103.893 },
  '54': { latitude: 1.37, longitude: 103.893 },
  '55': { latitude: 1.37, longitude: 103.893 },
  '82': { latitude: 1.37, longitude: 103.893 },
  '56': { latitude: 1.366, longitude: 103.848 },
  '57': { latitude: 1.366, longitude: 103.848 },
  '58': { latitude: 1.338, longitude: 103.777 },
  '59': { latitude: 1.338, longitude: 103.777 },
  '60': { latitude: 1.333, longitude: 103.742 },
  '61': { latitude: 1.333, longitude: 103.742 },
  '62': { latitude: 1.333, longitude: 103.742 },
  '63': { latitude: 1.333, longitude: 103.742 },
  '64': { latitude: 1.333, longitude: 103.742 },
  '65': { latitude: 1.369, longitude: 103.764 },
  '66': { latitude: 1.369, longitude: 103.764 },
  '67': { latitude: 1.369, longitude: 103.764 },
  '68': { latitude: 1.369, longitude: 103.764 },
  '69': { latitude: 1.397, longitude: 103.715 },
  '70': { latitude: 1.397, longitude: 103.715 },
  '71': { latitude: 1.397, longitude: 103.715 },
  '72': { latitude: 1.437, longitude: 103.786 },
  '73': { latitude: 1.437, longitude: 103.786 },
  '77': { latitude: 1.39, longitude: 103.825 },
  '78': { latitude: 1.39, longitude: 103.825 },
  '75': { latitude: 1.43, longitude: 103.835 },
  '76': { latitude: 1.43, longitude: 103.835 },
  '79': { latitude: 1.405, longitude: 103.87 },
  '80': { latitude: 1.405, longitude: 103.87 },
};

// Spread stops that share a district so they do not land on identical
// coordinates, which would make every intra-district leg measure zero.
function jitterWithinDistrict(base: Coordinate, postalCode: string): Coordinate {
  const seed = Number(postalCode.slice(2)) || 0;
  const offsetLat = ((seed % 97) / 97 - 0.5) * 0.018;
  const offsetLng = ((seed % 89) / 89 - 0.5) * 0.018;
  return {
    latitude: base.latitude + offsetLat,
    longitude: base.longitude + offsetLng,
  };
}

export async function geocodeAddress(address: string, postalCode: string): Promise<Coordinate> {
  const normalized = String(postalCode).trim().padStart(6, '0');
  const district = DISTRICT_COORDINATES[normalized.substring(0, 2)];

  if (!district) {
    return SINGAPORE_CENTER;
  }

  return jitterWithinDistrict(district, normalized);
}

export function validateCoordinates(coords: Coordinate): boolean {
  return (
    coords.latitude >= SINGAPORE_BOUNDS.south &&
    coords.latitude <= SINGAPORE_BOUNDS.north &&
    coords.longitude >= SINGAPORE_BOUNDS.west &&
    coords.longitude <= SINGAPORE_BOUNDS.east
  );
}
