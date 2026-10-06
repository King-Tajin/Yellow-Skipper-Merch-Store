import { m, AnimatePresence } from "@/lib/motion";
import { ChevronDown } from "lucide-react";
import { sanitizeProductHtml } from "@/lib/productUtils";

export function CollapsibleSection({
  title,
  html,
  isOpen,
  onToggle,
}: {
  title: string;
  html: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-obsidian-800 pixel-border-sm overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-obsidian-700 transition-colors"
      >
        <p className="font-pixel text-xs text-gray-500 tracking-widest">
          {title}
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
              dangerouslySetInnerHTML={{ __html: sanitizeProductHtml(html) }}
            />
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
