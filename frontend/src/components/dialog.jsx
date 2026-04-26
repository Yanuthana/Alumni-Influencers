export const Dialog = ({ title, description, onClose, onConfirm, input }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-md rounded-2xl border border-outline-variant/30 bg-surface-container-high p-5 shadow-2xl">
                <div className="mb-4 flex items-start justify-between gap-4">
                    <h2 className="text-xl font-headline font-bold tracking-tight text-on-surface">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-on-surface"
                        aria-label="Close dialog"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                <p className="mb-6 text-sm leading-relaxed text-on-surface-variant">{description}</p>
                {input}

                <div className="flex justify-center gap-3">
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="rounded-lg murrey-gradient px-4 py-2 font-headline text-sm font-semibold tracking-tight text-on-primary shadow-lg shadow-primary/15 transition-all hover:shadow-primary/25 active:scale-[0.98]"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}