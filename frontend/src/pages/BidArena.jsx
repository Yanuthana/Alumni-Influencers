import React from 'react';
import { toast } from 'react-hot-toast';
import { getSlots, placeBid, updateBid, cancelBid, getBidHistory } from '../services/bid-service';
import SlotCard from '../components/bid-arena/SlotCard';
import BidModal from '../components/bid-arena/BidModal';
import BidStatusModal from '../components/bid-arena/BidStatusModal';
import ConfirmModal from '../components/bid-arena/ConfirmModal';
import BidHistoryTable from '../components/bid-arena/BidHistoryTable';
import SlotResultBanner from '../components/bid-arena/SlotResultBanner';
import BidSkeleton from '../components/bid-arena/BidSkeleton';

/* ── Helpers ───────────────────────────────────────────── */
const normaliseSlots = (payload) => {
  // API now returns `data` as an array of slots (today + tomorrow).
  // Each slot may carry is_locked / lock_reason / opens_at fields.
  if (!payload?.data) return [];
  const raw = payload.data;
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'object' && raw !== null) return [raw]; // legacy fallback
  return [];
};

const normaliseHistory = (payload) => {
  if (!payload?.data) return [];
  if (Array.isArray(payload.data)) return payload.data;
  return [];
};

/* ── Section header (consistent with Dashboard.jsx) ─────── */
function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="mb-2 text-[11px] font-label uppercase tracking-[0.28em] text-primary/75">{eyebrow}</p>
        <h2 className="font-headline text-3xl text-on-surface md:text-4xl">{title}</h2>
      </div>
      {description && <p className="max-w-2xl text-sm leading-6 text-secondary">{description}</p>}
    </div>
  );
}

/* ── Stat pill ─────────────────────────────────────────── */
function StatPill({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-outline-variant/35 bg-black/25 px-4 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
        <span className="material-symbols-outlined text-base text-primary">{icon}</span>
      </div>
      <div>
        <p className="text-[10px] font-label uppercase tracking-[0.2em] text-secondary">{label}</p>
        <p className="font-headline text-lg text-on-surface">{value}</p>
      </div>
    </div>
  );
}

/* ── Empty state ────────────────────────────────────────── */
function EmptySlots() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-[28px] border border-outline-variant/30 bg-surface-container-low px-6 py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-variant">
        <span className="material-symbols-outlined text-3xl text-secondary/60">gavel</span>
      </div>
      <div className="text-center">
        <p className="font-headline text-xl text-on-surface">No Active Slots</p>
        <p className="mt-1 text-sm text-secondary">Bidding slots are generated daily. Check back after 6 PM for tomorrow's opportunities.</p>
      </div>
    </div>
  );
}

