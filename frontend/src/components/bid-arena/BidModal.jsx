import React from 'react';

function BidModal({ isOpen, mode = 'place', slot, currentBid, onSubmit, onClose, loading = false }) {
  const [amount, setAmount] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (isOpen) {
      setAmount(mode === 'update' && currentBid ? String(currentBid) : '');
      setError('');
    }
  }, [isOpen, mode, currentBid]);

  if (!isOpen) return null;

  const minBid = slot?.highest_bid ? Number(slot.highest_bid) + 1 : 1;

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0) {
      setError('Please enter a valid bid amount.');
      return;
    }
    if (mode === 'update' && currentBid && num < Number(currentBid)) {
        setError(`Your updated bid cannot be less than your current bid of $${Number(currentBid).toLocaleString()}.`);
        return;
    }
    if (num < minBid) {
        setError(`Your bid must be at least $${minBid.toLocaleString()}.`);
      return;
    }
    setError('');
    onSubmit(num);
  };

  const isUpdate = mode === 'update';

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-[28px] border border-outline-variant/40 bg-gradient-to-br from-surface-container to-surface-container-high p-7 shadow-[0_32px_80px_rgba(0,0,0,0.5)]"
        style={{ animation: 'modalIn 0.2s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          id="bid-modal-close"
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-surface-variant text-secondary hover:bg-surface-bright transition-colors"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        {/* Header */}
        <div className="mb-6">
          <p className="mb-2 text-[11px] font-label uppercase tracking-[0.28em] text-primary/75">
            {isUpdate ? 'Update Bid' : 'Place Bid'}
          </p>
          <h3 className="font-headline text-3xl text-on-surface">
            {isUpdate ? 'Revise Your Offer' : 'Enter the Arena'}
          </h3>
          {slot && (
            <p className="mt-2 text-sm text-secondary">
              Slot: <span className="text-on-surface font-medium">{slot.slot_name || `Slot #${slot.slot_id}`}</span>
            </p>
          )}
        </div>

        {/* Current high */}
        {slot?.highest_bid && (
          <div className="mb-5 flex items-center justify-between rounded-2xl bg-black/30 border border-outline-variant/20 px-5 py-3">
            <span className="text-xs uppercase tracking-[0.2em] text-secondary">Current High</span>
            <span className="font-headline text-2xl text-primary">${Number(slot.highest_bid).toLocaleString()}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <label className="mb-2 block text-xs font-label uppercase tracking-[0.22em] text-secondary">
            Your Bid Amount
          </label>
          <div className="relative mb-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-headline text-xl text-primary/70">$</span>
            <input
              id="bid-amount-input"
              type="number"
              min={minBid}
              step="0.01"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(''); }}
              placeholder={`Min $${minBid.toLocaleString()}`}
              className="w-full rounded-2xl border border-outline-variant/40 bg-surface-container-low py-3.5 pl-9 pr-4 font-headline text-2xl text-on-surface placeholder:text-secondary/40 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          {error && <p className="mb-3 text-xs text-error">{error}</p>}

          {/* Terms notice */}
          <p className="mb-5 mt-3 text-xs leading-5 text-secondary/70 rounded-xl border border-outline-variant/20 bg-black/20 px-4 py-3">
            By placing a bid, you agree to the Alumni Bidding Protocol and acknowledge that bids are binding pending slot assignment.
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-2xl border border-outline-variant/40 bg-surface-container px-4 py-3 font-headline text-on-surface transition-all hover:bg-surface-variant disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              id="bid-modal-submit"
              type="submit"
              disabled={loading}
              className="flex-1 rounded-2xl murrey-gradient px-4 py-3 font-headline text-on-primary transition-all hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="h-4 w-4 rounded-full border-2 border-on-primary/40 border-t-on-primary animate-spin" />
              )}
              {loading ? 'Submitting…' : isUpdate ? 'Update Bid' : 'Place Bid'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default BidModal;
