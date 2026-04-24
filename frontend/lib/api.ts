export type Bungalow = {
  id: string;
  title: string;
  description: string;
  pricePerNight: number | string;
  location: string;
  images: string[];
  features: Record<string, unknown>;
};

export type AvailabilityRow = {
  id: string;
  bungalowId: string;
  date: string;
  isAvailable: boolean;
};

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
}

export function toAbsoluteMediaUrl(pathOrUrl: string) {
  if (!pathOrUrl) return pathOrUrl;
  if (
    pathOrUrl.startsWith('http://') ||
    pathOrUrl.startsWith('https://') ||
    pathOrUrl.startsWith('blob:') ||
    pathOrUrl.startsWith('data:')
  ) {
    return pathOrUrl;
  }
  const apiBase = getApiBaseUrl();
  const apiRoot = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;
  return `${apiRoot}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
}

/** Kayit icin uploads yolunu koru; tam URL ise api kokune gore goreceli yola indir. */
export function toRelativeMediaUrl(pathOrUrl: string) {
  if (!pathOrUrl) return pathOrUrl;
  if (pathOrUrl.startsWith('/uploads/')) return pathOrUrl;

  const apiBase = getApiBaseUrl();
  const apiRoot = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;
  if (pathOrUrl.startsWith(`${apiRoot}/uploads/`)) {
    return pathOrUrl.slice(apiRoot.length);
  }
  if (pathOrUrl.startsWith('http://localhost:4000/uploads/')) {
    return pathOrUrl.replace('http://localhost:4000', '');
  }
  return pathOrUrl;
}

function normalizeBungalow<T extends Bungalow>(item: T): T {
  return {
    ...item,
    images: (item.images ?? []).map((image) => toAbsoluteMediaUrl(String(image))),
  };
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = getApiBaseUrl();
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      next: { revalidate: 60 },
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'fetch failed';
    throw new Error(
      `API erisilemedi (${baseUrl}). Backend calisiyor mu ve frontend/.env.local icindeki NEXT_PUBLIC_API_URL dogru mu? (${reason})`,
      { cause: err },
    );
  }

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

/** Ag / sunucu hatasinda bos dizi doner; sayfa kirilmaz. */
export async function getBungalows(): Promise<Bungalow[]> {
  try {
    const rows = await apiFetch<Bungalow[]>('/bungalows');
    return rows.map((item) => normalizeBungalow(item));
  } catch {
    return [];
  }
}

export async function searchBungalows(params: {
  checkIn: string;
  checkOut: string;
  guests: number;
}): Promise<Bungalow[]> {
  const query = new URLSearchParams({
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    guests: String(params.guests),
  }).toString();

  try {
    const rows = await apiFetch<Bungalow[]>(`/bungalows/search?${query}`);
    return rows.map((item) => normalizeBungalow(item));
  } catch {
    return [];
  }
}

/** Ag / sunucu veya 404 durumunda null. */
export async function getBungalow(id: string): Promise<Bungalow | null> {
  try {
    const item = await apiFetch<Bungalow>(`/bungalows/${id}`);
    return normalizeBungalow(item);
  } catch {
    return null;
  }
}

export async function getAvailability(bungalowId: string) {
  try {
    return await apiFetch<AvailabilityRow[]>(`/availability/${bungalowId}`);
  } catch {
    return [];
  }
}

export type ContactPayload = {
  name: string;
  email: string;
  phone?: string;
  message: string;
};

/** Genel iletisim formu (kimlik gerektirmez). */
export async function postContactMessage(payload: ContactPayload): Promise<{ ok: true } | { ok: false; message: string }> {
  const baseUrl = getApiBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      let msg = `HTTP ${response.status}`;
      try {
        const body = (await response.json()) as { message?: string | string[] };
        if (body.message) {
          msg = Array.isArray(body.message) ? body.message.join(', ') : String(body.message);
        }
      } catch {
        const t = await response.text();
        if (t) msg = t.slice(0, 200);
      }
      return { ok: false, message: msg };
    }
    return { ok: true };
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'fetch failed';
    return { ok: false, message: reason };
  }
}
