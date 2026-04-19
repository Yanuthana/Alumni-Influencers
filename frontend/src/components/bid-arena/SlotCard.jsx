import React from 'react';
import { getMonthlyLimitStatus } from '../../services/bid-service';

/* ── Countdown hook ─────────────────────────────────────── */
function useCountdown(targetDateStr) {
  const getRemaining = () => {
    if (!targetDateStr) return null;
    const diff = new Date(targetDateStr).getTime() - Date.now();
    if (diff <= 0) return { h: 0, m: 0, s: 0, expired: true };
    const total = Math.floor(diff / 1000);
    return {
      h: Math.floor(total / 3600),
      m: Math.floor((total % 3600) / 60),
      s: total % 60,
      expired: false,
    };
  };

  const [remaining, setRemaining] = React.useState(getRemaining);

  React.useEffect(() => {
    if (!targetDateStr) return;
    const timer = setInterval(() => setRemaining(getRemaining()), 1000);
    return () => clearInterval(timer);
  }, [targetDateStr]);

  return remaining;
}

/* ── Status badge ──────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    active: { label: 'Open', cls: 'bg-tertiary/20 text-tertiary border-tertiary/30' },
    open: { label: 'Open', cls: 'bg-tertiary/20 text-tertiary border-tertiary/30' },
    closed: { label: 'Closed', cls: 'bg-error/15 text-error border-error/30' },
    upcoming: { label: 'Upcoming', cls: 'bg-secondary/15 text-secondary border-secondary/30' },
  };
  const { label, cls } = map[status?.toLowerCase()] || map.active;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-[11px] font-label uppercase tracking-[0.18em] ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

/* ── Inline countdown display ──────────────────────────── */
function Countdown({ targetDateStr, label }) {
  const t = useCountdown(targetDateStr);
  if (!t) return null;
  if (t.expired) return (
    <span className="font-label text-xs text-error uppercase tracking-widest">Ended</span>
  );
  const pad = (n) => String(n).padStart(2, '0');
  return (
    <span className="font-mono text-sm text-secondary tabular-nums">
      {label && (
        <span className="font-label text-[10px] mr-1.5 not-italic uppercase tracking-widest text-secondary/60">
          {label}
        </span>
      )}
      {pad(t.h)}:{pad(t.m)}:{pad(t.s)}
    </span>
  );
}

/* ── Locked panel shown inside locked cards ─────────────── */
function LockedPanel({ opensAt, lockReason }) {
  const t = useCountdown(opensAt);
  const pad = (n) => String(n).padStart(2, '0');
  return (
    <div className="mt-auto flex flex-col items-center gap-3 rounded-2xl border border-outline-variant/25 bg-black/30 px-6 py-5 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-outline-variant/20 border border-outline-variant/30">
        <span className="material-symbols-outlined text-2xl text-secondary/70">lock_clock</span>
      </div>
      <div>
        <p className="font-headline text-lg text-on-surface">{lockReason || 'Bidding Not Yet Open'}</p>
        {t && !t.expired ? (
          <p className="mt-1 font-mono text-2xl font-bold text-primary tabular-nums">
            {pad(t.h)}:{pad(t.m)}:{pad(t.s)}
          </p>
        ) : (
          <p className="mt-1 text-xs font-label uppercase tracking-widest text-secondary/50">Opening soon</p>
        )}
        <p className="mt-1 text-[11px] font-label uppercase tracking-widest text-secondary/40">
          Bidding will be available soon. Stay tuned.
        </p>
      </div>
    </div>
  );
}

