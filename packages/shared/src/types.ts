export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface DeliveryStop {
  id: string;
  address: string;
  postalCode: string;
  coordinates: Coordinate;
  customerName: string;
  contactNumber?: string;
  notes?: string;
}

export interface Driver {
  id: string;
  name: string;
  vehicleNumber: string;
  phoneNumber: string;
  status: 'active' | 'inactive';
}

export interface Route {
  id: string;
  driverId: string;
  stops: DeliveryStop[];
  totalDistance: number;
  estimatedDuration: number;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: Date;
  completedAt?: Date;
}

export interface DeliveryProof {
  id: string;
  stopId: string;
  routeId: string;
  timestamp: Date;
  imageUrl: string;
  signatureUrl?: string;
  notes?: string;
}

export interface SkippedRow {
  row: number;
  value: string;
  reason: string;
}

export interface ImportJob {
  id: string;
  filename: string;
  totalStops: number;
  processedStops: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  skippedRows?: SkippedRow[];
  createdAt: Date;
  completedAt?: Date;
}

export interface OptimizationResult {
  routes: Route[];
  totalStops: number;
  averageStopsPerRoute: number;
  totalDistance: number;
}
