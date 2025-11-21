export default function TrustBar() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-xs text-muted-foreground dark:text-neutral-500">
        <span>Personalized • No spoilers • Fast</span>
        <span className="hidden sm:inline">|</span>
        <span>Privacy-respecting</span>
        <span className="hidden sm:inline">|</span>
        <span>Built for film lovers</span>
      </div>
    </div>
  );
}

