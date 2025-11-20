import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Film, Star } from "lucide-react";

interface EmptyStateProps {
  icon: "film" | "star";
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
}

export default function EmptyState({ icon, title, description, buttonText, buttonHref }: EmptyStateProps) {
  const Icon = icon === "film" ? Film : Star;
  return (
    <div className="text-center py-12">
      <Icon className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
      <p className="text-sm text-neutral-400 mb-2">{title}</p>
      <p className="text-xs text-neutral-500">{description}</p>
      <Link href={buttonHref}>
        <Button className="mt-4 bg-emerald-400 text-black hover:bg-emerald-300">
          {buttonText}
        </Button>
      </Link>
    </div>
  );
}

