// noinspection JSUnusedGlobalSymbols,JSCheckFunctionSignatures

import { fetchAsset } from "../_shared/http.js";
import { getListedProducts } from "../_shared/products.js";
import { applyMeta, ogCardPath, productMeta } from "../_shared/seo.js";

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

async function notFoundPage(context) {
  const res = await fetchAsset(context.env, context.request, "/404.html");
  if (!res.ok) return new Response("Page not found", { status: 404 });
  const response = new Response(res.body, {
    status: 404,
    headers: res.headers,
  });
  response.headers.set("Cache-Control", "no-cache");
  return response;
}

export async function onRequestGet(context) {
  const page = await fetchAsset(context.env, context.request, "/");

  let products;
  try {
    products = await getListedProducts(context.env);
  } catch {
    return page;
  }

  const slug = readSlug(context.params);
  const product = products.find((p) => p.slug === slug);
  if (!product) return notFoundPage(context);

  const meta = productMeta(product, {
    hasOgCard: await hasOgCard(context, slug),
  });
  const response = applyMeta(page, meta);
  response.headers.set("Cache-Control", "no-cache");
  return response;
}

export const onRequestHead = onRequestGet;
