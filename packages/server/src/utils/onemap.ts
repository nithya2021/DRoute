import { Coordinate } from '@droute/shared';

const SEARCH_URL = 'https://www.onemap.gov.sg/api/common/elastic/search';
const TOKEN_URL = 'https://www.onemap.gov.sg/api/auth/post/getToken';
const REQUEST_TIMEOUT_MS = 8000;

interface CachedToken {
  value: string;
  expiresAt: number;
}

let cachedToken: CachedToken | null = null;
const coordinateCache = new Map<string, Coordinate | null>();

// A sheet of 58 addresses means 58 lookups. If OneMap is down, letting each
// one burn the full timeout would stall the request for minutes, so give up on
// the whole run after a few consecutive failures and use districts instead.
const MAX_CONSECUTIVE_FAILURES = 3;
let consecutiveFailures = 0;
let disabledForRun = false;

export function resetOneMapCircuit(): void {
  consecutiveFailures = 0;
  disabledForRun = false;
}

// OneMap tokens last about three days, so a static value in .env goes stale
// without warning. Reading the exp claim lets us refresh before that happens
// rather than discovering it through a failed run.
function expiryFromJwt(token: string): number {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return typeof payload.exp === 'number' ? payload.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

async function fetchWithTimeout(url: string, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function resolveToken(): Promise<string | null> {
  const oneMinute = 60_000;
  if (cachedToken && cachedToken.expiresAt - oneMinute > Date.now()) {
    return cachedToken.value;
  }

  const email = process.env.ONEMAP_EMAIL;
  const password = process.env.ONEMAP_PASSWORD;

  if (email && password) {
    const response = await fetchWithTimeout(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(`OneMap rejected the credentials (HTTP ${response.status})`);
    }

    const body = (await response.json()) as { access_token?: string };
    if (!body.access_token) {
      throw new Error('OneMap returned no access_token');
    }

    cachedToken = {
      value: body.access_token,
      expiresAt: expiryFromJwt(body.access_token) || Date.now() + 24 * 60 * 60 * 1000,
    };
    return cachedToken.value;
  }

  const staticToken = process.env.ONEMAP_TOKEN;
  if (staticToken) {
    const expiresAt = expiryFromJwt(staticToken);
    if (expiresAt && expiresAt < Date.now()) {
      throw new Error('ONEMAP_TOKEN has expired. Set ONEMAP_EMAIL and ONEMAP_PASSWORD to refresh automatically.');
    }
    cachedToken = { value: staticToken, expiresAt: expiresAt || Date.now() + 60 * 60 * 1000 };
    return cachedToken.value;
  }

  return null;
}

export function isOneMapConfigured(): boolean {
  return Boolean(
    (process.env.ONEMAP_EMAIL && process.env.ONEMAP_PASSWORD) || process.env.ONEMAP_TOKEN
  );
}

/**
 * Exact coordinates for a Singapore postal code, or null when OneMap is not
 * configured, unreachable, or has no record of it. Never throws: a failed
 * lookup falls back to the postal district rather than failing the whole run.
 */
export async function geocodeWithOneMap(postalCode: string): Promise<Coordinate | null> {
  if (coordinateCache.has(postalCode)) {
    return coordinateCache.get(postalCode)!;
  }

  if (disabledForRun) {
    return null;
  }

  let result: Coordinate | null = null;

  try {
    const token = await resolveToken();
    if (token) {
      const url = `${SEARCH_URL}?searchVal=${encodeURIComponent(postalCode)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;
      const response = await fetchWithTimeout(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const body = (await response.json()) as {
          results?: Array<{ LATITUDE?: string; LONGITUDE?: string }>;
        };
        const match = body.results?.find((r) => r.LATITUDE && r.LONGITUDE);

        if (match) {
          const latitude = Number(match.LATITUDE);
          const longitude = Number(match.LONGITUDE);
          if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
            result = { latitude, longitude };
          }
        }
      } else if (response.status === 401) {
        // Force a refresh on the next call rather than reusing a dead token.
        cachedToken = null;
        console.warn(`[onemap] token rejected for ${postalCode}; falling back to district`);
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    consecutiveFailures++;
    console.warn(`[onemap] lookup failed for ${postalCode}: ${message}`);

    if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      disabledForRun = true;
      console.warn(
        `[onemap] ${consecutiveFailures} consecutive failures; using postal districts for the rest of this run`
      );
    }
    return null;
  }

  consecutiveFailures = 0;
  coordinateCache.set(postalCode, result);
  return result;
}
