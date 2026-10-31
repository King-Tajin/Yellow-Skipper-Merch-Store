// noinspection JSUnusedGlobalSymbols,JSCheckFunctionSignatures

import { getListedProducts } from "../_shared/products.js";
import {
  applyMeta,
  notFoundMeta,
  ogCardPath,
  productMeta,
} from "../_shared/seo.js";

function readSlug(params) {
  const raw = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  try {
    return decodeURIComponent(raw ?? "");
  } catch {
    return "";
  }
}

async function hasOgCard(context, slug) {
  try {
    const url = new URL(ogCardPath(slug), context.request.url);
    const res = await context.env.ASSETS.fetch(url, { method: "HEAD" });
    const type = res.headers.get("content-type") ?? "";
    return res.ok && type.startsWith("image/");
  } catch {
    return false;
  }
}

export async function onRequestGet(context) {
  const page = await context.next();

  let products;
  try {
    products = await getListedProducts(context.env);
  } catch {
    return page;
  }

  const slug = readSlug(context.params);
  const product = products.find((p) => p.slug === slug);
  const meta = product
    ? productMeta(product, { hasOgCard: await hasOgCard(context, slug) })
    : notFoundMeta();
  const response = applyMeta(page, meta);
  response.headers.set("Cache-Control", "no-cache");
  return response;
}

export const onRequestHead = onRequestGet;
