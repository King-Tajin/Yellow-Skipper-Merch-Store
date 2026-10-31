// noinspection JSUnusedGlobalSymbols,HttpUrlsUsage

import { getListedProducts } from "./_shared/products.js";
import {
  SITE_ORIGIN,
  escapeXml,
  ogImageUrl,
  productUrl,
} from "./_shared/seo.js";

function productEntry(product) {
  const images = (product.images ?? [])
    .slice(0, 1)
    .map(
      (image) =>
        `<image:image><image:loc>${escapeXml(ogImageUrl(image))}</image:loc><image:title>${escapeXml(product.name)}</image:title></image:image>`
    )
    .join("");
  return `  <url>
    <loc>${escapeXml(productUrl(product.slug))}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    ${images}
  </url>`;
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

  const entries = products.map(productEntry).join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${SITE_ORIGIN}/</loc>
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
