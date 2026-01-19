export default function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Phone shape */}
      <rect
        x="30"
        y="10"
        width="40"
        height="70"
        rx="6"
        fill="#2563eb"
        stroke="#1d4ed8"
        strokeWidth="2"
      />

      {/* Screen */}
      <rect
        x="35"
        y="17"
        width="30"
        height="50"
        rx="2"
        fill="#dbeafe"
      />

      {/* Heart icon in screen */}
      <path
        d="M50 35 C48 32, 45 32, 43 35 C41 38, 41 41, 50 48 C59 41, 59 38, 57 35 C55 32, 52 32, 50 35 Z"
        fill="#ef4444"
      />

      {/* Home button */}
      <circle cx="50" cy="74" r="3" fill="#dbeafe" />

      {/* Shield overlay */}
      <path
        d="M50 85 L35 90 C35 75, 40 70, 50 65 C60 70, 65 75, 65 90 Z"
        fill="#10b981"
        opacity="0.9"
      />

      {/* Check mark in shield */}
      <path
        d="M45 82 L48 85 L55 75"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
