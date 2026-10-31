import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";
import { fetchListedProducts } from "../functions/_shared/products.js";
import {
  OG_HEIGHT,
  OG_WIDTH,
  ogCardFile,
  productImage,
} from "../functions/_shared/seo.js";

const CONCURRENCY = 4;
const IMAGE_PADDING = 48;
const ASPECT_WIDTH = 3;
const ASPECT_HEIGHT = 4;
const FETCH_TIMEOUT_MS = 20000;
const JPEG_QUALITY = 88;

const BACKGROUND_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}">
  <defs>
    <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
      <path d="M32 0H0V32" fill="none" stroke="#181508" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <rect width="100%" height="100%" fill="url(#grid)"/>
  <rect x="28" y="28" width="${OG_WIDTH - 56}" height="${OG_HEIGHT - 56}" fill="none" stroke="#5000aa" stroke-width="8"/>
</svg>`;

async function downloadImage(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function renderCard(source, outFile) {
  const height = OG_HEIGHT - IMAGE_PADDING * 2;
  const width = Math.round((height * ASPECT_WIDTH) / ASPECT_HEIGHT);
  const photo = await sharp(source)
    .resize(width, height, { fit: "cover", position: "centre" })
    .toBuffer();
  await sharp(Buffer.from(BACKGROUND_SVG))
    .composite([
      {
        input: photo,
        left: Math.round((OG_WIDTH - width) / 2),
        top: IMAGE_PADDING,
      },
    ])
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toFile(outFile);
}

export async function generateOgImages({ env, outDir }) {
  const products = await fetchListedProducts(env, "USD");
  await mkdir(outDir, { recursive: true });

  const queue = products
    .map((product) => ({ product, image: productImage(product) }))
    .filter((entry) => entry.image);
  const stats = {
    written: 0,
    failed: 0,
    skipped: products.length - queue.length,
  };

  async function worker() {
    for (let entry = queue.pop(); entry; entry = queue.pop()) {
      const { product, image } = entry;
      try {
        const source = await downloadImage(image.url);
        await renderCard(source, path.join(outDir, ogCardFile(product.slug)));
        stats.written += 1;
      } catch (error) {
        stats.failed += 1;
        console.warn(`og card skipped for ${product.slug}: ${error.message}`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  return stats;
}

function loadLocalVars(root) {
  const file = path.join(root, ".dev.vars");
  if (existsSync(file) && typeof process.loadEnvFile === "function") {
    process.loadEnvFile(file);
  }
}

async function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  loadLocalVars(root);
  if (!process.env.FW_TOKEN) {
    console.warn("FW_TOKEN not set, skipping product og card generation");
    return;
  }
  try {
    const stats = await generateOgImages({
      env: {
        FW_TOKEN: process.env.FW_TOKEN,
        UNLISTED_COLLECTION_HANDLE: process.env.UNLISTED_COLLECTION_HANDLE,
      },
      outDir: path.join(root, "dist", "og"),
    });
    console.log(
      `og cards: ${stats.written} written, ${stats.failed} failed, ${stats.skipped} without image`
    );
  } catch (error) {
    console.warn(`og card generation skipped: ${error.message}`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
