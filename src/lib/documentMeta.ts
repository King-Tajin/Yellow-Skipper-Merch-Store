import { productPath } from "./productUtils";
import type { FWProduct } from "./types";

const SITE_ORIGIN = "https://store.king-tajin.dev";
const SITE_NAME = "Yellow Skipper Merch Store";
const SITE_TITLE =
  "Yellow Skipper Merch Store | Official Yellow Skipper Games Merch";
const SITE_DESCRIPTION =
  "Official Yellow Skipper Games merch. Shop apparel, accessories and more straight from the studio behind Vagudle.";
const DEFAULT_IMAGE = `${SITE_ORIGIN}/og-default.png`;
const MAX_DESCRIPTION = 160;

interface DocumentMeta {
  title: string;
  description: string;
  url: string;
  image: string;
  type: string;
}

let applied = false;

function setContent(selector: string, value: string) {
  document.head.querySelector(selector)?.setAttribute("content", value);
}

function applyMeta(meta: DocumentMeta) {
  document.title = meta.title;
  setContent('meta[name="title"]', meta.title);
  setContent('meta[name="description"]', meta.description);
  setContent('meta[property="og:type"]', meta.type);
  setContent('meta[property="og:url"]', meta.url);
  setContent('meta[property="og:title"]', meta.title);
  setContent('meta[property="og:description"]', meta.description);
  setContent('meta[property="og:image"]', meta.image);
  setContent('meta[name="twitter:title"]', meta.title);
  setContent('meta[name="twitter:description"]', meta.description);
  setContent('meta[name="twitter:image"]', meta.image);
  document.head
    .querySelector('link[rel="canonical"]')
    ?.setAttribute("href", meta.url);
}

function htmlToText(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent ?? "").replace(/\s+/g, " ").trim();
}

function truncate(text: string): string {
  if (text.length <= MAX_DESCRIPTION) return text;
  const cut = text.slice(0, MAX_DESCRIPTION - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const end = lastSpace > MAX_DESCRIPTION * 0.6 ? lastSpace : cut.length;
  return `${cut.slice(0, end).trim()}…`;
}

export function applyProductMeta(product: FWProduct) {
  const text = htmlToText(product.description ?? "");
  applyMeta({
    title: `${product.name} | ${SITE_NAME}`,
    description: truncate(
      text || `${product.name} - official merch from Yellow Skipper Games.`
    ),
    url: `${SITE_ORIGIN}${productPath(product.slug)}`,
    image: product.images[0]?.url ?? DEFAULT_IMAGE,
    type: "product",
  });
  applied = true;
}

export function resetDocumentMeta() {
  if (!applied) return;
  applyMeta({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: `${SITE_ORIGIN}/`,
    image: DEFAULT_IMAGE,
    type: "website",
  });
  applied = false;
}
