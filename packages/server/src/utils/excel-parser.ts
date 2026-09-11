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

// Spreadsheets come from people, not APIs, so headers arrive as "Postal Code",
// "POSTAL_CODE", "postalcode" and so on. Match on letters and digits only.
const COLUMN_ALIASES: Record<string, keyof ParsedRow> = {
  address: 'address',
  deliveryaddress: 'address',
  street: 'address',
  postalcode: 'postalCode',
  postcode: 'postalCode',
  zip: 'postalCode',
  zipcode: 'postalCode',
  customername: 'customerName',
  customer: 'customerName',
  name: 'customerName',
  recipient: 'customerName',
  contactnumber: 'contactNumber',
  contact: 'contactNumber',
  phone: 'contactNumber',
  phonenumber: 'contactNumber',
  mobile: 'contactNumber',
  notes: 'notes',
  note: 'notes',
  remarks: 'notes',
  instructions: 'notes',
};

function normalizeRow(raw: Record<string, unknown>): ParsedRow {
  const row: ParsedRow = {};

  for (const [key, value] of Object.entries(raw)) {
    const field = COLUMN_ALIASES[key.toLowerCase().replace(/[^a-z0-9]/g, '')];
    if (field && value !== null && value !== undefined) {
      row[field] = String(value);
    }
  }

  return row;
}

export async function parseExcelFile(buffer: Buffer): Promise<DeliveryStop[]> {
  const workbook = read(buffer);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows: Record<string, unknown>[] = utils.sheet_to_json(worksheet);

  const stops: DeliveryStop[] = [];

  for (let i = 0; i < rawRows.length; i++) {
    const row = normalizeRow(rawRows[i]);

    if (!row.address || !row.postalCode) {
      console.warn(`Skipping row ${i + 2}: missing address or postal code`);
      continue;
    }

    // Excel treats a postal code as a number and drops its leading zero, so
    // 018953 arrives as 18953.
    const postalCode = row.postalCode.trim().padStart(6, '0');

    try {
      const coordinates = await geocodeAddress(row.address, postalCode);

      const stop: DeliveryStop = {
        id: `stop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        address: row.address.trim(),
        postalCode,
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
