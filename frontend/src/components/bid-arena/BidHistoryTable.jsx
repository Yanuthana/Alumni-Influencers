function BidHistoryTable({ history, loading }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse flex items-center gap-4 rounded-2xl border border-outline-variant/20 bg-surface-container-low px-5 py-4"
          >
            <div className="h-10 w-10 rounded-full bg-surface-variant/60 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 rounded bg-surface-variant/60" />
              <div className="h-3 w-24 rounded bg-surface-variant/40" />
            </div>
            <div className="h-5 w-16 rounded-full bg-surface-variant/60" />
            <div className="h-5 w-20 rounded bg-surface-variant/40" />
          </div>
        ))}
      </div>
    );
  }

  if (!history?.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-[28px] border border-outline-variant/30 bg-surface-container-low px-6 py-14">
        <span className="material-symbols-outlined text-4xl text-secondary/40">history</span>
        <p className="text-center text-sm text-secondary">No bidding history yet. Place your first bid to get started.</p>
      </div>
    );
  }

  const STATUS_CONFIG = {
    won:       { label: 'Won',       icon: 'emoji_events', cls: 'bg-tertiary/15 text-tertiary border-tertiary/30',    dot: 'bg-tertiary' },
    lost:      { label: 'Lost',      icon: 'close',        cls: 'bg-error/15 text-error border-error/30',             dot: 'bg-error' },
    outbid:    { label: 'Outbid',    icon: 'close',        cls: 'bg-error/15 text-error border-error/30',             dot: 'bg-error' },
    active:    { label: 'Active',    icon: 'bolt',         cls: 'bg-primary/15 text-primary border-primary/30',       dot: 'bg-primary' },
    cancelled: { label: 'Cancelled', icon: 'cancel',       cls: 'bg-secondary/15 text-secondary border-secondary/30', dot: 'bg-secondary/60' },
    pending:   { label: 'Pending',   icon: 'hourglass_top',cls: 'bg-secondary/15 text-secondary border-secondary/30', dot: 'bg-secondary/60' },
  };

  const getConfig = (status) => STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.pending;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-3">
      {history.map((record, idx) => {
        const cfg = getConfig(record.result_status);
        return (
          <div
            key={record.bid_id || idx}
            className="group flex items-center gap-4 rounded-2xl border border-outline-variant/20 bg-surface-container-low px-5 py-4 transition-all hover:border-outline-variant/40 hover:bg-surface-container"
          >
            
            <div className="flex shrink-0 flex-col items-center">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center border ${cfg.cls}`}>
                <span className="material-symbols-outlined text-base leading-none">{cfg.icon}</span>
              </div>
            </div>

          
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-headline text-base text-on-surface">
                  Bidding Slot
                </p>
                {record.slot_id && (
                  <span className="rounded-md bg-surface-variant/40 px-1.5 py-0.5 font-mono text-[10px] text-secondary">
                    #{record.slot_id}
                  </span>
                )}
              </div>
              <p className="text-xs text-secondary">Slot Date: {formatDate(record.slot_date)}</p>
            </div>

            <div className="text-right">
              <p className="font-headline text-lg text-on-surface">${Number(record.bid_amount).toLocaleString()}</p>
              <p className="text-xs text-secondary">Your Bid</p>
            </div>

            
            <span className={`hidden sm:inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-0.5 text-[10px] font-label uppercase tracking-[0.18em] ${cfg.cls}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default BidHistoryTable;
