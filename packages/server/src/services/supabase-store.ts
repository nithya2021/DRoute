import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DeliveryStop, Route, Driver, ImportJob, DeliveryProof } from '@droute/shared';

let client: SupabaseClient | null = null;

function db(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    // Server-side only: this key bypasses row level security, so it must never
    // be sent to the browser or committed.
    const key = process.env.SUPABASE_SECRET_KEY;
    if (!url || !key) {
      throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY must be set in .env');
    }
    client = createClient(url, key);
  }
  return client;
}

// Postgres columns are snake_case and flat; domain types are camelCase and nested.
function fail(operation: string, error: { message: string; details?: string; hint?: string }): never {
  const parts = [error.message, error.details, error.hint].filter(Boolean);
  throw new Error(`${operation}: ${parts.join(' | ')}`);
}

const stopToRow = (s: DeliveryStop) => ({
  id: s.id,
  address: s.address,
  postal_code: s.postalCode,
  customer_name: s.customerName,
  contact_number: s.contactNumber ?? null,
  notes: s.notes ?? null,
  latitude: s.coordinates?.latitude ?? null,
  longitude: s.coordinates?.longitude ?? null,
});

const stopFromRow = (r: any): DeliveryStop => ({
  id: r.id,
  address: r.address,
  postalCode: r.postal_code,
  customerName: r.customer_name,
  contactNumber: r.contact_number ?? undefined,
  notes: r.notes ?? undefined,
  coordinates: { latitude: r.latitude, longitude: r.longitude },
});

const driverFromRow = (r: any): Driver => ({
  id: r.id,
  name: r.name,
  vehicleNumber: r.vehicle_number,
  phoneNumber: r.phone_number,
  status: r.status,
});

const driverToRow = (d: Driver) => ({
  id: d.id,
  name: d.name,
  vehicle_number: d.vehicleNumber,
  phone_number: d.phoneNumber,
  status: d.status,
});

const routeToRow = (r: Route) => ({
  id: r.id,
  driver_id: r.driverId,
  status: r.status,
  stops: r.stops.map(stopToRow),
  total_distance: r.totalDistance,
  estimated_duration: r.estimatedDuration,
  created_at: r.createdAt,
  completed_at: r.completedAt ?? null,
});

const routeFromRow = (r: any): Route => ({
  id: r.id,
  driverId: r.driver_id,
  status: r.status,
  stops: (r.stops ?? []).map(stopFromRow),
  totalDistance: r.total_distance ?? 0,
  estimatedDuration: r.estimated_duration ?? 0,
  createdAt: new Date(r.created_at),
  completedAt: r.completed_at ? new Date(r.completed_at) : undefined,
});

const routeUpdateToRow = (u: Partial<Route>) => {
  const row: Record<string, unknown> = {};
  if (u.driverId !== undefined) row.driver_id = u.driverId;
  if (u.status !== undefined) row.status = u.status;
  if (u.stops !== undefined) row.stops = u.stops.map(stopToRow);
  if (u.totalDistance !== undefined) row.total_distance = u.totalDistance;
  if (u.estimatedDuration !== undefined) row.estimated_duration = u.estimatedDuration;
  if (u.completedAt !== undefined) row.completed_at = u.completedAt;
  return row;
};

const jobToRow = (j: ImportJob) => ({
  id: j.id,
  filename: j.filename,
  status: j.status,
  total_stops: j.totalStops,
  processed_stops: j.processedStops,
  error_message: j.errorMessage ?? null,
  skipped_rows: j.skippedRows ?? [],
  created_at: j.createdAt,
  completed_at: j.completedAt ?? null,
});

const jobFromRow = (r: any): ImportJob => ({
  id: r.id,
  filename: r.filename,
  status: r.status,
  totalStops: r.total_stops ?? 0,
  processedStops: r.processed_stops ?? 0,
  errorMessage: r.error_message ?? undefined,
  skippedRows: r.skipped_rows ?? [],
  createdAt: new Date(r.created_at),
  completedAt: r.completed_at ? new Date(r.completed_at) : undefined,
});

const proofToRow = (p: DeliveryProof) => ({
  id: p.id,
  route_id: p.routeId,
  stop_id: p.stopId,
  image_url: p.imageUrl,
  signature_url: p.signatureUrl ?? null,
  notes: p.notes ?? null,
  timestamp: p.timestamp,
});

