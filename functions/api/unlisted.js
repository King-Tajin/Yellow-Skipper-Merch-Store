// noinspection JSUnusedGlobalSymbols
// noinspection JSUnresolvedVariable

import { collectionProductsUrl } from "../_shared/collections.js";
import {
  CORS,
  jsonResponse,
  optionsResponse,
  readJsonBody,
  upstreamErrorResponse,
} from "../_shared/http.js";

export async function onRequestPost(context) {
  const body = await readJsonBody(context.request);
  if (!body) return jsonResponse({ error: "Invalid JSON body" }, 400);

  const code = typeof body.code === "string" ? body.code : "";

  if (!context.env.UNLISTED_CODE || code !== context.env.UNLISTED_CODE) {
    return jsonResponse({ error: "Invalid code" }, 401);
  }

  const handle = context.env.UNLISTED_COLLECTION_HANDLE ?? "unlisted";
  const url = collectionProductsUrl(handle, context.env, {
    size: body.size ?? 50,
    page: body.page ?? 0,
    currency: body.currency ?? "USD",
  });

  const fwRes = await fetch(url, { method: "GET" });

  if (!fwRes.ok) return upstreamErrorResponse(fwRes);

  const data = await fwRes.text();

  return new Response(data, { status: fwRes.status, headers: CORS });
}

export function onRequestOptions() {
  return optionsResponse("POST");
}
