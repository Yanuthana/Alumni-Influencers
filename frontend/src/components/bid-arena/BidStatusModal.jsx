import React from 'react';
import { getBidStatus } from '../../services/bid-service';

function BidStatusModal({ isOpen, onClose, slot, userBid, userId }) {
  const [loading, setLoading] = React.useState(false);
  const [statusData, setStatusData] = React.useState(null);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (isOpen && userBid?.bid_id && userId) {
      fetchStatus();
    }
  }, [isOpen, userBid, userId]);

  const fetchStatus = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getBidStatus(userId, userBid.bid_id);
      console.log("res", res);
      setStatusData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch status');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isWinning = statusData?.bid_status === 'WINNING';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-outline-variant/30 bg-surface-container-high p-1 shadow-[0_32px_80px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200">
        <div className="rounded-[28px] bg-gradient-to-br from-surface to-surface-container-low p-8">

          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-headline text-2xl text-on-surface">Bid Status</h2>
            <button
              onClick={onClose}
              className="group flex h-10 w-10 items-center justify-center rounded-full bg-surface-variant/30 text-secondary transition-all hover:bg-error/10 hover:text-error"
            >
              <span className="material-symbols-outlined text-xl transition-transform group-hover:rotate-90">close</span>
            </button>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-4 text-secondary/60">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
              <p className="text-xs font-label uppercase tracking-widest">Checking Auction status...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-error">
              <span className="material-symbols-outlined text-4xl mb-2">error</span>
              <p className="text-sm">{error}</p>
              <button
                onClick={fetchStatus}
                className="mt-4 rounded-xl border border-error/30 bg-error/10 px-4 py-2 text-xs font-label uppercase tracking-widest text-error hover:bg-error/20"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Status Indicator */}
              <div className="flex flex-col items-center text-center">
                <div className={[
                  "mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 shadow-lg animate-in zoom-in-50 duration-500",
                  isWinning
                    ? "border-tertiary/50 bg-tertiary/10 text-tertiary shadow-tertiary/10"
                    : "border-error/50 bg-error/10 text-error shadow-error/10"
                ].join(' ')}>
                  <span className="material-symbols-outlined text-4xl">
                    {isWinning ? 'verified' : 'arrow_upward'}
                  </span>
                </div>

                <h3 className={[
                  "font-headline text-3xl",
                  isWinning ? "text-tertiary" : "text-error"
                ].join(' ')}>
                  {isWinning ? 'Winning' : 'Not Winning'}
                </h3>
                <p className="mt-2 text-sm text-secondary">
                  {isWinning
                    ? 'Your bid is currently the highest for this slot!'
                    : 'Someone has outbid you. Increase your bid to secure this slot.'}
                </p>
              </div>

              {/* Bid Details Card */}
              <div className="rounded-2xl border border-outline-variant/30 bg-surface-variant/20 p-5">
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 mb-4">
                  <span className="text-[11px] font-label uppercase tracking-widest text-secondary/70">Your Bid</span>
                  <span className="font-headline text-xl text-on-surface">${Number(userBid?.bid_amount || 0).toLocaleString()}</span>
                </div>
                {statusData?.highest_bid && (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-label uppercase tracking-widest text-secondary/70">Highest Bid</span>
                    <span className="font-headline text-xl text-primary">${Number(statusData.highest_bid).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <button
                onClick={onClose}
                className="w-full rounded-2xl bg-surface-variant px-6 py-3.5 font-headline text-sm text-on-surface transition-all hover:bg-surface-variant/80 active:scale-95"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BidStatusModal;
