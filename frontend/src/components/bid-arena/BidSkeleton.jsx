function BidSkeleton() {
  return (
    <div className="animate-pulse rounded-[28px] border border-outline-variant/30 bg-surface-container-low p-6 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
      {/* Badge row */}
      <div className="mb-5 flex items-center justify-between">
        <div className="h-5 w-24 rounded-full bg-surface-variant/60" />
        <div className="h-5 w-16 rounded-full bg-surface-variant/40" />
      </div>
      {/* Title */}
      <div className="mb-2 h-7 w-48 rounded-lg bg-surface-variant/60" />
      <div className="mb-6 h-4 w-36 rounded-lg bg-surface-variant/40" />
      {/* Bid amounts */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <div className="mb-1 h-3 w-16 rounded bg-surface-variant/40" />
          <div className="h-8 w-28 rounded-lg bg-surface-variant/60" />
        </div>
        <div>
          <div className="mb-1 h-3 w-20 rounded bg-surface-variant/40" />
          <div className="h-8 w-28 rounded-lg bg-surface-variant/60" />
        </div>
      </div>
      {/* Button */}
      <div className="h-11 w-full rounded-2xl bg-surface-variant/60" />
    </div>
  );
}

function HistoryRowSkeleton() {
  return (
    <div className="animate-pulse flex items-center gap-4 rounded-2xl border border-outline-variant/20 bg-surface-container-low px-5 py-4">
      <div className="h-10 w-10 rounded-full bg-surface-variant/60 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-40 rounded bg-surface-variant/60" />
        <div className="h-3 w-24 rounded bg-surface-variant/40" />
      </div>
      <div className="h-5 w-16 rounded-full bg-surface-variant/60" />
      <div className="h-5 w-20 rounded bg-surface-variant/40" />
    </div>
  );
}

BidSkeleton.HistoryRow = HistoryRowSkeleton;

export default BidSkeleton;
