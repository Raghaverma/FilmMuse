import * as React from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { getUserWatchlist } from "@/lib/firebase/firestore";
import { movieService } from "@/services/movie.service";
import type { Movie } from "@/types/movies";

export function useRecommendations() {
  const { user } = useAuth();
  const [personalizedRecs, setPersonalizedRecs] = React.useState<Movie[]>([]);
  const [randomRecs, setRandomRecs] = React.useState<Movie[]>([]);
  const [loadingPersonalized, setLoadingPersonalized] = React.useState(true);
  const [loadingRandom, setLoadingRandom] = React.useState(true);

  React.useEffect(() => {
    const loadPersonalized = async () => {
      if (!user) {
        setLoadingPersonalized(false);
        return;
      }
      try {
        const watchlist = await getUserWatchlist(user.uid);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await movieService.getRecommendations(watchlist.watchlist as any, watchlist.liked as any);
        setPersonalizedRecs(data.items || []);
      } catch {
        // Handle error silently
      } finally {
        setLoadingPersonalized(false);
      }
    };

    const loadRandom = async () => {
      try {
        const data = await movieService.getRandomRecommendations();
        setRandomRecs(data.items || []);
      } catch {
        // Handle error silently
      } finally {
        setLoadingRandom(false);
      }
    };

    loadPersonalized();
    loadRandom();
  }, [user]);

  const refreshPersonalized = React.useCallback(async () => {
    if (!user) return;
    try {
      const watchlist = await getUserWatchlist(user.uid);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await movieService.getRecommendations(watchlist.watchlist as any, watchlist.liked as any);
      setPersonalizedRecs(data.items || []);
    } catch {
      // Handle error silently
    }
  }, [user]);

  return {
    personalizedRecs,
    randomRecs,
    loadingPersonalized,
    loadingRandom,
    refreshPersonalized,
  };
}

