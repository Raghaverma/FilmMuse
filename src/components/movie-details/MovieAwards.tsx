import { Award } from "lucide-react";

interface MovieAwardsProps {
  awards?: string;
}

export default function MovieAwards({ awards }: MovieAwardsProps) {
  if (!awards || awards === "N/A") return null;

  return (
    <div className="flex items-start gap-2 p-4 rounded-lg bg-emerald-400/10 border border-emerald-400/20">
      <Award className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
      <div>
        <h4 className="text-sm font-medium text-emerald-300 mb-1">Awards</h4>
        <p className="text-sm text-neutral-300">{awards}</p>
      </div>
    </div>
  );
}

