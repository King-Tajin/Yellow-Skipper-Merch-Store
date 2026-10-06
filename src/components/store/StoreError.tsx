import { m } from "@/lib/motion";
import { AlertTriangle, RefreshCw } from "lucide-react";

export function StoreError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
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
        <p className="font-code text-xs text-gray-500 max-w-sm">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 bg-crown-gold/10 border border-crown-gold/50 hover:border-crown-gold text-crown-gold font-pixel text-xs transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        TRY AGAIN
      </button>
    </m.div>
  );
}
