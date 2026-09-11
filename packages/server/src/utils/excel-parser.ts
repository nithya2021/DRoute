import { read, utils } from 'xlsx';
import { DeliveryStop, SkippedRow } from '@droute/shared';
import { geocode } from './geocoding';

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

// Singapore addresses usually carry the postal code inline rather than in its
// own column, and the marker varies: "S 518208", ",S518208", "(S)730764",
// "Singapore 259957". Take the last six-digit group so a unit number like
// #15-1206 cannot be mistaken for one.
export function extractPostalCode(address: string): string | undefined {
  const matches = address.match(/(?:^|[\s,(])(?:s(?:ingapore)?\)?[\s.]*)?(\d{6})(?!\d)/gi);
  if (!matches) {
    return undefined;
  }

  const last = matches[matches.length - 1].match(/(\d{6})(?!\d)/);
  return last ? last[1] : undefined;
}

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

export interface ParseResult {
  stops: DeliveryStop[];
  skipped: SkippedRow[];
}

export async function parseExcelFile(buffer: Buffer): Promise<ParseResult> {
  const workbook = read(buffer);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows: Record<string, unknown>[] = utils.sheet_to_json(worksheet);

  const stops: DeliveryStop[] = [];
  const skipped: SkippedRow[] = [];

  for (let i = 0; i < rawRows.length; i++) {
    const row = normalizeRow(rawRows[i]);
    const rowNumber = i + 2;

    if (!row.address) {
      continue;
    }

    // Excel treats a postal code as a number and drops its leading zero, so
    // 018953 arrives as 18953.
    const rawPostalCode = row.postalCode?.trim() || extractPostalCode(row.address);

    if (!rawPostalCode) {
      skipped.push({ row: rowNumber, value: row.address, reason: 'no postal code found' });
      continue;
    }

    const postalCode = rawPostalCode.padStart(6, '0');

    try {
      const { coordinates, source } = await geocode(row.address, postalCode);

      stops.push({
        id: `stop_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        address: row.address.trim(),
        postalCode,
        coordinates,
        locationSource: source,
        customerName: row.customerName?.trim() || 'Unknown',
        contactNumber: row.contactNumber?.trim(),
        notes: row.notes?.trim(),
      });
    } catch (error) {
      skipped.push({ row: rowNumber, value: row.address, reason: 'could not be geocoded' });
    }
  }

  return { stops, skipped };
}
