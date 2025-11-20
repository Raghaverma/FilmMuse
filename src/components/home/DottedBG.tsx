export default function DottedBG() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-[radial-gradient(600px_400px_at_50%_-50%,rgba(16,185,129,0.15),transparent_70%)]" />
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.07]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="dot" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot)" />
      </svg>
      <div className="pointer-events-none absolute inset-6 grid grid-cols-2 grid-rows-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border-emerald-300/30"
            style={{
              borderTopWidth: i < 2 ? 2 : 0,
              borderBottomWidth: i >= 2 ? 2 : 0,
              borderLeftWidth: i % 2 === 0 ? 2 : 0,
              borderRightWidth: i % 2 === 1 ? 2 : 0,
              borderRadius: 12,
            }}
          />
        ))}
      </div>
    </div>
  );
}

