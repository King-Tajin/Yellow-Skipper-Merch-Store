import { m } from "@/lib/motion";
import { Ban, ShoppingBag, ShoppingCart, Tag } from "lucide-react";
import { formatPrice, isProductSoldOut, productPath } from "@/lib/productUtils";
import type { FWProduct } from "@/lib/types";

export function ProductCard({
  product,
  index,
  onClick,
  inCart,
}: {
  product: FWProduct;
  index: number;
  onClick: () => void;
  inCart: boolean;
}) {
  const image = product.images[0];
  const variant = product.variants[0];
  const price = variant?.unitPrice;
  const soldOut = isProductSoldOut(product);

  return (
    <m.a
      href={productPath(product.slug)}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: "easeOut" }}
      className="group flex flex-col p-3 gap-3 cursor-pointer relative w-full"
      style={{
        background: "#100010",
        border: "4px solid",
        borderImageSlice: 1,
        borderImageSource: "linear-gradient(180deg, #5000aa 0%, #28007c 100%)",
      }}
      onClick={(e) => {
        if (
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey ||
          e.button !== 0
        ) {
          return;
        }
        e.preventDefault();
        onClick();
      }}
      aria-label={`View details for ${product.name}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {soldOut && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-1 rounded-full font-jakarta text-[9px] text-white bg-red-700">
          <Ban className="w-2.5 h-2.5" />
          SOLD OUT
        </div>
      )}
      {inCart && (
        <div
          className={`absolute left-2 z-10 flex items-center gap-1 px-2 py-1 font-jakarta text-[9px] text-obsidian-900 bg-crown-gold ${
            soldOut ? "top-9" : "top-2"
          }`}
        >
          <ShoppingCart className="w-2.5 h-2.5" />
          IN CART
        </div>
      )}

      <div className="relative aspect-square bg-obsidian-800 pixel-border-sm isolate">
        <div className="absolute inset-0.75 overflow-hidden">
          {image ? (
            <img
              src={image.url}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                soldOut ? "grayscale opacity-50" : ""
              }`}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-obsidian-600" />
            </div>
          )}
        </div>
        <div
          className="absolute top-0 right-0 w-0 h-0
                    border-t-28 border-t-crown-gold
                    border-l-28 border-l-transparent
                    opacity-80 group-hover:opacity-100 transition-opacity"
        />
        <div className="absolute inset-0 bg-crown-gold/0 group-hover:bg-crown-gold/5 transition-colors duration-300 flex items-center justify-center">
          <span className="font-jakarta text-xs text-white bg-obsidian-900/80 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pixel-border-sm">
            VIEW DETAILS
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-4 flex flex-col flex-1 gap-2 pixel-border-sm bg-obsidian-800">
        <h3 className="font-jakarta text-sm sm:text-base text-crown-amber leading-snug line-clamp-2 flex-1">
          {product.name}
        </h3>

        {price && (
          <div className="flex items-center gap-1.5">
            <Tag className="w-3 h-3 text-tajin-lime shrink-0" />
            <span
              className={`font-code text-xs sm:text-sm font-semibold ${
                soldOut ? "text-gray-500 line-through" : "text-tajin-lime"
              }`}
            >
              {formatPrice(price)}
            </span>
          </div>
        )}

        {soldOut ? (
          <div className="mt-1 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-red-900/20 border border-red-700/50 text-red-400 font-jakarta text-xs sm:text-sm">
            <Ban className="w-3 h-3" />
            SOLD OUT
          </div>
        ) : (
          <div className="mt-1 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-crown-gold/10 border border-crown-gold/40 group-hover:bg-crown-gold group-hover:border-crown-gold text-crown-gold group-hover:text-obsidian-900 font-jakarta text-xs sm:text-sm transition-colors duration-200">
            <ShoppingBag className="w-3 h-3" />
            VIEW ITEM
          </div>
        )}
      </div>
    </m.a>
  );
}
