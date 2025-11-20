interface TabButtonProps {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

export default function TabButton({ label, count, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "border-b-2 border-emerald-400 text-emerald-400"
          : "text-neutral-400 hover:text-white"
      }`}
    >
      {label} ({count})
    </button>
  );
}

