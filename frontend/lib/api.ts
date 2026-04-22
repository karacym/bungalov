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

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getBungalows() {
  return apiFetch<Bungalow[]>('/bungalows');
}

export async function getBungalow(id: string) {
  return apiFetch<Bungalow>(`/bungalows/${id}`);
}

export async function getAvailability(bungalowId: string) {
  return apiFetch<AvailabilityRow[]>(`/availability/${bungalowId}`);
}
