import { ProductCard } from "./ProductCard";
import type { CartItem, FWProduct } from "@/lib/types";

export function ProductGrid({
  products,
  cartItems,
  onSelect,
}: {
  products: FWProduct[];
  cartItems: CartItem[];
  onSelect: (product: FWProduct) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
      {products.map((product, i) => (
        <div
          key={product.id}
          className="w-[calc(50%-6px)] sm:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)]"
        >
          <ProductCard
            product={product}
            index={i}
            onClick={() => onSelect(product)}
            inCart={cartItems.some((c) => c.productId === product.id)}
          />
        </div>
      ))}
    </div>
  );
}
