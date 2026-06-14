interface JakuyLogoProps {
  className?: string;
}

const JakuyLogo = ({ className }: JakuyLogoProps) => {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label="Jakuy TV"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="jakuy-logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f87171" />
          <stop offset="1" stopColor="#b91c1c" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="13" fill="url(#jakuy-logo-grad)" />
      <path d="M19.5 15.5 L34 24 L19.5 32.5 Z" fill="white" />
      <circle cx="13" cy="13" r="2.1" fill="white" opacity="0.9" />
      <path
        d="M17.5 13 a4.6 4.6 0 0 0 -4.6 -4.6"
        fill="none"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
};

export default JakuyLogo;
