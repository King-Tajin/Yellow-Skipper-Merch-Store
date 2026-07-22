import { m, AnimatePresence } from "@/lib/motion";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Crown,
  ExternalLink,
  Ruler,
  ShoppingBag,
  ShoppingCart,
  Tag,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";
import { SHOP_URL } from "@/lib/api";
import { SizeGuideModal } from "./SizeGuideModal";
import {
  findVariant,
  formatPrice,
  getColorsAndSizes,
  getImagesForVariant,
  sanitizeProductHtml,
} from "@/lib/productUtils";
import { CURRENCIES } from "@/lib/types";
import type { CartItem, Currency, FWProduct } from "@/lib/types";

export function ProductModal({
  product,
  onClose,
  currency,
  setCurrency,
  cartItems,
  onAddToCart,
}: {
  product: FWProduct;
  onClose: () => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  cartItems: CartItem[];
  onAddToCart: (item: CartItem) => void;
}) {
  const { colors, sizes } = useMemo(
    () => getColorsAndSizes(product.variants),
    [product.variants]
  );

  const [selectedColor, setSelectedColor] = useState(colors[0] ?? "");
  const [selectedSize, setSelectedSize] = useState(sizes[0] ?? "");
  const [activeImage, setActiveImage] = useState(0);
  const [addedFlash, setAddedFlash] = useState(false);
  const [descExpanded, setDescExpanded] = useState<string | null>(null);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const visibleImages = useMemo(
    () => getImagesForVariant(product, selectedColor, selectedSize),
    [product, selectedColor, selectedSize]
  );

  const activeVariant = useMemo(
    () => findVariant(product.variants, selectedColor, selectedSize),
    [product.variants, selectedColor, selectedSize]
  );

  const isSingleVariant = colors.length === 0 && sizes.length === 0;
  const resolvedVariant = isSingleVariant ? product.variants[0] : activeVariant;

  const shopLink = `${SHOP_URL}/products/${product.slug}`;
  const overlayRef = useRef<HTMLDivElement>(null);

  const alreadyInCart = resolvedVariant
    ? cartItems.some((c) => c.variantId === resolvedVariant.id)
    : false;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setActiveImage((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight")
        setActiveImage((i) => Math.min(visibleImages.length - 1, i + 1));
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, visibleImages.length]);

  const isOutOfStock = !isSingleVariant && !activeVariant;

  function handleAddToCart() {
    if (!resolvedVariant) return;
    const image = visibleImages[0] ?? product.images[0];
    onAddToCart({
      variantId: resolvedVariant.id,
      productId: product.id,
      productName: product.name,
      variantColor: selectedColor || undefined,
      variantSize: selectedSize || undefined,
      price: resolvedVariant.unitPrice,
      imageUrl: image?.url,
      quantity: 1,
      slug: product.slug,
    });
    setAddedFlash(true);
    setTimeout(() => setAddedFlash(false), 1400);
  }

  return (
    <>
      <m.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.88)" }}
        onClick={(e) => {
          if (e.target === overlayRef.current) onClose();
        }}
      >
        <m.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 24 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-obsidian-900"
          style={{
            border: "4px solid",
            borderImageSlice: 1,
            borderImageSource:
              "linear-gradient(180deg, #5000aa 0%, #28007c 100%)",
          }}
        >
          <div
            className="sticky top-0 z-10 flex items-center justify-between px-6 sm:px-8 py-5 border-b-2 border-obsidian-700"
            style={{ background: "rgba(10,0,20,0.97)" }}
          >
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-crown-gold" />
              <span className="font-pixel text-base text-crown-amber tracking-widest">
                PRODUCT DETAILS
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex items-center">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  aria-label="Select currency"
                  className="pl-5 pr-10 py-3 bg-obsidian-800 pixel-border-sm text-crown-gold font-pixel text-base cursor-pointer hover:bg-obsidian-700 transition-colors appearance-none"
                  style={{ backgroundImage: "none" }}
                >
                  {CURRENCIES.map((c) => (
                    <option
                      key={c}
                      value={c}
                      className="bg-obsidian-900 text-crown-gold font-code"
                    >
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 w-5 h-5 text-crown-gold pointer-events-none" />
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-3 bg-obsidian-700 hover:bg-obsidian-600 text-gray-400 hover:text-white transition-colors pixel-border-sm"
                aria-label="Close"
              >
                <X className="w-7 h-7" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="p-4 sm:p-6 flex flex-col gap-3 border-b-2 md:border-b-0 md:border-r-2 border-obsidian-700">
              <div className="relative aspect-square pixel-border-sm bg-obsidian-800">
                <div className="absolute inset-0.75 overflow-hidden">
                  <AnimatePresence mode="wait">
                    {visibleImages[activeImage] ? (
                      <m.img
                        key={`${selectedColor}-${selectedSize}-${activeImage}`}
                        src={visibleImages[activeImage].url}
                        alt={`${product.name} ${activeImage + 1}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-16 h-16 text-obsidian-600" />
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {visibleImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveImage((i) => Math.max(0, i - 1))}
                      disabled={activeImage === 0}
                      aria-label="Previous image"
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-obsidian-900/80 pixel-border-sm text-crown-gold hover:bg-obsidian-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors z-10"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImage((i) =>
                          Math.min(visibleImages.length - 1, i + 1)
                        )
                      }
                      disabled={activeImage === visibleImages.length - 1}
                      aria-label="Next image"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-obsidian-900/80 pixel-border-sm text-crown-gold hover:bg-obsidian-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors z-10"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 font-code text-[10px] text-gray-400 bg-obsidian-900/80 px-2 py-0.5 z-10">
                      {activeImage + 1} / {visibleImages.length}
                    </div>
                  </>
                )}
              </div>

              {visibleImages.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {visibleImages.map((img, i) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      aria-label={`View image ${i + 1}`}
                      className={`relative w-18.25 hh-18.25flex-shrink-0 transition-all pixel-border-sm ${
                        i === activeImage
                          ? "ring-2 ring-crown-gold ring-offset-1 ring-offset-obsidian-900"
                          : "opacity-50 hover:opacity-80"
                      }`}
                    >
                      <div className="absolute inset-0.75 overflow-hidden">
                        <img
                          src={img.url}
                          alt={`Thumb ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6 flex flex-col gap-5">
              <div>
                <h2 className="font-pixel text-3xl sm:text-4xl text-crown-gold leading-snug mb-3">
                  {product.name}
                </h2>
                <AnimatePresence mode="wait">
                  <m.div
                    key={activeVariant?.id ?? "none"}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-2"
                  >
                    {resolvedVariant?.unitPrice ? (
                      <>
                        <Tag className="w-7 h-7 text-tajin-lime" />
                        <span className="font-pixel text-4xl text-tajin-lime">
                          {formatPrice(resolvedVariant.unitPrice)}
                        </span>
                      </>
                    ) : (
                      <span className="font-pixel text-xl text-gray-500">
                        SELECT OPTIONS
                      </span>
                    )}
                  </m.div>
                </AnimatePresence>
              </div>

              {product.description &&
                (() => {
                  const isOpen = descExpanded === "DESCRIPTION";
                  return (
                    <div className="bg-obsidian-800 pixel-border-sm overflow-hidden">
                      <button
                        type="button"
                        onClick={() =>
                          setDescExpanded(isOpen ? null : "DESCRIPTION")
                        }
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-obsidian-700 transition-colors"
                      >
                        <p className="font-pixel text-xs text-gray-500 tracking-widest">
                          DESCRIPTION
                        </p>
                        <m.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </m.div>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <m.div
                            key="body"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22 }}
                            style={{ overflow: "hidden" }}
                          >
                            <div
                              className="font-code text-sm text-gray-300 leading-relaxed px-4 pb-4 prose-sm"
                              style={{ lineHeight: "1.7" }}
                              dangerouslySetInnerHTML={{
                                __html: sanitizeProductHtml(
                                  product.description
                                ),
                              }}
                            />
                          </m.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })()}

              {(product.additionalInformation ?? []).reduce<ReactElement[]>(
                (acc, section) => {
                  if (
                    section.type !== "MORE_DETAILS" &&
                    section.type !== "GUARANTEE_AND_RETURNS"
                  ) {
                    return acc;
                  }
                  const key = section.type;
                  const isOpen = descExpanded === key;
                  acc.push(
                    <div
                      key={key}
                      className="bg-obsidian-800 pixel-border-sm overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setDescExpanded(isOpen ? null : key)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-obsidian-700 transition-colors"
                      >
                        <p className="font-pixel text-xs text-gray-500 tracking-widest">
                          {section.title.toUpperCase()}
                        </p>
                        <m.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </m.div>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <m.div
                            key="body"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22 }}
                            style={{ overflow: "hidden" }}
                          >
                            <div
                              className="font-code text-sm text-gray-300 leading-relaxed px-4 pb-4 prose-sm"
                              style={{ lineHeight: "1.7" }}
                              dangerouslySetInnerHTML={{
                                __html: sanitizeProductHtml(section.bodyHtml),
                              }}
                            />
                          </m.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                  return acc;
                },
                []
              )}

              {!isSingleVariant && (
                <div className="flex flex-col gap-4">
                  {colors.length > 0 && (
                    <div>
                      <p className="font-pixel text-4xl text-gray-500 mb-3 tracking-widest">
                        COLOR —{" "}
                        <span className="text-crown-amber">
                          {selectedColor}
                        </span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {colors.map((color) => {
                          const available =
                            sizes.length === 0
                              ? !!findVariant(product.variants, color, "")
                              : sizes.some(
                                  (s) =>
                                    !!findVariant(product.variants, color, s)
                                );
                          const swatch = product.variants.find(
                            (v) => v.attributes?.color?.name === color
                          )?.attributes?.color?.swatch;
                          return (
                            <button
                              key={color}
                              type="button"
                              onClick={() => {
                                setSelectedColor(color);
                                setActiveImage(0);
                              }}
                              disabled={!available}
                              className={`flex items-center gap-2 px-4 py-2.5 font-code text-base transition-all pixel-border-sm disabled:opacity-30 disabled:cursor-not-allowed ${
                                selectedColor === color
                                  ? "bg-crown-gold/20 text-crown-gold"
                                  : "bg-obsidian-800 text-gray-400 hover:text-gray-200"
                              }`}
                              style={{
                                border: `2px solid ${selectedColor === color ? "#d4af37" : "#3a3a4a"}`,
                              }}
                            >
                              {swatch && (
                                <span
                                  className="w-4 h-4 shrink-0 inline-block border border-obsidian-600"
                                  style={{ background: swatch }}
                                />
                              )}
                              {color}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {sizes.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-pixel text-4xl text-gray-500 tracking-widest">
                          SIZE —{" "}
                          <span className="text-crown-amber">
                            {selectedSize}
                          </span>
                        </p>
                        <button
                          type="button"
                          onClick={() => setSizeGuideOpen(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-obsidian-800 pixel-border-sm text-gray-400 hover:text-crown-gold transition-colors font-pixel text-xs"
                        >
                          <Ruler className="w-3.5 h-3.5" />
                          SIZE GUIDE
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {sizes.map((size) => {
                          const available = !!findVariant(
                            product.variants,
                            selectedColor,
                            size
                          );
                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() => {
                                setSelectedSize(size);
                                setActiveImage(0);
                              }}
                              disabled={!available}
                              className={`px-4 py-2.5 font-code text-base transition-all pixel-border-sm disabled:opacity-30 disabled:cursor-not-allowed ${
                                selectedSize === size
                                  ? "bg-crown-gold/20 text-crown-gold"
                                  : "bg-obsidian-800 text-gray-400 hover:text-gray-200"
                              }`}
                              style={{
                                border: `2px solid ${selectedSize === size ? "#d4af37" : "#3a3a4a"}`,
                              }}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-auto flex flex-col gap-3 pt-2">
                <m.button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || !resolvedVariant}
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-3 py-4 font-pixel text-xl tracking-wider transition-all relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: addedFlash
                      ? "linear-gradient(180deg, #3a7d44 0%, #2d6135 100%)"
                      : "linear-gradient(180deg, #d4af37 0%, #a07820 100%)",
                    border: `2px solid ${addedFlash ? "#3a7d44" : "#d4af37"}`,
                    color: addedFlash ? "#fff" : "#100010",
                    transition:
                      "background 0.3s, border-color 0.3s, color 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    if (!addedFlash)
                      e.currentTarget.style.filter = "brightness(1.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter = "brightness(1)";
                  }}
                >
                  <AnimatePresence mode="wait">
                    {addedFlash ? (
                      <m.span
                        key="added"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center gap-2"
                      >
                        ✓ ADDED TO CART
                      </m.span>
                    ) : (
                      <m.span
                        key="add"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center gap-3"
                      >
                        <ShoppingCart className="w-6 h-6" />
                        {alreadyInCart ? "ADD ANOTHER" : "ADD TO CART"}
                      </m.span>
                    )}
                  </AnimatePresence>
                </m.button>

                <a
                  href={shopLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 py-3 font-pixel text-base tracking-wider transition-colors"
                  style={{
                    background: "transparent",
                    border: "2px solid #5000aa",
                    color: "#9060cc",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(80,0,170,0.15)";
                    e.currentTarget.style.color = "#c090ff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#9060cc";
                  }}
                >
                  <ExternalLink className="w-4 h-4 opacity-70" />
                  VIEW ON STORE
                </a>

                <div className="flex items-center justify-center gap-2 py-2.5 bg-obsidian-800/50 pixel-border-sm">
                  <div className="w-2 h-2 bg-tajin-lime rounded-full" />
                  <span className="font-code text-sm text-gray-500">
                    Secure checkout via Fourthwall
                  </span>
                </div>
              </div>
            </div>
          </div>
        </m.div>
      </m.div>

      <SizeGuideModal
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        product={product}
      />
    </>
  );
}
