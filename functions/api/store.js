// noinspection JSUnusedGlobalSymbols
// noinspection JSUnresolvedVariable

import { collectionProductsUrl, getTotal } from "../_shared/collections.js";
import {
  CORS,
  jsonResponse,
  optionsResponse,
  upstreamErrorResponse,
} from "../_shared/http.js";
import { fetchExcludedIds } from "../_shared/products.js";

export async function onRequestGet(context) {
  const incoming = new URL(context.request.url);
  const debug = incoming.searchParams.get("debug") === "1";
  const unlistedHandle = context.env.UNLISTED_COLLECTION_HANDLE ?? "unlisted";
  const requested = incoming.searchParams.get("collection") ?? "all";
  const collection = requested === unlistedHandle ? "all" : requested;

  const url = collectionProductsUrl(collection, context.env, {
    size: incoming.searchParams.get("size") ?? "50",
    page: incoming.searchParams.get("page") ?? "0",
    currency: incoming.searchParams.get("currency") ?? "USD",
  });

  const [fwRes, excludeIds] = await Promise.all([
    fetch(url, { method: "GET" }),
    fetchExcludedIds(collection, unlistedHandle, context.env),
  ]);

  if (!fwRes.ok) return upstreamErrorResponse(fwRes);

  const json = await fwRes.json();
  const originalResults = json.results ?? [];
  const filteredResults = originalResults.filter(
    (product) => !excludeIds.has(product.id)
  );
  const removed = originalResults.length - filteredResults.length;
  const filtered = {
    ...json,
    results: filteredResults,
    totalResults: getTotal(json) - removed,
  };

  if (debug) {
    const first = filtered.results?.[0] ?? filtered;
    return new Response(JSON.stringify(first, null, 2), {
      status: fwRes.status,
      headers: CORS,
    });
  }

  return jsonResponse(filtered, fwRes.status);
}

export function onRequestOptions() {
  return optionsResponse("GET");
}
