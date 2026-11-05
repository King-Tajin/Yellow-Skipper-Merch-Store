// noinspection JSUnresolvedReference

export const SITE_ORIGIN = "https://store.king-tajin.dev";
export const SITE_NAME = "Yellow Skipper Merch Store";
export const BRAND_NAME = "Yellow Skipper Games";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const MAX_DESCRIPTION = 160;
const MAX_JSON_LD_IMAGES = 5;

export const DEFAULT_IMAGE = {
  url: `${SITE_ORIGIN}/og-default.png`,
  width: OG_WIDTH,
  height: OG_HEIGHT,
  alt: SITE_NAME,
};

export function productUrl(slug) {
  return `${SITE_ORIGIN}/products/${encodeURIComponent(slug)}`;
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function escapeXml(value) {
  return escapeHtml(value);
}

const MONTH_NAMES = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

function pad(value) {
  return String(value).padStart(2, "0");
}

export function toLastmod(value) {
  if (!value) return null;
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return null;
  return new Date(time).toISOString();
}

export function latestLastmod(values) {
  let latest = -Infinity;
  for (const value of values) {
    const time = new Date(value ?? "").getTime();
    if (!Number.isNaN(time) && time > latest) latest = time;
  }
  if (latest === -Infinity) return null;
  return new Date(latest).toISOString();
}

export function parseLastUpdated(text) {
  const match = /^last updated:[ \t]*(.+)$/im.exec(String(text ?? ""));
  if (!match) return null;
  const value = match[1].trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return Number.isNaN(new Date(value).getTime()) ? null : value;
  }

  const parts = value.replace(/,/g, " ").split(/\s+/);
  const month = MONTH_NAMES.indexOf((parts[0] ?? "").toLowerCase());
  if (month === -1) return null;

  if (parts.length === 2 && /^\d{4}$/.test(parts[1])) {
    return `${parts[1]}-${pad(month + 1)}`;
  }

  if (
    parts.length === 3 &&
    /^\d{1,2}$/.test(parts[1]) &&
    /^\d{4}$/.test(parts[2])
  ) {
    const year = Number(parts[2]);
    const day = Number(parts[1]);
    const check = new Date(Date.UTC(year, month, day));
    if (check.getUTCMonth() !== month || check.getUTCDate() !== day)
      return null;
    return `${year}-${pad(month + 1)}-${pad(day)}`;
  }

  return null;
}

export function htmlToText(html) {
  return String(html ?? "")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>|<\/(p|div|li|h[1-6])>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(text, max = MAX_DESCRIPTION) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

export function serializeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function ogImageUrl(image) {
  return image.url;
}

export function ogCardFile(slug) {
  return `${String(slug).replace(/[^a-zA-Z0-9_-]/g, "_")}.jpg`;
}

export function ogCardPath(slug) {
  return `/og/${ogCardFile(slug)}`;
}

export function productDescription(product) {
  const text = htmlToText(product.description);
  if (text) return truncate(text);
  return truncate(`${product.name} - official merch from ${BRAND_NAME}.`);
}

export function productImage(product) {
  return (
    product.images?.[0] ??
    (product.variants ?? []).flatMap((v) => v.images ?? [])[0] ??
    null
  );
}

function isVariantSoldOut(variant, product) {
  if (product.state?.type === "SOLD_OUT") return true;
  const stock = variant.stock;
  return stock?.type === "LIMITED" && (stock.inStock ?? 0) <= 0;
}

export function isProductSoldOut(product) {
  if (product.state?.type === "SOLD_OUT") return true;
  const variants = product.variants ?? [];
  return (
    variants.length > 0 && variants.every((v) => isVariantSoldOut(v, product))
  );
}

function priceRange(product) {
  const prices = [];
  for (const variant of product.variants ?? []) {
    const price = variant.unitPrice;
    if (price && typeof price.value === "number") prices.push(price);
  }
  if (prices.length === 0) return null;
  const values = prices.map((p) => p.value);
  return {
    currency: prices[0].currency ?? "USD",
    low: Math.min(...values),
    high: Math.max(...values),
    count: prices.length,
  };
}

function buildOffers(product, url) {
  const range = priceRange(product);
  if (!range) return null;
  const availability = isProductSoldOut(product)
    ? "https://schema.org/OutOfStock"
    : "https://schema.org/InStock";
  const base = {
    url,
    priceCurrency: range.currency,
    availability,
    itemCondition: "https://schema.org/NewCondition",
  };
  if (range.low === range.high) {
    return { "@type": "Offer", ...base, price: range.low.toFixed(2) };
  }
  return {
    "@type": "AggregateOffer",
    ...base,
    lowPrice: range.low.toFixed(2),
    highPrice: range.high.toFixed(2),
    offerCount: range.count,
  };
}

export function buildProductJsonLd(product, url) {
  const images = (product.images ?? [])
    .slice(0, MAX_JSON_LD_IMAGES)
    .map((image) => ogImageUrl(image));
  const offers = buildOffers(product, url);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: productDescription(product),
    url,
    ...(images.length > 0 ? { image: images } : {}),
    ...(product.variants?.[0]?.id ? { sku: product.variants[0].id } : {}),
    brand: { "@type": "Brand", name: BRAND_NAME },
    ...(offers ? { offers } : {}),
  };
}

