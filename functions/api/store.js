// noinspection JSUnusedGlobalSymbols
// noinspection JSUnresolvedVariable

const FW_COLLECTIONS = "https://storefront-api.fourthwall.com/v1/collections";

function getTotal(json) {
  return json.paging?.elementsTotal ?? json.totalResults ?? json.total ?? 0;
}

async function fetchCollectionIds(handle, env) {
  const ids = new Set();
  const pageSize = 100;
  let page = 0;
  let total = Infinity;

  try {
    while (page * pageSize < total) {
      const url = `${FW_COLLECTIONS}/${handle}/products?storefront_token=${env.FW_TOKEN}&size=${pageSize}&page=${page}`;
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) break;
      const json = await res.json();
      total = getTotal(json);
      for (const product of json.results ?? []) ids.add(product.id);
      page += 1;
    }
  } catch {
    return ids;
  }

  return ids;
}

async function fetchNamedCollectionHandles(env, unlistedHandle) {
  try {
    const res = await fetch(
      `${FW_COLLECTIONS}?storefront_token=${env.FW_TOKEN}`,
    );
    if (!res.ok) return [];
    const json = await res.json();
    const list = Array.isArray(json) ? json : (json.results ?? []);
    return list
      .map((c) => c.slug ?? c.handle ?? "")
      .filter((h) => h && h !== "all" && h !== unlistedHandle);
  } catch {
    return [];
  }
}

export async function onRequestGet(context) {
  const incoming = new URL(context.request.url);
  const size = incoming.searchParams.get("size") ?? "50";
  const page = incoming.searchParams.get("page") ?? "0";
  const currency = incoming.searchParams.get("currency") ?? "USD";
  const debug = incoming.searchParams.get("debug") === "1";
  const unlistedHandle = context.env.UNLISTED_COLLECTION_HANDLE ?? "unlisted";
  const requested = incoming.searchParams.get("collection") ?? "all";
  const collection = requested === unlistedHandle ? "all" : requested;

  const url = `${FW_COLLECTIONS}/${collection}/products?storefront_token=${context.env.FW_TOKEN}&size=${size}&page=${page}&currency=${currency}`;

  const excludeIdsPromise =
    collection === "all"
      ? (async () => {
          const namedHandles = await fetchNamedCollectionHandles(
            context.env,
            unlistedHandle,
          );
          const idSets = await Promise.all(
            [unlistedHandle, ...namedHandles].map((h) =>
              fetchCollectionIds(h, context.env),
            ),
          );
          return new Set(idSets.flatMap((s) => [...s]));
        })()
      : fetchCollectionIds(unlistedHandle, context.env);

  const [fwRes, excludeIds] = await Promise.all([
    fetch(url, { method: "GET" }),
    excludeIdsPromise,
  ]);

  if (!fwRes.ok) {
    const errorBody = await fwRes.text();
    return new Response(errorBody, {
      status: fwRes.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  const json = await fwRes.json();
  const originalResults = json.results ?? [];
  const filteredResults = originalResults.filter(
    (product) => !excludeIds.has(product.id),
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
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  return new Response(JSON.stringify(filtered), {
    status: fwRes.status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
