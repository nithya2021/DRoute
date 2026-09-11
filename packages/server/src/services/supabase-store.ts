import { createClient } from '@supabase/supabase-js';
import { DeliveryStop } from '@droute/shared';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class SupabaseDataStore {
  async addAddress(address: DeliveryStop, batchId: string): Promise<void> {
    const { error } = await supabase.from('addresses').insert([
      {
        id: address.id,
        upload_batch_id: batchId,
        name: address.customerName,
        address: address.address,
        latitude: address.coordinates.latitude,
        longitude: address.coordinates.longitude,
      },
    ]);
    if (error) throw error;
  }

  async getAddressesByBatch(batchId: string): Promise<DeliveryStop[]> {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('upload_batch_id', batchId);
    if (error) throw error;

    return (data || []).map((d) => ({
      id: d.id,
      address: d.address,
      postalCode: '',
      customerName: d.name,
      coordinates: {
        latitude: d.latitude,
        longitude: d.longitude,
      },
    }));
  }

  async saveRouteCalculation(
    batchId: string,
    sourceId: string,
    destinationId: string,
    orderedStopIds: string[],
    totalDistance: number,
    totalDuration: number
  ): Promise<string> {
    const routeId = `route_${Date.now()}`;
    const { error } = await supabase.from('route_calculations').insert([
      {
        id: routeId,
        upload_batch_id: batchId,
        source_address_id: sourceId,
        destination_address_id: destinationId,
        ordered_stops: orderedStopIds,
        total_distance: totalDistance,
        total_duration: totalDuration,
      },
    ]);
    if (error) throw error;
    return routeId;
  }

  async getRouteCalculation(
    routeId: string
  ): Promise<{
    id: string;
    orderedStopIds: string[];
    totalDistance: number;
    totalDuration: number;
    batchId: string;
  } | null> {
    const { data, error } = await supabase
      .from('route_calculations')
      .select('*')
      .eq('id', routeId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return {
      id: data.id,
      orderedStopIds: data.ordered_stops || [],
      totalDistance: data.total_distance,
      totalDuration: data.total_duration,
      batchId: data.upload_batch_id,
    };
  }

  async createUploadJob(id: string, filename: string, totalRecords: number): Promise<void> {
    const { error } = await supabase.from('upload_jobs').insert([
      {
        id,
        filename,
        total_records: totalRecords,
        status: 'processing',
      },
    ]);
    if (error) throw error;
  }

  async updateUploadJob(
    id: string,
    status: string,
    processedRecords: number,
    errorMessage?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('upload_jobs')
      .update({
        status,
        processed_records: processedRecords,
        error_message: errorMessage,
        completed_at: ['completed', 'failed'].includes(status) ? new Date().toISOString() : null,
      })
      .eq('id', id);
    if (error) throw error;
  }

  // Backward compatibility stubs
  async getAllDrivers(): Promise<any[]> {
    return [];
  }

  async getDriver(id?: string): Promise<any> {
    return null;
  }

  async getAllStops(): Promise<DeliveryStop[]> {
    return [];
  }

  async addStops(stops?: DeliveryStop[]): Promise<void> {}

  async clearStops(): Promise<void> {}

  async addImportJob(job?: any): Promise<void> {}

  async updateImportJob(id?: string, updates?: any): Promise<any> {
    return null;
  }

  async getImportJob(id?: string): Promise<any> {
    return null;
  }

  async getAllImportJobs(): Promise<any[]> {
    return [];
  }

  async addRoutes(routes?: any[]): Promise<void> {}

  async getAllRoutes(): Promise<any[]> {
    return [];
  }

  async getRoute(id?: string): Promise<any> {
    return null;
  }

  async updateRoute(id?: string, updates?: any): Promise<any> {
    return null;
  }

  async getRoutesByDriver(driverId?: string): Promise<any[]> {
    return [];
  }

  async addDeliveryProof(proof?: any): Promise<void> {}

  async getDeliveryProofsByRoute(routeId?: string): Promise<any[]> {
    return [];
  }
}

export const supabaseStore = new SupabaseDataStore();
