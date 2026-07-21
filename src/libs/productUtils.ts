import type { CartItem, FWImage, FWPrice, FWProduct, FWVariant } from "./types";

export function formatPrice(price: FWPrice): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency ?? "USD",
    minimumFractionDigits: 2,
  }).format(price.value);
}

export function stripColorStyles(html: string): string {
  return html.replace(/(<[^>]+)style="([^"]*)"/gi, (_, tag, styles) => {
    const cleaned = styles
      .split(";")
      .filter((s: string) => !/^\s*color\s*:/i.test(s))
      .join(";")
      .replace(/;+$/, "");
    return cleaned.trim() ? `${tag}style="${cleaned}"` : tag;
  });
}

export function getColorsAndSizes(variants: FWVariant[]) {
  const colors: string[] = [];
  const sizes: string[] = [];
  for (const v of variants) {
    const color = v.attributes?.color?.name;
    const size = v.attributes?.size?.name;
    if (color && !colors.includes(color)) colors.push(color);
    if (size && !sizes.includes(size)) sizes.push(size);
  }
  return { colors, sizes };
}

export function findVariant(
  variants: FWVariant[],
  color: string,
  size: string,
): FWVariant | undefined {
  return variants.find((v) => {
    const vColor = v.attributes?.color?.name ?? "";
    const vSize = v.attributes?.size?.name ?? "";
    const colorMatch = !color || vColor === color;
    const sizeMatch = !size || vSize === size;
    return colorMatch && sizeMatch;
  });
}

export function getImagesForVariant(
  product: FWProduct,
  color: string,
  size: string,
): FWImage[] {
  const variantImages: FWImage[] = [];
  const seen = new Set<string>();
  for (const v of product.variants) {
    const vColor = v.attributes?.color?.name ?? "";
    const vSize = v.attributes?.size?.name ?? "";
    const colorMatch = !color || vColor === color;
    const sizeMatch = !size || vSize === size;
    if (!colorMatch || !sizeMatch) continue;
    for (const img of v.images ?? []) {
      if (!seen.has(img.id)) {
        seen.add(img.id);
        variantImages.push(img);
      }
    }
  }
  return variantImages.length > 0 ? variantImages : product.images;
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price.value * item.quantity, 0);
}
