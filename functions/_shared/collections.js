const FW_COLLECTIONS = "https://storefront-api.fourthwall.com/v1/collections";

export function collectionsUrl(env) {
  return `${FW_COLLECTIONS}?storefront_token=${env.FW_TOKEN}`;
}

export function collectionProductsUrl(handle, env, params) {
  const query = new URLSearchParams({
    storefront_token: env.FW_TOKEN,
    ...params,
  });
  return `${FW_COLLECTIONS}/${handle}/products?${query}`;
}

export function getTotal(json) {
  return json.paging?.elementsTotal ?? json.totalResults ?? json.total ?? 0;
}

export function getHandle(collection) {
  return collection.slug ?? collection.handle ?? "";
}

export function listFrom(json) {
  return Array.isArray(json) ? json : (json.results ?? []);
}
