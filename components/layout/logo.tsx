export function FintechLogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect x="1.5" y="12.5" width="3.5" height="6" rx="0.875" fill="currentColor" fillOpacity="0.55" />
      <rect x="8.25" y="8" width="3.5" height="10.5" rx="0.875" fill="currentColor" fillOpacity="0.8" />
      <rect x="15" y="3.5" width="3.5" height="15" rx="0.875" fill="currentColor" />
      <path
        d="M3.25 11.5 L10 7 L16.75 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
