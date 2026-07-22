import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ChevronDown,
  ExternalLink,
  Ruler,
  X,
} from "lucide-react";
import { useState } from "react";
import { sanitizeProductHtml } from "@/libs/productUtils";
import type { FWProduct } from "@/libs/types";

export function SizeGuideModal({
  open,
  onClose,
  product,
}: {
  open: boolean;
  onClose: () => void;
  product: FWProduct;
}) {
  const [generalRefOpen, setGeneralRefOpen] = useState(false);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-60 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.88)" }}
          onClick={() => onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg bg-obsidian-900 overflow-y-auto max-h-[90vh]"
            style={{
              border: "4px solid",
              borderImageSlice: 1,
              borderImageSource:
                "linear-gradient(180deg, #5000aa 0%, #28007c 100%)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-6 py-4 border-b-2 border-obsidian-700 sticky top-0"
              style={{ background: "rgba(10,0,20,0.97)" }}
            >
              <div className="flex items-center gap-3">
                <Ruler className="w-6 h-6 text-crown-gold" />
                <span className="font-pixel text-sm text-crown-amber tracking-widest">
                  SIZE GUIDE
                </span>
              </div>
              <button
                type="button"
                onClick={() => onClose()}
                aria-label="Close size guide"
                className="p-2 bg-obsidian-700 hover:bg-obsidian-600 text-gray-400 hover:text-white transition-colors pixel-border-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              {(() => {
                const sizeInfo = (product.additionalInformation ?? []).find(
                  (s) => s.type === "SIZE_AND_FIT",
                );
                if (!sizeInfo) return null;
                const linkMatch = sizeInfo.bodyHtml.match(/href="([^"]+)"/);
                const linkUrl = linkMatch?.[1];
                return (
                  <div className="flex flex-col gap-3">
                    <p className="font-pixel text-xs text-gray-500 tracking-widest">
                      PRODUCT SIZE CHART
                    </p>
                    {linkUrl ? (
                      <>
                        <a
                          href={linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 px-4 py-3 font-pixel text-xs tracking-wider transition-[filter]"
                          style={{
                            background:
                              "linear-gradient(180deg, #5000aa 0%, #28007c 100%)",
                            border: "2px solid #5000aa",
                            color: "#fff",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.filter = "brightness(1.2)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.filter = "brightness(1)")
                          }
                        >
                          <Ruler className="w-4 h-4" />
                          VIEW OFFICIAL SIZE CHART (PDF)
                          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                        </a>
                        <div className="flex items-start gap-2 px-3 py-2.5 bg-crown-gold/10 pixel-border-sm">
                          <AlertTriangle className="w-3.5 h-3.5 text-crown-gold shrink-0 mt-0.5" />
                          <p className="font-code text-xs text-crown-amber leading-relaxed">
                            This product has an official size chart, please use
                            it for the most accurate fit. The general reference
                            below is backup only.
                          </p>
                        </div>
                      </>
                    ) : (
                      <div
                        className="font-code text-sm text-gray-300 leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeProductHtml(sizeInfo.bodyHtml),
                        }}
                      />
                    )}
                  </div>
                );
              })()}

              <div className="border-t border-obsidian-700 pt-4">
                <button
                  type="button"
                  onClick={() => setGeneralRefOpen((o) => !o)}
                  className="w-full flex items-center justify-between hover:bg-obsidian-800 transition-colors px-1 py-1 rounded"
                >
                  <p className="font-pixel text-xs text-gray-500 tracking-widest">
                    GENERAL REFERENCE — UNISEX
                  </p>
                  <motion.div
                    animate={{ rotate: generalRefOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {generalRefOpen && (
                    <motion.div
                      key="general-ref"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="pt-3 flex flex-col gap-3">
                        <div className="overflow-x-auto">
                          <table className="w-full font-code text-sm border-collapse">
                            <thead>
                              <tr style={{ background: "rgba(80,0,170,0.25)" }}>
                                {["SIZE", "CHEST", "WAIST", "LENGTH"].map(
                                  (h) => (
                                    <th
                                      key={h}
                                      className="px-3 py-2 text-left text-crown-gold font-semibold border border-obsidian-600 text-xs"
                                    >
                                      {h}
                                    </th>
                                  ),
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {[
                                ["XS", "31–33", "25–27", '26"'],
                                ["S", "34–36", "28–30", '27"'],
                                ["M", "37–39", "31–33", '28"'],
                                ["L", "40–42", "34–36", '29"'],
                                ["XL", "43–45", "37–39", '30"'],
                                ["2XL", "46–48", "40–42", '31"'],
                                ["3XL", "49–51", "43–45", '32"'],
                              ].map(([size, ...vals], i) => (
                                <tr
                                  key={size}
                                  style={{
                                    background:
                                      i % 2 === 0
                                        ? "rgba(255,255,255,0.02)"
                                        : "transparent",
                                  }}
                                >
                                  <td className="px-3 py-2 text-crown-amber font-bold border border-obsidian-600 font-pixel text-xs">
                                    {size}
                                  </td>
                                  {vals.map((v, j) => (
                                    <td
                                      key={j}
                                      className="px-3 py-2 text-gray-300 border border-obsidian-600"
                                    >
                                      {v}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <p className="font-code text-xs text-gray-600">
                          All measurements in inches. When between sizes, size
                          up.
                        </p>

                        <div className="p-3 bg-obsidian-800/50 pixel-border-sm">
                          <p className="font-pixel text-[10px] text-gray-500 mb-2 tracking-widest">
                            HOW TO MEASURE
                          </p>
                          <div className="flex flex-col gap-1.5 font-code text-xs text-gray-400">
                            <p>
                              <span className="text-crown-amber">Chest —</span>{" "}
                              Around the fullest part, tape level.
                            </p>
                            <p>
                              <span className="text-crown-amber">Waist —</span>{" "}
                              Around the narrowest part of your torso.
                            </p>
                            <p>
                              <span className="text-crown-amber">Length —</span>{" "}
                              Shoulder point down to the hem.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
