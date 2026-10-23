// noinspection JSUnusedGlobalSymbols
// noinspection JSUnresolvedVariable

import { collectionsUrl, getHandle, listFrom } from "../_shared/collections.js";
import {
  jsonResponse,
  optionsResponse,
  upstreamErrorResponse,
} from "../_shared/http.js";

export async function onRequestGet(context) {
  const fwRes = await fetch(collectionsUrl(context.env), { method: "GET" });

  if (!fwRes.ok) return upstreamErrorResponse(fwRes);

  const list = listFrom(await fwRes.json());
  const hiddenHandle = context.env.UNLISTED_COLLECTION_HANDLE ?? "unlisted";

  const visible = list.filter((c) => {
    const handle = getHandle(c);
    return handle !== hiddenHandle && handle !== "all";
  });

  return jsonResponse(visible);
}

export function onRequestOptions() {
  return optionsResponse("GET");
}