/* ── BidArena page ─────────────────────────────────────── */
function BidArena({ user }) {
  const userId = user?.user_id;

  // ── State ──────────────────────────────────────────────
  const [slots, setSlots] = React.useState([]);
  const [history, setHistory] = React.useState([]);
  const [slotsLoading, setSlotsLoading] = React.useState(true);
  const [historyLoading, setHistoryLoading] = React.useState(true);
  const [slotsError, setSlotsError] = React.useState('');

  // userBids: map of slot_id -> bid record from history
  const [userBids, setUserBids] = React.useState({});

  // Modal state
  const [bidModal, setBidModal] = React.useState({ open: false, mode: 'place', slot: null, userBid: null });
  const [confirmModal, setConfirmModal] = React.useState({ open: false, slot: null, userBid: null });
  const [bidStatusModal, setBidStatusModal] = React.useState({ open: false, slot: null, userBid: null });
  const [modalLoading, setModalLoading] = React.useState(false);

  // Filter tab
  const [filter, setFilter] = React.useState('all');

  // ── Derived stats ────────────────────────────────────── 
  const totalBids = history.length;
  const wins = history.filter((h) => h.result_status?.toUpperCase() === 'WON').length;

  // ── Load data ─────────────────────────────────────────
  const loadSlots = React.useCallback(async () => {
    if (!userId) return;
    setSlotsLoading(true);
    setSlotsError('');
    try {
      const payload = await getSlots(userId);
      const slotList = normaliseSlots(payload);
      setSlots(slotList);
    } catch (err) {
      setSlotsError(err.message || 'Failed to load slots.');
    } finally {
      setSlotsLoading(false);
    }
  }, [userId]);

  const loadHistory = React.useCallback(async () => {
    if (!userId) return;
    setHistoryLoading(true);
    try {
      const payload = await getBidHistory(userId);
      const hist = normaliseHistory(payload);
      setHistory(hist);

      // Build userBids map: slot_id -> most-recent bid
      const bidsMap = {};
      hist.forEach((h) => {
        const sid = String(h.slot_id);
        // Keep highest bid_id (most recent) for each slot
        if (!bidsMap[sid] || Number(h.bid_id) > Number(bidsMap[sid].bid_id)) {
          bidsMap[sid] = h;
        }
      });
      setUserBids(bidsMap);
      console.log("bidsMap",bidsMap);
    } catch {
      // History load failure is non-fatal — just show empty
    } finally {
      setHistoryLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    loadSlots();
    loadHistory();
  }, [loadSlots, loadHistory]);

  // ── Filtered slots ─────────────────────────────────────
  const filteredSlots = React.useMemo(() => {
    if (filter === 'ending') {
      return slots.filter((s) => {
        const stat = s.status?.toLowerCase();
        return stat === 'active';
      });
    }
    return slots;
  }, [slots, filter]);

  // ── Bid actions ────────────────────────────────────────
  const handlePlaceBid = (slot) => {
    setBidModal({ open: true, mode: 'place', slot, userBid: null });
  };

  const handleUpdateBid = (slot, userBid) => {
    setBidModal({ open: true, mode: 'update', slot, userBid });
  };

  const handleCancelBid = (slot, userBid) => {
    setConfirmModal({ open: true, slot, userBid });
  };

  const handleViewBidStatus = (slot, userBid) => {
    setBidStatusModal({ open: true, slot, userBid });
  };

  const handleBidSubmit = async (amount) => {
    setModalLoading(true);
    const { mode, slot, userBid } = bidModal;
    try {
      if (mode === 'place') {
        await placeBid(userId, slot.slot_id, amount);
        toast.success('Bid placed successfully!');
      } else {
        await updateBid(userId, userBid.bid_id, amount);
        toast.success('Bid updated successfully!');
      }
      setBidModal((prev) => ({ ...prev, open: false }));
      await Promise.all([loadSlots(), loadHistory()]);
    } catch (err) {
      toast.error(err.message || 'Bid action failed.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    setModalLoading(true);
    const { userBid } = confirmModal;
    try {
      await cancelBid(userId, userBid.bid_id);
      toast.success('Bid cancelled.');
      setConfirmModal((prev) => ({ ...prev, open: false }));
      await Promise.all([loadSlots(), loadHistory()]);
    } catch (err) {
      toast.error(err.message || 'Failed to cancel bid.');
    } finally {
      setModalLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-surface pb-16 pt-28">
      {/* ── Hero ── */}
      <section className="mx-auto mb-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-outline-variant/35 bg-[radial-gradient(circle_at_top_left,_rgba(255,176,201,0.18),_transparent_30%),linear-gradient(135deg,_rgba(42,42,42,0.95),_rgba(19,19,19,1))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.28)] md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 text-[11px] font-label uppercase tracking-[0.28em] text-primary/80">
                Alumni Exclusive
              </p>
              <h1 className="font-headline text-4xl text-on-surface md:text-6xl">
                Bid Arena
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-secondary md:text-base">
                Compete for exclusive slots in a live auction environment. Monitor your position, outbid rivals, and secure your placement.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <StatPill icon="gavel" label="Total Bids" value={historyLoading ? '—' : totalBids} />
              <StatPill icon="emoji_events" label="Total Wins" value={historyLoading ? '—' : wins} />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* ── Slot Results (if any) ── */}
        {slots.map((slot) => {
          const userBid = userBids[String(slot.slot_id)];
          return (
            <SlotResultBanner
              key={`result-${slot.slot_id}`}
              slot={slot}
              userBid={userBid}
              history={history}
            />
          );
        })}

        {/* ── Available Slots ── */}
        <section>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <SectionHeader
              eyebrow="Live Auction"
              title="Available Slot"
            />
          </div>

          {slotsLoading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[...Array(3)].map((_, i) => <BidSkeleton key={i} />)}
            </div>
          ) : slotsError ? (
            <div className="rounded-[28px] border border-error/30 bg-error/8 p-6 text-sm text-on-surface">
              <span className="material-symbols-outlined mr-2 align-middle text-error">error</span>
              {slotsError}
            </div>
          ) : filteredSlots.length === 0 ? (
            <EmptySlots />
          ) : (
            <div className="flex flex-col gap-6">
              {filteredSlots.map((slot) => (
                <SlotCard
                  key={slot.slot_id}
                  slot={slot}
                  userId={userId}
                  userBid={userBids[String(slot.slot_id)] || null}
                  onPlaceBid={handlePlaceBid}
                  onUpdateBid={handleUpdateBid}
                  onViewBidStatus={handleViewBidStatus}
                  onCancelBid={handleCancelBid}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Bid History ── */}
        <section>
          <div className="mb-6 flex items-center justify-between gap-4">
            <SectionHeader
              eyebrow="Your Record"
              title="Bidding History"
              description="A full timeline of your auction activity on this platform."
            />
            <button
              id="refresh-history"
              onClick={loadHistory}
              className="flex shrink-0 items-center gap-2 rounded-2xl border border-outline-variant/30 bg-surface-container-low px-4 py-2 text-xs font-label uppercase tracking-[0.18em] text-secondary transition-all hover:text-on-surface hover:border-outline-variant/50"
            >
              <span className="material-symbols-outlined text-base">refresh</span>
              Refresh
            </button>
          </div>
          <BidHistoryTable history={history} loading={historyLoading} />
        </section>
      </div>

      {/* ── Modals ── */}
      <BidModal
        isOpen={bidModal.open}
        mode={bidModal.mode}
        slot={bidModal.slot}
        currentBid={bidModal.userBid?.bid_amount}
        onSubmit={handleBidSubmit}
        onClose={() => setBidModal((prev) => ({ ...prev, open: false }))}
        loading={modalLoading}
      />
      <BidStatusModal
        isOpen={bidStatusModal.open}
        slot={bidStatusModal.slot}
        userBid={bidStatusModal.userBid}
        userId={userId}
        onClose={() => setBidStatusModal((prev) => ({ ...prev, open: false }))}
      />

      <ConfirmModal
        isOpen={confirmModal.open}
        title="Cancel Your Bid?"
        message={`This will permanently remove your bid on "${confirmModal.slot?.slot_name || `Slot #${confirmModal.slot?.slot_id}`}". This action cannot be undone.`}
        onConfirm={handleConfirmCancel}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
        loading={modalLoading}
      />
    </main>
  );
}

export default BidArena;
