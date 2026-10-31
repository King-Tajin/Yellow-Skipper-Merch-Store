import {
  collectionProductsUrl,
  collectionsUrl,
  getHandle,
  getTotal,
  listFrom,
} from "./collections.js";

const PAGE_SIZE = 50;
const CACHE_TTL_SECONDS = 300;
const CACHE_KEY = "https://store.king-tajin.dev/__cache/listed-products";

async function requestCollectionIdsPage(handle, env, page, size) {
  const url = collectionProductsUrl(handle, env, { size, page });
  const res = await fetch(url, { method: "GET" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Collection ${handle}: HTTP ${res.status}`);
  return res.json();
}

export async function fetchCollectionIds(handle, env, { strict = false } = {}) {
  const ids = new Set();
  const pageSize = 100;
  let page = 0;
  let total = Infinity;

  while (page * pageSize < total) {
    let json;
    try {
      json = await requestCollectionIdsPage(handle, env, page, pageSize);
    } catch (error) {
      if (strict) throw error;
      break;
    }
    if (!json) break;
    total = getTotal(json);
    for (const product of json.results ?? []) ids.add(product.id);
    page += 1;
  }

  return ids;
}

export async function fetchNamedCollectionHandles(env, unlistedHandle) {
  try {
    const res = await fetch(collectionsUrl(env));
    if (!res.ok) return [];
    const handles = listFrom(await res.json()).map(getHandle);
    return handles.filter(
      (handle) => handle && handle !== "all" && handle !== unlistedHandle
    );
  } catch {
    return [];
  }
}

export async function fetchExcludedIds(collection, unlistedHandle, env) {
  const handles =
    collection === "all"
      ? [
          unlistedHandle,
          ...(await fetchNamedCollectionHandles(env, unlistedHandle)),
        ]
      : [unlistedHandle];
  const idSets = await Promise.all(
    handles.map((handle) => fetchCollectionIds(handle, env))
  );
  return new Set(idSets.flatMap((s) => [...s]));
}

async function fetchCollectionPage(handle, env, page, currency) {
  const url = collectionProductsUrl(handle, env, {
    size: PAGE_SIZE,
    page,
    currency,
  });
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`Collection ${handle}: HTTP ${res.status}`);
  return res.json();
}

async function fetchAllCollectionProducts(handle, env, currency) {
  const first = await fetchCollectionPage(handle, env, 0, currency);
  const results = first.results ?? [];
  const totalPages = Math.ceil(getTotal(first) / PAGE_SIZE);
  if (totalPages <= 1) return results;
  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) =>
      fetchCollectionPage(handle, env, i + 1, currency).then(
        (json) => json.results ?? []
      )
    )
  );
  return [...results, ...rest.flat()];
}

export async function fetchListedProducts(env, currency) {
  const unlistedHandle = env.UNLISTED_COLLECTION_HANDLE ?? "unlisted";
  const [all, unlistedIds] = await Promise.all([
    fetchAllCollectionProducts("all", env, currency),
    fetchCollectionIds(unlistedHandle, env, { strict: true }),
  ]);
  const seen = new Set();
  return all.filter((product) => {
    if (unlistedIds.has(product.id) || seen.has(product.id)) return false;
    seen.add(product.id);
    return true;
  });
}

export async function getListedProducts(env, currency = "USD") {
  const cache = caches.default;
  const key = new Request(`${CACHE_KEY}?currency=${currency}`);
  const hit = await cache.match(key);
  if (hit) return hit.json();

  const products = await fetchListedProducts(env, currency);
  await cache.put(
    key,
    new Response(JSON.stringify(products), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}`,
      },
    })
  );
  return products;
}
