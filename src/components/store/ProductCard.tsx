import { motion } from "framer-motion";
import { ShoppingBag, ShoppingCart, Tag } from "lucide-react";
import { formatPrice } from "@/libs/productUtils";
import type { FWProduct } from "@/libs/types";

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

  return (
    <motion.div
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
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${product.name}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {inCart && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-1 font-pixel text-[9px] text-obsidian-900 bg-crown-gold">
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
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
          <span className="font-pixel text-xs text-white bg-obsidian-900/80 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pixel-border-sm">
            VIEW DETAILS
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-4 flex flex-col flex-1 gap-2 pixel-border-sm bg-obsidian-800">
        <h3 className="font-pixel text-sm sm:text-base text-crown-amber leading-snug line-clamp-2 flex-1">
          {product.name}
        </h3>

        {price && (
          <div className="flex items-center gap-1.5">
            <Tag className="w-3 h-3 text-tajin-lime shrink-0" />
            <span className="font-code text-xs sm:text-sm text-tajin-lime font-semibold">
              {formatPrice(price)}
            </span>
          </div>
        )}

        <div className="mt-1 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-crown-gold/10 border border-crown-gold/40 group-hover:bg-crown-gold group-hover:border-crown-gold text-crown-gold group-hover:text-obsidian-900 font-pixel text-xs sm:text-sm transition-colors duration-200">
          <ShoppingBag className="w-3 h-3" />
          VIEW ITEM
        </div>
      </div>
    </motion.div>
  );
}
