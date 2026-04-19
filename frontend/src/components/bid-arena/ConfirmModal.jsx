import React from 'react';

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, loading = false }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm rounded-[28px] border border-error/30 bg-gradient-to-br from-surface-container to-surface-container-high p-6 shadow-[0_32px_80px_rgba(0,0,0,0.5)]"
        style={{ animation: 'modalIn 0.2s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-error/15 border border-error/25">
          <span className="material-symbols-outlined text-error text-2xl">warning</span>
        </div>

        <h3 className="mb-2 font-headline text-2xl text-on-surface">{title}</h3>
        <p className="mb-6 text-sm leading-6 text-secondary">{message}</p>

        <div className="flex gap-3">
          <button
            id="confirm-cancel-dismiss"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-2xl border border-outline-variant/40 bg-surface-container px-4 py-3 font-headline text-on-surface transition-all hover:bg-surface-variant disabled:opacity-50"
          >
            Keep Bid
          </button>
          <button
            id="confirm-cancel-confirm"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-2xl bg-error/20 border border-error/40 px-4 py-3 font-headline text-error transition-all hover:bg-error/30 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="h-4 w-4 rounded-full border-2 border-error/40 border-t-error animate-spin" />
            ) : null}
            {loading ? 'Cancelling…' : 'Cancel Bid'}
          </button>
        </div>
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

export default ConfirmModal;