function resolveOgImage(product, hasOgCard) {
  if (hasOgCard) {
    return {
      url: `${SITE_ORIGIN}${ogCardPath(product.slug)}`,
      width: OG_WIDTH,
      height: OG_HEIGHT,
      alt: product.name,
    };
  }
  const source = productImage(product);
  if (!source) return DEFAULT_IMAGE;
  return {
    url: ogImageUrl(source),
    width: source.width,
    height: source.height,
    alt: product.name,
  };
}

export function productMeta(product, { hasOgCard = false } = {}) {
  const url = productUrl(product.slug);
  const image = resolveOgImage(product, hasOgCard);
  const range = priceRange(product);
  const extraHead = [
    `<script type="application/ld+json">${serializeJsonLd(buildProductJsonLd(product, url))}</script>`,
  ];
  if (range) {
    extraHead.push(
      `<meta property="product:price:amount" content="${escapeHtml(range.low.toFixed(2))}" />`,
      `<meta property="product:price:currency" content="${escapeHtml(range.currency)}" />`,
      `<meta property="product:availability" content="${isProductSoldOut(product) ? "out of stock" : "in stock"}" />`
    );
  }
  return {
    title: `${product.name} | ${SITE_NAME}`,
    description: productDescription(product),
    url,
    type: "product",
    image,
    extraHead,
    fallbackHtml: productFallbackHtml(product, image, range),
  };
}

export function productFallbackHtml(product, image, range) {
  const parts = [`<h1>${escapeHtml(product.name)}</h1>`];
  if (image && image !== DEFAULT_IMAGE) {
    parts.push(
      `<img src="${escapeHtml(image.url)}" alt="${escapeHtml(product.name)}" width="${escapeHtml(image.width)}" height="${escapeHtml(image.height)}" />`
    );
  }
  parts.push(`<p>${escapeHtml(productDescription(product))}</p>`);
  if (range) {
    parts.push(
      `<p>Price: ${escapeHtml(range.currency)} ${escapeHtml(range.low.toFixed(2))}</p>`
    );
  }
  parts.push(
    `<p>JavaScript is required to buy this item.</p><p><a href="/">Back to ${escapeHtml(SITE_NAME)}</a></p>`
  );
  return parts.join("");
}

export function homeFallbackHtml(products) {
  const items = products
    .map(
      (product) =>
        `<li><a href="/products/${encodeURIComponent(product.slug)}">${escapeHtml(product.name)}</a></li>`
    )
    .join("");
  return `<h1>${escapeHtml(SITE_NAME)}</h1><p>Official merch from ${escapeHtml(BRAND_NAME)}. JavaScript is required to shop.</p><nav aria-label="Products"><ul>${items}</ul></nav>`;
}

export function applyMeta(response, meta) {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) return response;

  const rewriter = new HTMLRewriter();
  const setAttribute = (selector, attribute, value) => {
    if (value === undefined || value === null) return;
    rewriter.on(selector, {
      element(element) {
        element.setAttribute(attribute, escapeHtml(value));
      },
    });
  };

  if (meta.title) {
    rewriter.on("title", {
      element(element) {
        element.setInnerContent(meta.title);
      },
    });
  }
  setAttribute('meta[name="title"]', "content", meta.title);
  setAttribute('meta[name="description"]', "content", meta.description);
  setAttribute('meta[name="robots"]', "content", meta.robots);
  setAttribute('link[rel="canonical"]', "href", meta.url);
  setAttribute('meta[property="og:type"]', "content", meta.type);
  setAttribute('meta[property="og:url"]', "content", meta.url);
  setAttribute('meta[property="og:title"]', "content", meta.title);
  setAttribute('meta[property="og:description"]', "content", meta.description);
  setAttribute('meta[name="twitter:title"]', "content", meta.title);
  setAttribute('meta[name="twitter:description"]', "content", meta.description);

  if (meta.image) {
    setAttribute('meta[property="og:image"]', "content", meta.image.url);
    setAttribute(
      'meta[property="og:image:width"]',
      "content",
      meta.image.width
    );
    setAttribute(
      'meta[property="og:image:height"]',
      "content",
      meta.image.height
    );
    setAttribute('meta[property="og:image:alt"]', "content", meta.image.alt);
    setAttribute('meta[name="twitter:image"]', "content", meta.image.url);
    setAttribute('meta[name="twitter:image:alt"]', "content", meta.image.alt);
  }

  if (meta.extraHead?.length) {
    rewriter.on("head", {
      element(element) {
        element.append(meta.extraHead.join(""), { html: true });
      },
    });
  }

  if (meta.fallbackHtml) {
    rewriter.on("noscript#seo-fallback", {
      element(element) {
        element.setInnerContent(meta.fallbackHtml, { html: true });
      },
    });
  }

  return rewriter.transform(response);
}
