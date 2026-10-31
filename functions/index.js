// noinspection JSUnusedGlobalSymbols

import { getListedProducts } from "./_shared/products.js";
import { applyMeta, homeFallbackHtml } from "./_shared/seo.js";

export async function onRequestGet(context) {
  const page = await context.next();

  let products;
  try {
    products = await getListedProducts(context.env);
  } catch {
    return page;
  }

  return applyMeta(page, { fallbackHtml: homeFallbackHtml(products) });
}

export const onRequestHead = onRequestGet;
