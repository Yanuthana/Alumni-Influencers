import React from 'react';

function AnimatedValue({ value, suffix = '', prefix = '' }) {
  const numericValue = Number(value) || 0;
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    let frameId;
    const duration = 700;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplayValue(Math.round(numericValue * progress));
      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [numericValue]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

function StatCard({
  icon,
  label,
  value,
  suffix = '',
  prefix = '',
  helper,
  progress,
  accent = 'from-primary/30 to-primary-container/50',
}) {
  return (
    <div className="group rounded-[24px] border border-outline-variant/40 bg-surface-container-low p-5 shadow-[0_16px_40px_rgba(0,0,0,0.18)] transition-transform duration-300 hover:-translate-y-1">
      <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accent}`}>
        <span className="material-symbols-outlined text-on-surface">{icon}</span>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-label uppercase tracking-[0.2em] text-secondary">{label}</p>
        <p className="font-headline text-4xl text-on-surface">
          <AnimatedValue value={value} prefix={prefix} suffix={suffix} />
        </p>
        {helper ? <p className="text-sm text-secondary">{helper}</p> : null}
      </div>
      {typeof progress === 'number' ? (
        <div className="mt-5">
          <div className="h-2 rounded-full bg-black/35">
            <div
              className="h-2 rounded-full murrey-gradient transition-all duration-700"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default StatCard;
