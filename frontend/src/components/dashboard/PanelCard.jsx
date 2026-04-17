function PanelCard({ title, eyebrow, action, children, className = '' }) {
  return (
    <section className={`rounded-[28px] border border-outline-variant/40 bg-gradient-to-br from-surface-container to-surface-container-high p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)] ${className}`}>
      {(title || eyebrow || action) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {eyebrow ? (
              <p className="mb-2 text-[11px] font-label uppercase tracking-[0.28em] text-primary/75">
                {eyebrow}
              </p>
            ) : null}
            {title ? <h3 className="font-headline text-2xl text-on-surface">{title}</h3> : null}
          </div>
          {action ? <div>{action}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}

export default PanelCard;
