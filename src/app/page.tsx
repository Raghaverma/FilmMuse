import HeroSection from "@/components/home/HeroSection";
import ContinueWatchingCarousel from "@/components/home/ContinueWatchingCarousel";
import FriendActivityFeed from "@/components/home/FriendActivityFeed";
import RecommendedGrid from "@/components/home/RecommendedGrid";
import StatisticsWidgets from "@/components/home/StatisticsWidgets";

export default function HomePage() {
  return (
    <div className="min-h-screen surface-base">
      <HeroSection />
      <ContinueWatchingCarousel />
      <StatisticsWidgets />
      <RecommendedGrid />
      <FriendActivityFeed />
    </div>
  );
}
