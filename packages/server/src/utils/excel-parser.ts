import { read, utils } from 'xlsx';
import { DeliveryStop, Coordinate } from '@droute/shared';
import { geocodeAddress } from './geocoding';

export interface ParsedRow {
  address?: string;
  postalCode?: string;
  customerName?: string;
  contactNumber?: string;
  notes?: string;
}

export async function parseExcelFile(buffer: Buffer): Promise<DeliveryStop[]> {
  const workbook = read(buffer);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: ParsedRow[] = utils.sheet_to_json(worksheet);

  const stops: DeliveryStop[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    if (!row.address || !row.postalCode) {
      console.warn(`Skipping row ${i + 2}: missing address or postal code`);
      continue;
    }

    try {
      const coordinates = await geocodeAddress(row.address, row.postalCode);

      const stop: DeliveryStop = {
        id: `stop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        address: row.address.trim(),
        postalCode: row.postalCode.trim(),
        coordinates,
        customerName: row.customerName?.trim() || 'Unknown',
        contactNumber: row.contactNumber?.trim(),
        notes: row.notes?.trim(),
      };

      stops.push(stop);
    } catch (error) {
      console.warn(`Failed to geocode address: ${row.address}, ${row.postalCode}`, error);
    }
  }

  return stops;
}
