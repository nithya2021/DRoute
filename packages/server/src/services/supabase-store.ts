import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DeliveryStop, Route, Driver, ImportJob, DeliveryProof } from '@droute/shared';

let supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required');
    }

    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabase;
}

export class SupabaseDataStore {
  // Stops
  async addStop(stop: DeliveryStop): Promise<void> {
    const { error } = await getSupabaseClient().from('delivery_stops').insert([stop]);
    if (error) throw error;
  }

  async addStops(stops: DeliveryStop[]): Promise<void> {
    const { error } = await getSupabaseClient().from('delivery_stops').insert(stops);
    if (error) throw error;
  }

  async getStop(id: string): Promise<DeliveryStop | undefined> {
    const { data, error } = await getSupabaseClient()
      .from('delivery_stops')
      .select('*')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getAllStops(): Promise<DeliveryStop[]> {
    const { data, error } = await getSupabaseClient().from('delivery_stops').select('*');
    if (error) throw error;
    return data || [];
  }

  async clearStops(): Promise<void> {
    const { error } = await getSupabaseClient().from('delivery_stops').delete().gt('id', '');
    if (error) throw error;
  }

  // Routes
  async addRoute(route: Route): Promise<void> {
    const { error } = await getSupabaseClient().from('routes').insert([route]);
    if (error) throw error;
  }

  async addRoutes(routes: Route[]): Promise<void> {
    const { error } = await getSupabaseClient().from('routes').insert(routes);
    if (error) throw error;
  }

  async getRoute(id: string): Promise<Route | undefined> {
    const { data, error } = await getSupabaseClient().from('routes').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getAllRoutes(): Promise<Route[]> {
    const { data, error } = await getSupabaseClient().from('routes').select('*');
    if (error) throw error;
    return data || [];
  }

  async getRoutesByDriver(driverId: string): Promise<Route[]> {
    const { data, error } = await getSupabaseClient().from('routes').select('*').eq('driver_id', driverId);
    if (error) throw error;
    return data || [];
  }

  async updateRoute(id: string, updates: Partial<Route>): Promise<Route | undefined> {
    const { data, error } = await getSupabaseClient().from('routes').update(updates).eq('id', id).select().single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Drivers
  async addDriver(driver: Driver): Promise<void> {
    const { error } = await getSupabaseClient().from('drivers').insert([driver]);
    if (error) throw error;
  }

  async addDrivers(drivers: Driver[]): Promise<void> {
    const { error } = await getSupabaseClient().from('drivers').insert(drivers);
    if (error) throw error;
  }

  async getDriver(id: string): Promise<Driver | undefined> {
    const { data, error } = await getSupabaseClient().from('drivers').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getAllDrivers(): Promise<Driver[]> {
    const { data, error } = await getSupabaseClient().from('drivers').select('*');
    if (error) throw error;
    return data || [];
  }

  // Import Jobs
  async addImportJob(job: ImportJob): Promise<void> {
    const { error } = await getSupabaseClient().from('import_jobs').insert([job]);
    if (error) throw error;
  }

  async getImportJob(id: string): Promise<ImportJob | undefined> {
    const { data, error } = await getSupabaseClient().from('import_jobs').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateImportJob(id: string, updates: Partial<ImportJob>): Promise<ImportJob | undefined> {
    const { data, error } = await getSupabaseClient()
      .from('import_jobs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getAllImportJobs(): Promise<ImportJob[]> {
    const { data, error } = await getSupabaseClient().from('import_jobs').select('*');
    if (error) throw error;
    return data || [];
  }

  // Delivery Proofs
  async addDeliveryProof(proof: DeliveryProof): Promise<void> {
    const { error } = await getSupabaseClient().from('delivery_proofs').insert([proof]);
    if (error) throw error;
  }

  async getDeliveryProof(id: string): Promise<DeliveryProof | undefined> {
    const { data, error } = await getSupabaseClient().from('delivery_proofs').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getDeliveryProofsByRoute(routeId: string): Promise<DeliveryProof[]> {
    const { data, error } = await getSupabaseClient().from('delivery_proofs').select('*').eq('route_id', routeId);
    if (error) throw error;
    return data || [];
  }
}

export const supabaseStore = new SupabaseDataStore();
