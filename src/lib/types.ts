export interface FWImage {
  id: string;
  url: string;
  width: number;
  height: number;
}

export interface FWPrice {
  value: number;
  currency: string;
}

export interface FWVariantAttributes {
  description?: string;
  color?: { name: string; swatch?: string };
  size?: { name: string };
}

export interface FWVariant {
  id: string;
  name: string;
  unitPrice: FWPrice;
  attributes?: FWVariantAttributes;
  images?: FWImage[];
}

export interface FWAdditionalInfo {
  type: string;
  title: string;
  bodyHtml: string;
}

export interface FWCollection {
  id: string;
  name: string;
  slug: string;
}

export interface FWProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  additionalInformation?: FWAdditionalInfo[];
  sizeGuide?: string | null;
  images: FWImage[];
  variants: FWVariant[];
}

export interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  variantColor?: string;
  variantSize?: string;
  price: FWPrice;
  imageUrl?: string;
  quantity: number;
  slug: string;
}

export const CURRENCIES = [
  "USD",
  "EUR",
  "CAD",
  "GBP",
  "AUD",
  "NZD",
  "SEK",
  "NOK",
  "DKK",
  "PLN",
  "JPY",
  "MXN",
  "BRL",
] as const;
export type Currency = (typeof CURRENCIES)[number];
