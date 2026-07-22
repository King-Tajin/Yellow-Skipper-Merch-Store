import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ExternalLink,
  Loader2,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createCheckout } from "@/libs/api";
import { cartTotal, formatPrice } from "@/libs/productUtils";
import type { CartItem, Currency } from "@/libs/types";

export function CartDrawer({
  items,
  currency,
  onClose,
  onUpdateQty,
  onRemove,
  onClear,
}: {
  items: CartItem[];
  currency: Currency;
  onClose: () => void;
  onUpdateQty: (variantId: string, qty: number) => void;
  onRemove: (variantId: string) => void;
  onClear: () => void;
}) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const total = cartTotal(items);
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function handleCheckout() {
    setCheckingOut(true);
    setCheckoutError("");
    try {
      const url = await createCheckout(items, currency);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setCheckingOut(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        ref={drawerRef}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        className="relative w-full max-w-sm flex flex-col h-full bg-obsidian-900"
        style={{
          borderLeft: "4px solid",
          borderImageSlice: 1,
          borderImageSource:
            "linear-gradient(180deg, #5000aa 0%, #28007c 100%)",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b-2 border-obsidian-700 shrink-0"
          style={{ background: "rgba(10,0,20,0.97)" }}
        >
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-crown-gold" />
            <span className="font-pixel text-sm text-crown-amber tracking-widest">
              YOUR CART
            </span>
            {totalItems > 0 && (
              <span className="font-code text-xs bg-crown-gold text-obsidian-900 px-2 py-0.5 font-bold">
                {totalItems}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="flex items-center gap-1.5 px-3 py-2 bg-obsidian-800 pixel-border-sm text-gray-500 hover:text-tajin-red transition-colors font-pixel text-xs"
                title="Clear cart"
              >
                <Trash2 className="w-3.5 h-3.5" />
                CLEAR
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-obsidian-700 hover:bg-obsidian-600 text-gray-400 hover:text-white transition-colors pixel-border-sm"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          <AnimatePresence initial={false}>
            {items.length === 0 ? (
              <div
                key="empty"
                className="flex flex-col items-center justify-center h-full gap-4 py-16 text-center"
              >
                <Package className="w-12 h-12 text-obsidian-600" />
                <div>
                  <p className="font-pixel text-xs text-gray-500 mb-1">
                    CART IS EMPTY
                  </p>
                  <p className="font-code text-xs text-gray-600">
                    Add some merch!
                  </p>
                </div>
              </div>
            ) : (
              items.map((item) => (
                <motion.div
                  key={item.variantId}
                  layout
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.22 }}
                  className="flex gap-3 p-3 bg-obsidian-800 pixel-border-sm"
                >
                  <div className="relative w-16 h-16 shrink-0 bg-obsidian-700 pixel-border-sm">
                    <div className="absolute inset-0.75 overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-obsidian-500" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <p className="font-pixel text-xs text-crown-amber leading-snug line-clamp-2">
                      {item.productName}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {item.variantColor && (
                        <span className="font-code text-[10px] text-gray-500 bg-obsidian-700 px-1.5 py-0.5">
                          {item.variantColor}
                        </span>
                      )}
                      {item.variantSize && (
                        <span className="font-code text-[10px] text-gray-500 bg-obsidian-700 px-1.5 py-0.5">
                          {item.variantSize}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-code text-sm text-tajin-lime font-semibold">
                        {formatPrice({
                          value: item.price.value * item.quantity,
                          currency: item.price.currency,
                        })}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQty(item.variantId, item.quantity - 1)
                          }
                          className="w-6 h-6 flex items-center justify-center bg-obsidian-700 hover:bg-obsidian-600 text-crown-gold pixel-border-sm transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-pixel text-xs text-white w-6 text-center tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQty(item.variantId, item.quantity + 1)
                          }
                          className="w-6 h-6 flex items-center justify-center bg-obsidian-700 hover:bg-obsidian-600 text-crown-gold pixel-border-sm transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemove(item.variantId)}
                          className="w-6 h-6 flex items-center justify-center bg-obsidian-700 hover:bg-tajin-red/20 text-gray-500 hover:text-tajin-red pixel-border-sm transition-colors ml-1"
                          aria-label="Remove item"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {items.length > 0 && (
          <div
            className="shrink-0 border-t-2 border-obsidian-700 p-4 flex flex-col gap-3"
            style={{ background: "rgba(10,0,20,0.97)" }}
          >
            <div className="flex items-center justify-between px-1">
              <span className="font-pixel text-xs text-gray-500 tracking-widest">
                SUBTOTAL
              </span>
              <span className="font-pixel text-xl text-tajin-lime">
                {formatPrice({
                  value: total,
                  currency: items[0].price.currency,
                })}
              </span>
            </div>

            {checkoutError && (
              <div className="flex items-center gap-2 px-3 py-2 bg-tajin-red/10 border border-tajin-red/40">
                <AlertTriangle className="w-3.5 h-3.5 text-tajin-red shrink-0" />
                <span className="font-code text-[10px] text-tajin-red">
                  {checkoutError}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleCheckout}
              disabled={checkingOut}
              className="w-full flex items-center justify-center gap-3 py-4 font-pixel text-base tracking-wider transition-[filter,opacity] disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(180deg, #5000aa 0%, #28007c 100%)",
                border: "2px solid #5000aa",
                color: "#fff",
              }}
              onMouseEnter={(e) => {
                if (!checkingOut)
                  e.currentTarget.style.filter = "brightness(1.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = "brightness(1)";
              }}
            >
              {checkingOut ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  PREPARING...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  CHECKOUT
                  <ExternalLink className="w-4 h-4 opacity-70" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 bg-tajin-lime rounded-full" />
              <span className="font-code text-[10px] text-gray-600">
                Secure checkout via Fourthwall
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