/* ── SlotCard ──────────────────────────────────────────── */
function SlotCard({ slot, userId, userBid, onPlaceBid, onUpdateBid, onCancelBid, onViewBidStatus }) {
  const [limitStatus, setLimitStatus] = React.useState(null);

  // is_locked comes from the API when it's tomorrow's slot and time < 6 PM
  const isLocked = Boolean(slot?.is_locked);
  const hasUserBid = Boolean(userBid);
  const slotStatus = slot?.status?.toLowerCase() || 'upcoming';
  const isOpen = !isLocked && (slotStatus === 'open' || slotStatus === 'active');

  React.useEffect(() => {
    if (!userId) return;
    getMonthlyLimitStatus(userId)
      .then(res => setLimitStatus(res.data))
      .catch(err => console.error('Limit fetch failed:', err));
  }, [userId]);

  const canUserBidByLimit = limitStatus?.can_bid !== false;
  const biddingDisabled = !canUserBidByLimit && !hasUserBid;

  // Header countdown: for locked cards count DOWN to open time; for open cards count down to close
  const countdownTarget = isLocked
    ? slot?.opens_at
    : (slot?.bidding_end_time || slot?.closing_time || slot?.slot_date);

  /* ── Card wrapper classes ──────────────────────────────── */
  const cardCls = [
    'group relative flex flex-col rounded-[28px] border p-6 shadow-[0_18px_50px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-1',
    isLocked
      ? 'border-outline-variant/25 bg-gradient-to-br from-surface-container/60 to-surface-container-high/60 opacity-80'
      : hasUserBid
        ? 'border-primary/50 bg-gradient-to-br from-[rgba(255,176,201,0.09)] to-surface-container-high shadow-[0_0_40px_rgba(255,176,201,0.12)]'
        : 'border-outline-variant/40 bg-gradient-to-br from-surface-container to-surface-container-high',
  ].join(' ');

  return (
    <div className={cardCls}>
      {/* Ring overlays */}
      {isLocked && (
        <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-outline-variant/20" />
      )}
      {!isLocked && hasUserBid && (
        <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-primary/40 animate-pulse" />
      )}

      {/* ── Header row ─────────────────────────────────────── */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Lock badge */}
          {isLocked && (
            <span className="inline-flex items-center gap-1 rounded-full bg-outline-variant/20 border border-outline-variant/30 px-2.5 py-0.5 text-[10px] font-label uppercase tracking-widest text-secondary/70">
              <span className="material-symbols-outlined text-[12px] leading-none">lock</span>
              Opens at 6 PM
            </span>
          )}
          {!isLocked && hasUserBid && (
            <span className={[
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-label uppercase tracking-widest",
              userBid.result_status === 'CANCELLED'
                ? "bg-error/10 border-error/20 text-error"
                : "bg-primary/20 border-primary/30 text-primary"
            ].join(' ')}>
              <span className="material-symbols-outlined text-[12px] leading-none">
                {userBid.result_status === 'CANCELLED' ? 'cancel' : 'how_to_reg'}
              </span>
              Your Bid {userBid.result_status === 'CANCELLED' ? 'Cancelled' : 'Active'}
            </span>
          )}
          <StatusBadge status={isLocked ? 'upcoming' : slotStatus} />
          {limitStatus && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-tertiary/10 border border-tertiary/30 px-2.5 py-0.5 text-[10px] font-label uppercase tracking-widest text-tertiary">
              <span className="material-symbols-outlined text-[14px] leading-none">military_tech</span>
              Wins: {limitStatus.wins_count}/{limitStatus.max_limit}
            </span>
          )}
        </div>

        {/* Countdown chip */}
        {countdownTarget && (
          <div className="flex shrink-0 items-center gap-1.5 rounded-xl bg-black/30 border border-outline-variant/20 px-3 py-1">
            <span className="material-symbols-outlined text-sm text-secondary">
              {isLocked ? 'lock_clock' : 'timer'}
            </span>
            <Countdown
              targetDateStr={countdownTarget}
              label={isLocked ? 'Opens in' : undefined}
            />
          </div>
        )}
      </div>

      {/* ── Identity bar ───────────────────────────────────── */}
      <div className={[
        'mb-8 flex w-full flex-col gap-6 rounded-3xl border px-8 py-6 md:flex-row md:items-center md:justify-between',
        isLocked
          ? 'border-outline-variant/20 bg-surface-variant/10'
          : 'border-primary/30 bg-primary/5 shadow-[inset_0_0_40px_rgba(255,176,201,0.06)]',
      ].join(' ')}>
        <div className="flex items-center gap-6">
          <div className={[
            'flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border text-3xl font-headline',
            isLocked
              ? 'bg-outline-variant/15 border-outline-variant/25 text-secondary/60'
              : 'bg-primary/20 border-primary/40 text-primary shadow-[0_0_20px_rgba(255,176,201,0.25)]',
          ].join(' ')}>
            {slot?.slot_id}
          </div>
          <div>
            <h3 className="font-headline text-3xl text-on-surface leading-none">Bidding Slot</h3>
            <p className={`mt-2 text-[11px] font-label uppercase tracking-[0.25em] ${isLocked ? 'text-secondary/50' : 'text-primary/70'}`}>
              {isLocked ? 'Coming Soon...' : 'Featured Opportunity'}
            </p>
          </div>
        </div>
        <div className="text-left md:text-right">
          <p className="text-[11px] font-label uppercase tracking-[0.25em] text-secondary/60 mb-1">
            {isLocked ? 'Slot Date' : 'Slot Deadline'}
          </p>
          <div className="flex items-center gap-2 md:justify-end">
            <span className="material-symbols-outlined text-base text-secondary/40">calendar_today</span>
            <p className="text-xl font-headline text-on-surface">{slot?.slot_date || 'TBD'}</p>
          </div>
        </div>
      </div>

      <p className="mb-5 text-sm leading-relaxed text-secondary/80 italic">
        {slot?.description || 'You can outbid others to secure this premium placement. Every bid brings you closer to exclusive visibility.'}
      </p>

      {/* ── Locked panel OR bid UI ──────────────────────────── */}
      {isLocked ? (
        <LockedPanel opensAt={slot?.opens_at} lockReason={slot?.lock_reason} />
      ) : (
        <>
          {/* Bid status */}
          <div className="mb-6">
            {hasUserBid ? (
              <div className={[
                "rounded-2xl border px-5 py-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.05)]",
                userBid.result_status === 'CANCELLED'
                  ? "border-error/20 bg-error/5"
                  : "border-primary/30 bg-primary/10 shadow-[inset_0_0_20px_rgba(255,176,201,0.05)]"
              ].join(' ')}>
                <p className={[
                  "mb-1 text-[10px] font-label uppercase tracking-[0.25em]",
                  userBid.result_status === 'CANCELLED' ? "text-error/70" : "text-primary/80"
                ].join(' ')}>
                  {userBid.result_status === 'CANCELLED' ? 'Last Cancelled Bid' : 'Your Current Bid'}
                </p>
                <p className={[
                  "font-headline text-3xl",
                  userBid.result_status === 'CANCELLED' ? "text-error/60 line-through" : "text-primary"
                ].join(' ')}>
                  ${Number(userBid.bid_amount).toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-5 py-6 text-center shadow-[inset_0_0_30px_rgba(255,176,201,0.03)]">
                {biddingDisabled ? (
                  <div className="py-2 text-center">
                    <span className="material-symbols-outlined text-2xl text-error mb-2">lock_person</span>
                    <p className="font-headline text-lg text-on-surface">Monthly Limit Reached</p>
                    <p className="mt-1 text-[11px] font-label uppercase tracking-widest text-secondary/60">
                      You have already won 3 times this month
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <span className="material-symbols-outlined text-xl">rocket_launch</span>
                    </div>
                    <p className="font-headline text-xl text-on-surface">You can bid now!</p>
                    <p className="mt-1 text-[11px] font-label uppercase tracking-widest text-secondary/60">
                      Be the first to secure this slot
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          {isOpen ? (
            hasUserBid ? (
                <div className="mt-auto grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <button
                    id={`update-bid-${slot?.slot_id}`}
                    onClick={() => onUpdateBid(slot, userBid)}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 font-headline text-sm text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:shadow-primary/30 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-lg">edit_square</span>
                    {userBid.result_status === 'CANCELLED' ? 'Re-activate' : 'Update Bid'}
                  </button>
                  
                  {userBid.result_status !== 'CANCELLED' && (
                    <button
                      id={`view-bid-status-${slot?.slot_id}`}
                      onClick={() => onViewBidStatus(slot, userBid)}
                      className="flex items-center justify-center gap-2 rounded-2xl border-2 border-tertiary bg-tertiary/10 px-4 py-3 font-headline text-sm text-tertiary transition-all hover:bg-tertiary/20 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-lg">analytics</span>
                      View Status
                    </button>
                  )}

                  {userBid.result_status !== 'CANCELLED' && (
                    <button
                      id={`cancel-bid-${slot?.slot_id}`}
                      onClick={() => onCancelBid(slot, userBid)}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-error/30 bg-error/5 px-4 py-3 font-headline text-sm text-error/70 transition-all hover:bg-error/10 hover:text-error active:scale-95"
                    >
                      <span className="material-symbols-outlined text-lg">cancel</span>
                      Cancel Bid
                    </button>
                  )}
                </div>
            ) : (
              <button
                id={`place-bid-${slot?.slot_id}`}
                onClick={() => onPlaceBid(slot)}
                disabled={biddingDisabled}
                className={[
                  'mt-auto w-full group/btn relative overflow-hidden rounded-2xl px-6 py-3.5 font-headline transition-all active:scale-95',
                  biddingDisabled
                    ? 'bg-outline-variant/20 text-secondary/40 cursor-not-allowed border border-outline-variant/10'
                    : 'bg-primary text-on-primary hover:scale-[1.02] hover:shadow-[0_8px_25px_rgba(255,176,201,0.3)] shadow-[0_4px_15px_rgba(255,176,201,0.1)]',
                ].join(' ')}
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <span>{biddingDisabled ? 'Monthly Limit Reached' : 'Enter Bidding Arena'}</span>
                  {!biddingDisabled && (
                    <span className="material-symbols-outlined text-lg transition-transform group-hover/btn:translate-x-1">
                      arrow_forward
                    </span>
                  )}
                </div>
                {!biddingDisabled && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
                )}
              </button>
            )
          ) : (
            <div className="mt-auto rounded-2xl border border-outline-variant/20 bg-black/20 py-3 text-center font-headline text-sm text-secondary">
              {slotStatus?.toLowerCase() === 'closed' ? 'Bidding Closed' : 'Opening Soon'}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SlotCard;
