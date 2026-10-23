import type { CartItem, Currency, FWCollection, FWProduct } from "./types";

export const SHOP_URL = "https://fourthwall.king-tajin.dev";
export const HOMEPAGE_URL = "https://king-tajin.dev";
export const VAGUDLE_URL = "https://vagudle.king-tajin.dev";

interface StoreResponse {
  totalResults?: number;
  total?: number;
  paging?: { elementsTotal?: number };
  results?: FWProduct[];
}

interface CheckoutResponse {
  ok: boolean;
  error?: string;
  code?: string;
  detail?: string;
  cartId?: string;
  unavailableVariantIds?: string[];
}

interface AvailabilityResponse {
  ok: boolean;
  error?: string;
  unavailableVariantIds?: string[];
}

export class UnavailableItemsError extends Error {
  variantIds: string[];

  constructor(variantIds: string[]) {
    super("Some items are currently unavailable");
    this.name = "UnavailableItemsError";
    this.variantIds = variantIds;
  }
}

async function fetchAllPages(
  fetchPage: (page: number) => Promise<StoreResponse>,
  pageSize: number
): Promise<FWProduct[]> {
  const firstJson = await fetchPage(0);
  const total: number =
    firstJson.paging?.elementsTotal ??
    firstJson.totalResults ??
    firstJson.total ??
    0;
  const results: FWProduct[] = firstJson.results ?? [];
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return results;
  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) =>
      fetchPage(i + 1).then((j) => j.results ?? [])
    )
  );
  return [...results, ...rest.flat()];
}

async function readCheckoutResponse(res: Response): Promise<CheckoutResponse> {
  try {
    return (await res.json()) as CheckoutResponse;
  } catch {
    return { ok: false, error: `HTTP ${res.status}` };
  }
}

export async function fetchProducts(
  currency: Currency,
  collection = "all"
): Promise<FWProduct[]> {
  const pageSize = 50;
  const fetchPage = async (page: number): Promise<StoreResponse> => {
    const res = await fetch(
      `/api/store?size=${pageSize}&page=${page}&currency=${currency}&collection=${collection}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as StoreResponse;
  };

  return fetchAllPages(fetchPage, pageSize);
}

export async function fetchCollections(): Promise<FWCollection[]> {
  const res = await fetch("/api/collections");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as FWCollection[];
}

export async function fetchUnlistedProducts(
  code: string,
  currency: Currency
): Promise<FWProduct[]> {
  const pageSize = 50;

  const fetchPage = async (page: number): Promise<StoreResponse> => {
    const res = await fetch("/api/unlisted", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, size: pageSize, page, currency }),
    });
    if (res.status === 401) throw new Error("Invalid code");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as StoreResponse;
  };

  return fetchAllPages(fetchPage, pageSize);
}

export async function createCheckout(
  items: CartItem[],
  currency: Currency
): Promise<string> {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      currency,
      items: items.map((i) => ({
        variantId: i.variantId,
        quantity: i.quantity,
      })),
    }),
  });
  const data = await readCheckoutResponse(res);
  if (!data.ok) {
    if (data.code === "CART_OFFER_NOT_AVAILABLE") {
      throw new UnavailableItemsError(data.unavailableVariantIds ?? []);
    }
    throw new Error(
      data.detail
        ? `${data.error}: ${data.detail}`
        : (data.error ?? `HTTP ${res.status}`)
    );
  }
  return `${SHOP_URL}/checkout/?cartCurrency=${currency}&cartId=${data.cartId}`;
}

export async function fetchUnavailableVariants(
  variantIds: string[],
  currency: Currency
): Promise<string[]> {
  const res = await fetch("/api/availability", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ variantIds, currency }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as AvailabilityResponse;
  if (!data.ok) throw new Error(data.error ?? "Availability check failed");
  return data.unavailableVariantIds ?? [];
}
