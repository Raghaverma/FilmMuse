import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Film, Star, Heart, Bookmark, ArrowRight } from "lucide-react";

interface EmptyStateProps {
  icon: "film" | "star" | "heart" | "bookmark";
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
}

export default function EmptyState({ icon, title, description, buttonText, buttonHref }: EmptyStateProps) {
  const IconMap = {
    film: Film,
    star: Star,
    heart: Heart,
    bookmark: Bookmark,
  };
  const Icon = IconMap[icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center py-16"
    >
      <div className="relative inline-flex items-center justify-center mb-6">
        <div className="absolute inset-0 bg-emerald-400/20 blur-3xl rounded-full" />
        <div className="relative bg-gradient-to-br from-neutral-800 to-neutral-900 p-6 rounded-2xl border border-white/10">
          <Icon className="h-12 w-12 text-neutral-500" />
        </div>
      </div>

      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-neutral-400 mb-6 max-w-md mx-auto">{description}</p>
      
      <Link href={buttonHref}>
        <Button className="bg-emerald-400 text-black hover:bg-emerald-300 group">
          {buttonText}
          <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
        </Button>
      </Link>
    </motion.div>
  );
}

