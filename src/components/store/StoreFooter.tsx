import { m } from "@/lib/motion";

export function StoreFooter() {
  return (
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
  );
}
