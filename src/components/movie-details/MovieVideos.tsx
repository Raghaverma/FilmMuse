"use client";

import * as React from "react";
import Image from "next/image";
import { Play, Film, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Video = {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
};

interface MovieVideosProps {
  tmdbId?: number;
}

export default function MovieVideos({ tmdbId }: MovieVideosProps) {
  const [videos, setVideos] = React.useState<Video[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedVideo, setSelectedVideo] = React.useState<Video | null>(null);

  React.useEffect(() => {
    if (!tmdbId) return;

    const loadVideos = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/movie/${tmdbId}/videos`);
        if (res.ok) {
          const data = await res.json();
          setVideos(data.videos || []);
        }
      } catch (error) {
        console.error("Failed to load videos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, [tmdbId]);

  React.useEffect(() => {
    if (selectedVideo) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedVideo]);

  React.useEffect(() => {
    if (!selectedVideo) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedVideo(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedVideo]);

  if (loading) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Videos</h3>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-80 h-44 bg-white/5 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return null;
  }

  // Filter to show trailers first, then other videos
  const trailers = videos.filter((v) => v.type === "Trailer" && v.site === "YouTube");
  const otherVideos = videos.filter((v) => !(v.type === "Trailer" && v.site === "YouTube"));
  const displayVideos = [...trailers, ...otherVideos].slice(0, 6);

  if (displayVideos.length === 0) {
    return null;
  }

  const getVideoUrl = (video: Video) => {
    if (video.site === "YouTube") {
      // Use the standard YouTube embed URL with proper parameters including mute for autoplay policy
      return `https://www.youtube.com/embed/${video.key}?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1`;
    }
    return null;
  };

  const getYouTubeWatchUrl = (video: Video) => {
    if (video.site === "YouTube") {
      return `https://www.youtube.com/watch?v=${video.key}`;
    }
    return null;
  };

  return (
    <>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Videos</h3>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {displayVideos.map((video) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 w-80 cursor-pointer group"
              onClick={(e) => {
                e.stopPropagation();
                if (video.site === "YouTube") {
                  setSelectedVideo(video);
                }
              }}
            >
              <div className="relative aspect-video bg-white/5 rounded-lg overflow-hidden border border-white/10 group-hover:border-emerald-400/50 transition-colors">
                {video.site === "YouTube" ? (
                  <>
                    <Image
                      src={`https://img.youtube.com/vi/${video.key}/maxresdefault.jpg`}
                      alt={video.name}
                      fill
                      className="object-cover"
                      onError={(e: any) => {
                        const target = e.currentTarget;
                        target.style.display = "none";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-red-600/90 group-hover:bg-red-600 flex items-center justify-center transition-colors">
                        <Play className="h-8 w-8 text-white ml-1" fill="white" />
                      </div>
                    </div>
                    {video.official && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-emerald-500/90 text-xs font-medium text-white rounded">
                        Official
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film className="h-12 w-12 text-neutral-400" />
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm text-neutral-300 line-clamp-2 group-hover:text-white transition-colors">
                {video.name}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                {video.type} • {new Date(video.published_at).getFullYear()}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm"
              onClick={() => setSelectedVideo(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-4 z-[101] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full max-w-6xl aspect-video bg-black rounded-lg overflow-hidden">
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="absolute top-4 right-4 z-10 p-2 bg-black/70 hover:bg-black/90 rounded-full transition-colors"
                  aria-label="Close video"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
                {getVideoUrl(selectedVideo) && selectedVideo.site === "YouTube" ? (
                  <iframe
                    src={getVideoUrl(selectedVideo) || undefined}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    title={selectedVideo.name}
                    style={{ width: "100%", height: "100%", border: "none" }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white p-8">
                    <p className="text-lg mb-4">Unable to load video</p>
                    {getYouTubeWatchUrl(selectedVideo) && (
                      <a
                        href={getYouTubeWatchUrl(selectedVideo) || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                      >
                        Watch on YouTube
                      </a>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}





