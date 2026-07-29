// Workervet brand logo — blue head + shield mark with lowercase wordmark.
export const LogoMark = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 124" className={className} aria-hidden="true">
    <circle cx="50" cy="24" r="22" fill="#2563eb" />
    <path
      d="M10 64 Q10 52 22 52 L78 52 Q90 52 90 64 L90 84 Q90 106 50 122 Q10 106 10 84 Z"
      fill="#2563eb"
    />
  </svg>
);

// Full lockup: mark + wordmark. `sub` renders a small qualifier under the name.
export const Logo = ({
  markClass = "w-7 h-7",
  textClass = "text-lg",
  sub,
}: {
  markClass?: string;
  textClass?: string;
  sub?: string;
}) => (
  <span className="inline-flex items-center gap-2">
    <LogoMark className={markClass} />
    <span className="leading-tight">
      <span className={`block font-bold tracking-tight text-slate-900 lowercase ${textClass}`}>
        workervet
      </span>
      {sub && <span className="block text-[11px] text-slate-400 -mt-0.5">{sub}</span>}
    </span>
  </span>
);
