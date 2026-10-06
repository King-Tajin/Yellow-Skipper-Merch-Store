import { m, AnimatePresence } from "@/lib/motion";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  WheelEvent as ReactWheelEvent,
} from "react";
import type { FWImage } from "@/lib/types";

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const ZOOM_STEP = 1.5;

interface ViewState {
  index: number;
  scale: number;
  x: number;
  y: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function initialView(index: number): ViewState {
  return { index, scale: MIN_SCALE, x: 0, y: 0 };
}

export function ImageLightbox({
  images,
  activeImage,
  imageKey,
  alt,
  onChange,
  onClose,
}: {
  images: FWImage[];
  activeImage: number;
  imageKey: string;
  alt: string;
  onChange: (index: number) => void;
  onClose: () => void;
}) {
  const [state, setState] = useState<ViewState>(() => initialView(activeImage));
  const view = state.index === activeImage ? state : initialView(activeImage);

  const stageRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const lastDistance = useRef(0);
  const dragged = useRef(false);

  const toCenter = useCallback((clientX: number, clientY: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: clientX - rect.left - rect.width / 2,
      y: clientY - rect.top - rect.height / 2,
    };
  }, []);

  const zoomAt = useCallback(
    (factor: number, cx: number, cy: number) => {
      const rect = stageRef.current?.getBoundingClientRect();
      const width = rect?.width ?? 0;
      const height = rect?.height ?? 0;
      setState((prev) => {
        const base =
          prev.index === activeImage ? prev : initialView(activeImage);
        const scale = clamp(base.scale * factor, MIN_SCALE, MAX_SCALE);
        if (scale === MIN_SCALE) return initialView(activeImage);
        const ratio = scale / base.scale;
        const limitX = (width * (scale - 1)) / 2;
        const limitY = (height * (scale - 1)) / 2;
        return {
          index: activeImage,
          scale,
          x: clamp(cx - (cx - base.x) * ratio, -limitX, limitX),
          y: clamp(cy - (cy - base.y) * ratio, -limitY, limitY),
        };
      });
    },
    [activeImage]
  );

  const panBy = useCallback(
    (dx: number, dy: number) => {
      const rect = stageRef.current?.getBoundingClientRect();
      const width = rect?.width ?? 0;
      const height = rect?.height ?? 0;
      setState((prev) => {
        const base =
          prev.index === activeImage ? prev : initialView(activeImage);
        if (base.scale <= MIN_SCALE) return base;
        const limitX = (width * (base.scale - 1)) / 2;
        const limitY = (height * (base.scale - 1)) / 2;
        return {
          ...base,
          x: clamp(base.x + dx, -limitX, limitX),
          y: clamp(base.y + dy, -limitY, limitY),
        };
      });
    },
    [activeImage]
  );

  const resetView = useCallback(() => {
    setState(initialView(activeImage));
  }, [activeImage]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "+" || e.key === "=") zoomAt(ZOOM_STEP, 0, 0);
      if (e.key === "-" || e.key === "_") zoomAt(1 / ZOOM_STEP, 0, 0);
      if (e.key === "0") resetView();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomAt, resetView]);

  function handleWheel(e: ReactWheelEvent<HTMLDivElement>) {
    const c = toCenter(e.clientX, e.clientY);
    zoomAt(Math.exp(-e.deltaY * 0.002), c.x, c.y);
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    dragged.current = false;
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      lastDistance.current = Math.hypot(a.x - b.x, a.y - b.y);
    }
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const next = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, next);

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (lastDistance.current > 0) {
        const mid = toCenter((a.x + b.x) / 2, (a.y + b.y) / 2);
        zoomAt(distance / lastDistance.current, mid.x, mid.y);
      }
      lastDistance.current = distance;
      dragged.current = true;
      return;
    }

    if (pointers.current.size === 1 && view.scale > MIN_SCALE) {
      panBy(next.x - prev.x, next.y - prev.y);
      dragged.current = true;
    }
  }

  function handlePointerEnd(e: ReactPointerEvent<HTMLDivElement>) {
    pointers.current.delete(e.pointerId);
    lastDistance.current = 0;
  }

  function handleClick(e: ReactMouseEvent<HTMLDivElement>) {
    if (dragged.current) {
      dragged.current = false;
      return;
    }
    if (!(e.target instanceof HTMLImageElement)) onClose();
  }

  const image = images[activeImage];
  if (!image) return null;

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-60"
      style={{ background: "rgba(0,0,0,0.96)" }}
    >
      <div
        ref={stageRef}
        className="absolute inset-0 overflow-hidden select-none"
        style={{
          touchAction: "none",
          cursor: view.scale > MIN_SCALE ? "grab" : "default",
        }}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onPointerLeave={handlePointerEnd}
        onClick={handleClick}
      >
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
          }}
        >
          <AnimatePresence mode="wait">
            <m.img
              key={imageKey}
              src={image.url}
              alt={alt}
              draggable={false}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-w-full max-h-full object-contain p-4 sm:p-12"
            />
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute right-4 top-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => zoomAt(1 / ZOOM_STEP, 0, 0)}
          disabled={view.scale <= MIN_SCALE}
          aria-label="Zoom out"
          className="p-3 bg-obsidian-800 hover:bg-obsidian-600 text-crown-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors pixel-border-sm"
        >
          <ZoomOut className="w-6 h-6" />
        </button>
        <button
          type="button"
          onClick={resetView}
          aria-label="Reset zoom"
          className="px-3 py-3.5 min-w-18 bg-obsidian-800 hover:bg-obsidian-600 text-gray-300 font-code text-sm transition-colors pixel-border-sm"
        >
          {Math.round(view.scale * 100)}%
        </button>
        <button
          type="button"
          onClick={() => zoomAt(ZOOM_STEP, 0, 0)}
          disabled={view.scale >= MAX_SCALE}
          aria-label="Zoom in"
          className="p-3 bg-obsidian-800 hover:bg-obsidian-600 text-crown-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors pixel-border-sm"
        >
          <ZoomIn className="w-6 h-6" />
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close full screen"
          className="p-3 bg-obsidian-800 hover:bg-obsidian-600 text-gray-400 hover:text-white transition-colors pixel-border-sm"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => onChange(Math.max(0, activeImage - 1))}
            disabled={activeImage === 0}
            aria-label="Previous image"
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-obsidian-900/80 pixel-border-sm text-crown-gold hover:bg-obsidian-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={() =>
              onChange(Math.min(images.length - 1, activeImage + 1))
            }
            disabled={activeImage === images.length - 1}
            aria-label="Next image"
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-obsidian-900/80 pixel-border-sm text-crown-gold hover:bg-obsidian-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-code text-sm text-gray-300 bg-obsidian-900/80 px-3 py-1">
            {activeImage + 1} / {images.length}
          </div>
        </>
      )}
    </m.div>
  );
}
