// noinspection JSUnusedGlobalSymbols,HttpUrlsUsage

import { fetchAsset } from "./_shared/http.js";
import { getListedProducts } from "./_shared/products.js";
import {
  SITE_ORIGIN,
  escapeXml,
  latestLastmod,
  ogImageUrl,
  parseLastUpdated,
  productUrl,
  toLastmod,
} from "./_shared/seo.js";

function lastmodTag(lastmod) {
  return lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : "";
}

function productEntry(product) {
  const images = (product.images ?? [])
    .slice(0, 1)
    .map(
      (image) =>
        `<image:image><image:loc>${escapeXml(ogImageUrl(image))}</image:loc><image:title>${escapeXml(product.name)}</image:title></image:image>`
    )
    .join("");
  return `  <url>
    <loc>${escapeXml(productUrl(product.slug))}</loc>${lastmodTag(toLastmod(product.updatedAt))}
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    ${images}
  </url>`;
}

const STATIC_PAGES = [
  { path: "/privacy", source: "/privacy_policy.txt" },
  { path: "/terms", source: "/terms_of_service.txt" },
];

function staticEntry(page, lastmod) {
  return `  <url>
    <loc>${SITE_ORIGIN}${page.path}</loc>${lastmodTag(lastmod)}
  </url>`;
}

async function readStaticLastmod(context, source) {
  try {
    const res = await fetchAsset(context.env, context.request, source);
    if (!res.ok) return null;
    return parseLastUpdated(await res.text());
  } catch {
    return null;
  }
}

export async function onRequestGet(context) {
  let products;
  try {
    products = await getListedProducts(context.env);
  } catch {
    return new Response("Sitemap temporarily unavailable", {
      status: 503,
      headers: { "Retry-After": "300", "Content-Type": "text/plain" },
    });
  }

  const staticLastmods = await Promise.all(
    STATIC_PAGES.map((page) => readStaticLastmod(context, page.source))
  );
  const homeLastmod = latestLastmod(products.map((p) => p.updatedAt));

  const entries = [
    ...STATIC_PAGES.map((page, i) => staticEntry(page, staticLastmods[i])),
    ...products.map(productEntry),
  ].join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${SITE_ORIGIN}/</loc>${lastmodTag(homeLastmod)}
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
${entries}
</urlset>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
