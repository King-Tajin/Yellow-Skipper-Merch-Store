import { m, AnimatePresence } from "@/lib/motion";
import { Heart, X } from "lucide-react";
import { useState } from "react";

const STORAGE_KEY = "ysg-merch-donation-notice:v1";

function readDismissed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function DonationNotice() {
  const [dismissed, setDismissed] = useState(readDismissed);

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
  }

  return (
    <AnimatePresence>
      {!dismissed && (
        <m.div
          key="donation-notice"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          role="note"
          className="relative max-w-2xl mx-auto mt-4 pl-4 pr-12 py-3 bg-obsidian-800 pixel-border-sm text-left"
        >
          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 mt-0.5 shrink-0 text-tajin-red" />
            <p className="font-code text-xs sm:text-sm text-gray-300">
              <span className="text-crown-gold">30% of donations</span> (not
              purchases) go to the American Society for the Prevention of
              Cruelty to Animals (ASPCA). The rest goes to the creators of
              Yellow Skipper Games.
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss donation notice"
            className="absolute top-2 right-2 p-1.5 text-gray-500 hover:text-crown-gold transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </m.div>
      )}
    </AnimatePresence>
  );
}
