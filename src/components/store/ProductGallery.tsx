import { m, AnimatePresence } from "@/lib/motion";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ShoppingBag,
} from "lucide-react";
import type { FWImage } from "@/lib/types";

export function ProductGallery({
  images,
  activeImage,
  imageKeyPrefix,
  productName,
  onSelect,
  onOpenFullScreen,
}: {
  images: FWImage[];
  activeImage: number;
  imageKeyPrefix: string;
  productName: string;
  onSelect: (index: number) => void;
  onOpenFullScreen: () => void;
}) {
  return (
    <div className="p-4 sm:p-6 flex flex-col gap-3 border-b-2 md:border-b-0 md:border-r-2 border-obsidian-700">
      <div className="relative aspect-square pixel-border-sm bg-obsidian-800">
        <div className="absolute inset-0.75 overflow-hidden">
          <AnimatePresence mode="wait">
            {images[activeImage] ? (
              <m.img
                key={`${imageKeyPrefix}-${activeImage}`}
                src={images[activeImage].url}
                alt={`${productName} ${activeImage + 1}`}
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

        {images[activeImage] && (
          <button
            type="button"
            onClick={onOpenFullScreen}
            aria-label="View image full screen"
            className="absolute right-2 top-2 p-1.5 bg-obsidian-900/80 pixel-border-sm text-crown-gold hover:bg-obsidian-700 transition-colors z-10"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => onSelect(Math.max(0, activeImage - 1))}
              disabled={activeImage === 0}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-obsidian-900/80 pixel-border-sm text-crown-gold hover:bg-obsidian-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors z-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                onSelect(Math.min(images.length - 1, activeImage + 1))
              }
              disabled={activeImage === images.length - 1}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-obsidian-900/80 pixel-border-sm text-crown-gold hover:bg-obsidian-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 font-code text-[10px] text-gray-400 bg-obsidian-900/80 px-2 py-0.5 z-10">
              {activeImage + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`View image ${i + 1}`}
              className={`relative w-18.25 h-18.25 shrink-0 transition-all pixel-border-sm ${
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
  );
}
