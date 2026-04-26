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
function normaliseSlots(payload) {
  if (!payload || !payload.data) {
    return [];
  }
  let raw = payload.data;
  if (Array.isArray(raw)) {
    return raw;
  }
  if (typeof raw === 'object' && raw !== null) {
    return [raw];
  }
  return [];
}

function normaliseHistory(payload) {
  if (!payload || !payload.data) {
    return [];
  }
  if (Array.isArray(payload.data)) {
    return payload.data;
  }
  return [];
}

/* ── Section header (consistent with Dashboard.jsx) ─────── */
function SectionHeader(props) {
  return (
    <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="mb-2 text-[11px] font-label uppercase tracking-[0.28em] text-primary/75">{props.eyebrow}</p>
        <h2 className="font-headline text-3xl text-on-surface md:text-4xl">{props.title}</h2>
      </div>
      {props.description ? <p className="max-w-2xl text-sm leading-6 text-secondary">{props.description}</p> : null}
    </div>
  );
}

/* ── Stat pill ─────────────────────────────────────────── */
function StatPill(props) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-outline-variant/35 bg-black/25 px-4 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
        <span className="material-symbols-outlined text-base text-primary">{props.icon}</span>
      </div>
      <div>
        <p className="text-[10px] font-label uppercase tracking-[0.2em] text-secondary">{props.label}</p>
        <p className="font-headline text-lg text-on-surface">{props.value}</p>
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
function BidArena(props) {
  let user = props.user;
  let userId = null;
  if (user && user.user_id) {
    userId = user.user_id;
  }

  // ── State ──────────────────────────────────────────────
  let [slots, setSlots] = React.useState([]);
  let [history, setHistory] = React.useState([]);
  let [slotsLoading, setSlotsLoading] = React.useState(true);
  let [historyLoading, setHistoryLoading] = React.useState(true);
  let [slotsError, setSlotsError] = React.useState('');

  // userBids: map of slot_id -> bid record from history
  let [userBids, setUserBids] = React.useState({});

  // Modal state
  let [bidModal, setBidModal] = React.useState({ open: false, mode: 'place', slot: null, userBid: null });
  let [confirmModal, setConfirmModal] = React.useState({ open: false, slot: null, userBid: null });
  let [bidStatusModal, setBidStatusModal] = React.useState({ open: false, slot: null, userBid: null });
  let [modalLoading, setModalLoading] = React.useState(false);

  // Filter tab
  let [filter, setFilter] = React.useState('all');

  // ── Derived stats ────────────────────────────────────── 
  let totalBids = history.length;
  let wins = 0;
  for (let i = 0; i < history.length; i++) {
    let h = history[i];
    if (h.result_status && h.result_status.toUpperCase() === 'WON') {
      wins = wins + 1;
    }
  }

  // ── Load data ─────────────────────────────────────────
  const loadSlots = React.useCallback(async function() {
    if (!userId) {
      return;
    }
    setSlotsLoading(true);
    setSlotsError('');
    try {
      let payload = await getSlots(userId);
      let slotList = normaliseSlots(payload);
      setSlots(slotList);
    } catch (err) {
      if (err.message) {
        setSlotsError(err.message);
      } else {
        setSlotsError('Failed to load slots.');
      }
    } finally {
      setSlotsLoading(false);
    }
  }, [userId]);

  const loadHistory = React.useCallback(async function() {
    if (!userId) {
      return;
    }
    setHistoryLoading(true);
    try {
      let payload = await getBidHistory(userId);
      let hist = normaliseHistory(payload);
      setHistory(hist);

      // Build userBids map: slot_id -> most-recent bid
      let bidsMap = {};
      for (let i = 0; i < hist.length; i++) {
        let h = hist[i];
        let sid = String(h.slot_id);
        // Keep highest bid_id (most recent) for each slot
        if (!bidsMap[sid] || Number(h.bid_id) > Number(bidsMap[sid].bid_id)) {
          bidsMap[sid] = h;
        }
      }
      setUserBids(bidsMap);
      console.log("bidsMap", bidsMap);
    } catch (error) {
      // History load failure is non-fatal — just show empty
    } finally {
      setHistoryLoading(false);
    }
  }, [userId]);

  React.useEffect(function() {
    loadSlots();
    loadHistory();
  }, [loadSlots, loadHistory]);

  // ── Filtered slots ─────────────────────────────────────
  let filteredSlots = React.useMemo(function() {
    if (filter === 'ending') {
      let result = [];
      for (let i = 0; i < slots.length; i++) {
        let s = slots[i];
        if (s.status && s.status.toLowerCase() === 'active') {
          result.push(s);
        }
      }
      return result;
    }
    return slots;
  }, [slots, filter]);

  // ── Bid actions ────────────────────────────────────────
  function handlePlaceBid(slot) {
    setBidModal({ open: true, mode: 'place', slot: slot, userBid: null });
  }

  function handleUpdateBid(slot, userBid) {
    setBidModal({ open: true, mode: 'update', slot: slot, userBid: userBid });
  }

  function handleCancelBid(slot, userBid) {
    setConfirmModal({ open: true, slot: slot, userBid: userBid });
  }

  function handleViewBidStatus(slot, userBid) {
    setBidStatusModal({ open: true, slot: slot, userBid: userBid });
  }

  async function handleBidSubmit(amount) {
    setModalLoading(true);
    let mode = bidModal.mode;
    let slot = bidModal.slot;
    let userBid = bidModal.userBid;
    try {
      if (mode === 'place') {
        await placeBid(userId, slot.slot_id, amount);
        toast.success('Bid placed successfully!');
      } else {
        await updateBid(userId, userBid.bid_id, amount);
        toast.success('Bid updated successfully!');
      }
      setBidModal(function(prev) {
        return { ...prev, open: false };
      });
      await loadSlots();
      await loadHistory();
    } catch (err) {
      if (err.message) {
        toast.error(err.message);
      } else {
        toast.error('Bid action failed.');
      }
    } finally {
      setModalLoading(false);
    }
  }

  async function handleConfirmCancel() {
    setModalLoading(true);
    let userBid = confirmModal.userBid;
    try {
      await cancelBid(userId, userBid.bid_id);
      toast.success('Bid cancelled.');
      setConfirmModal(function(prev) {
        return { ...prev, open: false };
      });
      await loadSlots();
      await loadHistory();
    } catch (err) {
      if (err.message) {
        toast.error(err.message);
      } else {
        toast.error('Failed to cancel bid.');
      }
    } finally {
      setModalLoading(false);
    }
  }

  function closeBidModal() {
    setBidModal(function(prev) {
      return { ...prev, open: false };
    });
  }

  function closeBidStatusModal() {
    setBidStatusModal(function(prev) {
      return { ...prev, open: false };
    });
  }

  function closeConfirmModal() {
    setConfirmModal(function(prev) {
      return { ...prev, open: false };
    });
  }

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
        {slots.map(function(slot) {
          let userBid = userBids[String(slot.slot_id)];
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
              <BidSkeleton key={0} />
              <BidSkeleton key={1} />
              <BidSkeleton key={2} />
            </div>
          ) : slotsError !== '' ? (
            <div className="rounded-[28px] border border-error/30 bg-error/8 p-6 text-sm text-on-surface">
              <span className="material-symbols-outlined mr-2 align-middle text-error">error</span>
              {slotsError}
            </div>
          ) : filteredSlots.length === 0 ? (
            <EmptySlots />
          ) : (
            <div className="flex flex-col gap-6">
              {filteredSlots.map(function(slot) {
                return (
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
                );
              })}
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
        currentBid={bidModal.userBid ? bidModal.userBid.bid_amount : undefined}
        onSubmit={handleBidSubmit}
        onClose={closeBidModal}
        loading={modalLoading}
      />
      <BidStatusModal
        isOpen={bidStatusModal.open}
        slot={bidStatusModal.slot}
        userBid={bidStatusModal.userBid}
        userId={userId}
        onClose={closeBidStatusModal}
      />

      <ConfirmModal
        isOpen={confirmModal.open}
        title="Cancel Your Bid?"
        message={`This will permanently remove your bid on "${confirmModal.slot && confirmModal.slot.slot_name ? confirmModal.slot.slot_name : `Slot #${confirmModal.slot ? confirmModal.slot.slot_id : ''}`}". This action cannot be undone.`}
        onConfirm={handleConfirmCancel}
        onCancel={closeConfirmModal}
        loading={modalLoading}
      />
    </main>
  );
}

export default BidArena;
