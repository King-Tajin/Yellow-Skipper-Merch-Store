export function SkeletonCard() {
  return (
    <div className="bg-obsidian-800 pixel-border-sm overflow-hidden">
      <div className="aspect-square bg-obsidian-700 animate-pulse" />
      <div className="p-3 sm:p-4 space-y-2">
        <div className="h-3 bg-obsidian-700 animate-pulse rounded w-3/4" />
        <div className="h-3 bg-obsidian-700 animate-pulse rounded w-1/2" />
        <div className="h-8 bg-obsidian-700 animate-pulse rounded mt-3" />
      </div>
    </div>
  );
}
