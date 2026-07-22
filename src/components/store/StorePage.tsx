import { m, AnimatePresence } from "@/lib/motion";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  ExternalLink,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { fetchProducts, HOMEPAGE_URL, SHOP_URL, VAGUDLE_URL } from "@/lib/api";
import { CartDrawer } from "./CartDrawer";
import { ProductCard } from "./ProductCard";
import { ProductModal } from "./ProductModal";
import { SkeletonCard } from "./SkeletonCard";
import { CURRENCIES } from "@/lib/types";
import type { CartItem, Currency, FWProduct } from "@/lib/types";

export default function StorePage() {
  const [products, setProducts] = useState<FWProduct[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [activeProduct, setActiveProduct] = useState<FWProduct | null>(null);
  const [currency, setCurrency] = useState<Currency>("USD");

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("ysg-merch-cart:v1");
      return saved ? (JSON.parse(saved) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("ysg-merch-cart:v1", JSON.stringify(cartItems));
    } catch {}
  }, [cartItems]);

  const totalCartQty = cartItems.reduce((s, i) => s + i.quantity, 0);

  function addToCart(item: CartItem) {
    setCartItems((prev) => {
      const existing = prev.find((c) => c.variantId === item.variantId);
      if (existing) {
        return prev.map((c) =>
          c.variantId === item.variantId
            ? { ...c, quantity: c.quantity + 1 }
            : c,
        );
      }
      return [...prev, item];
    });
    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 600);
  }

  function updateQty(variantId: string, qty: number) {
    if (qty <= 0) {
      removeFromCart(variantId);
    } else {
      setCartItems((prev) =>
        prev.map((c) =>
          c.variantId === variantId ? { ...c, quantity: qty } : c,
        ),
      );
    }
  }

  function removeFromCart(variantId: string) {
    setCartItems((prev) => prev.filter((c) => c.variantId !== variantId));
  }

  function clearCart() {
    setCartItems([]);
  }

  const load = useCallback(async () => {
    setStatus("loading");
    setErrorMsg("");
    try {
      const data = await fetchProducts(currency);
      setProducts(data);
      setStatus("success");
      setActiveProduct((prev) => {
        if (!prev) return null;
        return data.find((p) => p.id === prev.id) ?? prev;
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  }, [currency]);

  useEffect(() => {
    // Fetches products from the network on mount and whenever currency changes so it can't be derived during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  useEffect(() => {
    if (activeProduct) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCartOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeProduct]);

  return (
    <div className="min-h-dvh bg-obsidian-900 block-pattern">
      <div className="px-3 sm:px-4 pt-4 sm:pt-6 pb-4">
        <div className="flex items-center justify-between flex-wrap mb-4 gap-2">
          <div className="flex items-center flex-wrap gap-2">
            <m.a
              href={VAGUDLE_URL}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-obsidian-800 pixel-border-sm text-crown-gold hover:bg-obsidian-700 transition-colors"
              whileHover={{ x: -4 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-pixel text-sm">BACK TO VAGUDLE</span>
            </m.a>

            <m.a
              href={HOMEPAGE_URL}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-obsidian-800 pixel-border-sm text-crown-gold hover:bg-obsidian-700 transition-colors"
              whileHover={{ x: -4 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-pixel text-sm">BACK TO HOMEPAGE</span>
            </m.a>
          </div>

          <m.button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-obsidian-800 pixel-border-sm text-crown-gold hover:bg-obsidian-700 transition-colors"
            animate={cartBounce ? { scale: [1, 1.2, 0.95, 1.05, 1] } : {}}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-pixel text-sm">CART</span>
            {totalCartQty > 0 && (
              <m.span
                key={totalCartQty}
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                className="min-w-5.5 h-[h-5.5ex items-center justify-center bg-crown-gold text-obsidian-900 font-pixel text-xs px-1"
              >
                {totalCartQty}
              </m.span>
            )}
          </m.button>
        </div>

        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <h1 className="font-pixel text-3xl sm:text-4xl md:text-5xl text-crown-gold crown-glow mb-2">
            YELLOW SKIPPER MERCH STORE
          </h1>
          <p className="font-code text-sm sm:text-base text-gray-400">
            Support us with official Yellow Skipper Games merch
          </p>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-4"
        >
          {status === "success" && (
            <span className="font-code text-sm text-gray-500 w-full text-center sm:w-auto">
              {products.length} items
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              void load();
            }}
            disabled={status === "loading"}
            className="flex items-center gap-2.5 px-5 py-3 bg-obsidian-800 pixel-border-sm text-gray-400 hover:text-crown-gold transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`w-6 h-6 ${status === "loading" ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`}
            />
            <span className="font-pixel text-base">Refresh</span>
          </button>

          <div className="relative flex items-center">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="pl-5 pr-10 py-3 bg-obsidian-800 pixel-border-sm text-crown-gold font-pixel text-base cursor-pointer hover:bg-obsidian-700 transition-colors appearance-none"
              style={{ backgroundImage: "none" }}
              title="Select currency"
            >
              {CURRENCIES.map((c) => (
                <option
                  key={c}
                  value={c}
                  className="bg-obsidian-900 text-crown-gold font-pixel"
                >
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 w-5 h-5 text-crown-gold pointer-events-none" />
          </div>

          <a
            href={SHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-5 py-3 bg-obsidian-800 pixel-border-sm text-crown-gold hover:bg-obsidian-700 transition-colors"
          >
            <ExternalLink className="w-6 h-6" />
            <span className="font-pixel text-base">OPEN OLD STORE</span>
          </a>
        </m.div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          {status === "loading" && (
            <m.div
              key="skeletons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-wrap justify-center gap-3 sm:gap-4"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[calc(50%-6px)] sm:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)]"
                >
                  <SkeletonCard />
                </div>
              ))}
            </m.div>
          )}

          {status === "error" && (
            <m.div
              key="error"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 gap-4 text-center"
            >
              <AlertTriangle className="w-10 h-10 text-tajin-red" />
              <div>
                <p className="font-pixel text-sm text-crown-gold mb-1">
                  FAILED TO LOAD STORE
                </p>
                <p className="font-code text-xs text-gray-500 max-w-sm">
                  {errorMsg}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  void load();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-crown-gold/10 border border-crown-gold/50 hover:border-crown-gold text-crown-gold font-pixel text-xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                TRY AGAIN
              </button>
            </m.div>
          )}

          {status === "success" && products.length > 0 && (
            <m.div
              key="products"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-wrap justify-center gap-3 sm:gap-4"
            >
              {products.map((product, i) => (
                <div
                  key={product.id}
                  className="w-[calc(50%-6px)] sm:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)]"
                >
                  <ProductCard
                    product={product}
                    index={i}
                    onClick={() => setActiveProduct(product)}
                    inCart={cartItems.some((c) => c.productId === product.id)}
                  />
                </div>
              ))}
            </m.div>
          )}

          {status === "success" && products.length === 0 && (
            <m.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 gap-3 text-center"
            >
              <ShoppingBag className="w-10 h-10 text-obsidian-600" />
              <p className="font-pixel text-sm text-gray-500">NO ITEMS FOUND</p>
            </m.div>
          )}
        </AnimatePresence>

        {status === "success" && products.length > 0 && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 sm:mt-10 text-center"
          >
            <div className="inline-block p-3 sm:p-4 bg-obsidian-800/50 pixel-border-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 bg-tajin-red" />
                <div className="w-2 h-2 bg-crown-gold" />
                <div className="w-2 h-2 bg-tajin-lime" />
              </div>
              <p className="font-pixel text-[10px] sm:text-xs text-gray-500 mb-1">
                Powered by Fourthwall • Merch delivered worldwide
              </p>
              <p className="font-code text-[9px] sm:text-[10px] text-gray-600">
                Secure checkout • Click any item to view details
              </p>
              <div className="flex items-center justify-center gap-3 mt-2">
                <a
                  href="/privacy.html"
                  className="font-code text-[9px] sm:text-[10px] text-gray-600 hover:text-crown-gold transition-colors underline"
                >
                  Privacy Policy
                </a>
                <a
                  href="/terms.html"
                  className="font-code text-[9px] sm:text-[10px] text-gray-600 hover:text-crown-gold transition-colors underline"
                >
                  Terms of Service
                </a>
              </div>
            </div>
          </m.div>
        )}
      </div>

      <AnimatePresence>
        {activeProduct && (
          <ProductModal
            key="modal"
            product={activeProduct}
            onClose={() => setActiveProduct(null)}
            currency={currency}
            setCurrency={setCurrency}
            cartItems={cartItems}
            onAddToCart={(item) => {
              addToCart(item);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cartOpen && (
          <CartDrawer
            key="cart"
            items={cartItems}
            currency={currency}
            onClose={() => setCartOpen(false)}
            onUpdateQty={updateQty}
            onRemove={removeFromCart}
            onClear={clearCart}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