const proofFromRow = (r: any): DeliveryProof => ({
  id: r.id,
  routeId: r.route_id,
  stopId: r.stop_id,
  imageUrl: r.image_url,
  signatureUrl: r.signature_url ?? undefined,
  notes: r.notes ?? undefined,
  timestamp: new Date(r.timestamp),
});

export class SupabaseDataStore {
  async addStops(stops: DeliveryStop[]): Promise<void> {
    if (stops.length === 0) return;
    const { error } = await db().from('delivery_stops').insert(stops.map(stopToRow));
    if (error) fail('addStops', error);
  }

  async getAllStops(): Promise<DeliveryStop[]> {
    const { data, error } = await db().from('delivery_stops').select('*');
    if (error) fail('getAllStops', error);
    return (data ?? []).map(stopFromRow);
  }

  async clearStops(): Promise<void> {
    const { error } = await db().from('delivery_stops').delete().neq('id', '');
    if (error) fail('clearStops', error);
  }

  async addRoutes(routes: Route[]): Promise<void> {
    if (routes.length === 0) return;
    const { error } = await db().from('routes').insert(routes.map(routeToRow));
    if (error) fail('addRoutes', error);
  }

  async getRoute(id: string): Promise<Route | undefined> {
    const { data, error } = await db().from('routes').select('*').eq('id', id).maybeSingle();
    if (error) fail('getRoute', error);
    return data ? routeFromRow(data) : undefined;
  }

  async getAllRoutes(): Promise<Route[]> {
    const { data, error } = await db().from('routes').select('*');
    if (error) fail('getAllRoutes', error);
    return (data ?? []).map(routeFromRow);
  }

  async getRoutesByDriver(driverId: string): Promise<Route[]> {
    const { data, error } = await db().from('routes').select('*').eq('driver_id', driverId);
    if (error) fail('getRoutesByDriver', error);
    return (data ?? []).map(routeFromRow);
  }

  async updateRoute(id: string, updates: Partial<Route>): Promise<Route | undefined> {
    const { data, error } = await db()
      .from('routes')
      .update(routeUpdateToRow(updates))
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) fail('updateRoute', error);
    return data ? routeFromRow(data) : undefined;
  }

  async addDrivers(drivers: Driver[]): Promise<void> {
    if (drivers.length === 0) return;
    const { error } = await db().from('drivers').insert(drivers.map(driverToRow));
    if (error) fail('addDrivers', error);
  }

  async getDriver(id: string): Promise<Driver | undefined> {
    const { data, error } = await db().from('drivers').select('*').eq('id', id).maybeSingle();
    if (error) fail('getDriver', error);
    return data ? driverFromRow(data) : undefined;
  }

  async getAllDrivers(): Promise<Driver[]> {
    const { data, error } = await db().from('drivers').select('*');
    if (error) fail('getAllDrivers', error);
    return (data ?? []).map(driverFromRow);
  }

  async addImportJob(job: ImportJob): Promise<void> {
    const { error } = await db().from('import_jobs').insert([jobToRow(job)]);
    if (error) fail('addImportJob', error);
  }

  async getImportJob(id: string): Promise<ImportJob | undefined> {
    const { data, error } = await db().from('import_jobs').select('*').eq('id', id).maybeSingle();
    if (error) fail('getImportJob', error);
    return data ? jobFromRow(data) : undefined;
  }

  async updateImportJob(id: string, job: ImportJob): Promise<ImportJob | undefined> {
    const { data, error } = await db()
      .from('import_jobs')
      .update(jobToRow(job))
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) fail('updateImportJob', error);
    return data ? jobFromRow(data) : undefined;
  }

  async getAllImportJobs(): Promise<ImportJob[]> {
    const { data, error } = await db().from('import_jobs').select('*');
    if (error) fail('getAllImportJobs', error);
    return (data ?? []).map(jobFromRow);
  }

  async addDeliveryProof(proof: DeliveryProof): Promise<void> {
    const { error } = await db().from('delivery_proofs').insert([proofToRow(proof)]);
    if (error) fail('addDeliveryProof', error);
  }

  async getDeliveryProofsByRoute(routeId: string): Promise<DeliveryProof[]> {
    const { data, error } = await db().from('delivery_proofs').select('*').eq('route_id', routeId);
    if (error) fail('getDeliveryProofsByRoute', error);
    return (data ?? []).map(proofFromRow);
  }
}

export const supabaseStore = new SupabaseDataStore();
