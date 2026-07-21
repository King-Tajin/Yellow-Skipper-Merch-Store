import type { CartItem, Currency, FWProduct } from "./types";

export const SHOP_URL = "https://fourthwall.king-tajin.dev";
export const HOMEPAGE_URL = "https://king-tajin.dev";
export const VAGUDLE_URL = "https://vagudle.king-tajin.dev";

interface StoreResponse {
  totalResults?: number;
  total?: number;
  results?: FWProduct[];
}

interface CheckoutResponse {
  ok: boolean;
  error?: string;
  detail?: string;
  cartId?: string;
}

export async function fetchProducts(currency: Currency): Promise<FWProduct[]> {
  const pageSize = 50;
  const firstRes = await fetch(
      `/api/store?size=${pageSize}&page=0&currency=${currency}`,
  );
  if (!firstRes.ok) throw new Error(`HTTP ${firstRes.status}`);
  const firstJson = (await firstRes.json()) as StoreResponse;
  const total: number = firstJson.totalResults ?? firstJson.total ?? 0;
  const results: FWProduct[] = firstJson.results ?? [];
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return results;
  const rest = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) =>
          fetch(`/api/store?size=${pageSize}&page=${i + 1}&currency=${currency}`)
              .then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json() as Promise<StoreResponse>;
              })
              .then((j) => j.results ?? []),
      ),
  );
  return [...results, ...rest.flat()];
}

export async function createCheckout(
    items: CartItem[],
    currency: Currency,
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
  const data: CheckoutResponse = await (res.json() as Promise<CheckoutResponse>).catch(
      () => ({ ok: false, error: `HTTP ${res.status}` }),
  );
  if (!data.ok) {
    throw new Error(
        data.detail
            ? `${data.error}: ${data.detail}`
            : (data.error ?? `HTTP ${res.status}`),
    );
  }
  return `${SHOP_URL}/checkout/?cartCurrency=${currency}&cartId=${data.cartId}`;
}
