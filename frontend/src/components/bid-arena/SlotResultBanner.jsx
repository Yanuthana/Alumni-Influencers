function SlotResultBanner({ slot, userBid, history }) {
  if (!slot || !userBid) return null;

  // Find matching result in history for this slot
  const result = history?.find(
    (h) => String(h.slot_id) === String(slot.slot_id) && (h.result_status || h.status)
  );

  if (!result) return null;

  const status = (result.result_status || result.status)?.toLowerCase();
  const isWon = status === 'won';
  const isLost = status === 'lost' || status === 'outbid';

  if (!isWon && !isLost) return null;

  if (isWon) {
    return (
      <div className="relative overflow-hidden rounded-[28px] border border-tertiary/40 bg-gradient-to-br from-tertiary/10 via-surface-container to-surface-container-high p-6 shadow-[0_0_60px_rgba(142,216,137,0.15)]">
        
        <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-tertiary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-tertiary/10 blur-2xl" />

        <div className="relative flex items-start gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-tertiary/20 border border-tertiary/40">
            <span className="material-symbols-outlined text-3xl text-tertiary">emoji_events</span>
          </div>
          <div>
            <p className="mb-1 text-[11px] font-label uppercase tracking-[0.28em] text-tertiary/80">Result</p>
            <h4 className="font-headline text-2xl text-on-surface">The Gavel Has Fallen 🎉</h4>
            <p className="mt-1 text-sm text-secondary">
              You secured the <span className="font-medium text-on-surface">{result.slot_name || `Slot #${slot.slot_id}`}</span>{' '}
              with a winning bid of{' '}
              <span className="font-headline text-lg text-tertiary">${Number(result.bid_amount).toLocaleString()}</span>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Lost / Outbid state — subdued
  return (
    <div className="rounded-[28px] border border-outline-variant/25 bg-surface-container-low p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface-variant">
          <span className="material-symbols-outlined text-xl text-secondary">gavel</span>
        </div>
        <div>
          <p className="mb-0.5 text-[10px] font-label uppercase tracking-[0.22em] text-secondary">Result</p>
          <h4 className="font-headline text-xl text-on-surface">Not This Time</h4>
          <p className="mt-1 text-sm text-secondary">
            Your bid of <span className="text-on-surface">${Number(result.bid_amount).toLocaleString()}</span>{' '}
            on{' '}
            <span className="text-on-surface">{result.slot_name || `Slot #${slot.slot_id}`}</span>{' '}
            didn't secure the slot.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SlotResultBanner;
