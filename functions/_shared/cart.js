import { readJsonBody } from "./http.js";

const FW_BASE = "https://storefront-api.fourthwall.com/v1";

export function cartsUrl(env) {
  return `${FW_BASE}/carts?storefront_token=${env.FW_TOKEN}`;
}

export async function readCartRequest(request, listKey, emptyError) {
  const body = await readJsonBody(request);
  if (!body) return { error: "Invalid JSON body" };
  const list = Array.isArray(body[listKey]) ? body[listKey] : [];
  if (list.length === 0) return { error: emptyError };
  return { currency: body.currency ?? "USD", list };
}

export function postCart(items, currency, env) {
  return fetch(cartsUrl(env), {
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
}

async function probeVariant(variantId, currency, env) {
  try {
    const res = await postCart([{ variantId, quantity: 1 }], currency, env);
    if (res.ok) return "available";
    const body = await res.json().catch(() => null);
    return body?.code === "CART_OFFER_NOT_AVAILABLE"
      ? "unavailable"
      : "unknown";
  } catch {
    return "unknown";
  }
}

export async function probeVariants(variantIds, currency, env) {
  const ids = [...new Set(variantIds)];
  const statuses = await Promise.all(
    ids.map((id) => probeVariant(id, currency, env))
  );
  return {
    unavailable: ids.filter((_, i) => statuses[i] === "unavailable"),
    unknown: ids.filter((_, i) => statuses[i] === "unknown"),
  };
}
