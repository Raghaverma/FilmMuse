"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w185";

type CastMember = {
  id: number;
  name: string;
  character?: string;
  order: number;
  profile_path?: string | null;
  known_for_department?: string;
};

type CrewMember = {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path?: string | null;
};

interface MovieFullCastProps {
  tmdbId?: number;
}

export default function MovieFullCast({ tmdbId }: MovieFullCastProps) {
  const [cast, setCast] = React.useState<CastMember[]>([]);
  const [crew, setCrew] = React.useState<CrewMember[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showAllCast, setShowAllCast] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"cast" | "crew">("cast");

  React.useEffect(() => {
    if (!tmdbId) return;

    const loadCredits = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/movie/${tmdbId}/credits`);
        if (res.ok) {
          const data = await res.json();
          setCast(data.cast || []);
          setCrew(data.crew || []);
        }
      } catch (error) {
        console.error("Failed to load credits:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCredits();
  }, [tmdbId]);

  if (loading) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Cast & Crew</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="w-full aspect-[2/3] bg-white/5 rounded-lg mb-2" />
              <div className="h-4 bg-white/5 rounded w-3/4 mb-1" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (cast.length === 0 && crew.length === 0) {
    return null;
  }

  const displayedCast = showAllCast ? cast : cast.slice(0, 10);
  const importantCrew = crew.filter(
    (c) =>
      c.job === "Director" ||
      c.job === "Producer" ||
      c.job === "Screenplay" ||
      c.job === "Writer" ||
      c.job === "Cinematography" ||
      c.job === "Music" ||
      c.job === "Editor"
  );

  // Group crew by department
  const crewByDepartment = importantCrew.reduce((acc, member) => {
    if (!acc[member.department]) {
      acc[member.department] = [];
    }
    acc[member.department].push(member);
    return acc;
  }, {} as Record<string, CrewMember[]>);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Cast & Crew</h3>
        {(cast.length > 0 || crew.length > 0) && (
          <div className="flex gap-2">
            {cast.length > 0 && (
              <button
                onClick={() => setActiveTab("cast")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  activeTab === "cast"
                    ? "bg-emerald-400 text-black"
                    : "bg-white/5 text-neutral-300 hover:bg-white/10"
                }`}
              >
                Cast ({cast.length})
              </button>
            )}
            {crew.length > 0 && (
              <button
                onClick={() => setActiveTab("crew")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  activeTab === "crew"
                    ? "bg-emerald-400 text-black"
                    : "bg-white/5 text-neutral-300 hover:bg-white/10"
                }`}
              >
                Crew ({importantCrew.length})
              </button>
            )}
          </div>
        )}
      </div>

      {activeTab === "cast" && cast.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {displayedCast.map((member) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                <div className="relative w-full aspect-[2/3] bg-white/5 rounded-lg overflow-hidden mb-2 border border-white/10">
                  {member.profile_path ? (
                    <img
                      src={`${IMAGE_BASE_URL}${member.profile_path}`}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                          const fallback = parent.querySelector(".cast-fallback") as HTMLElement;
                          if (fallback) {
                            fallback.style.display = "flex";
                          }
                        }
                      }}
                    />
                  ) : null}
                  <div
                    className="cast-fallback absolute inset-0 w-full h-full bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 flex items-center justify-center"
                    style={{ display: member.profile_path ? "none" : "flex" }}
                  >
                    <User className="h-8 w-8 text-emerald-400" />
                  </div>
                </div>
                <p className="text-sm font-medium text-white truncate" title={member.name}>
                  {member.name}
                </p>
                {member.character && (
                  <p className="text-xs text-neutral-400 truncate" title={member.character}>
                    {member.character}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
          {cast.length > 10 && (
            <button
              onClick={() => setShowAllCast(!showAllCast)}
              className="mt-4 w-full py-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              {showAllCast ? `Show Less` : `Show All ${cast.length} Cast Members`}
            </button>
          )}
        </>
      )}

      {activeTab === "crew" && importantCrew.length > 0 && (
        <div className="space-y-6">
          {Object.entries(crewByDepartment).map(([department, members]) => (
            <div key={department}>
              <h4 className="text-sm font-semibold text-neutral-400 mb-3 uppercase tracking-wide">
                {department}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {members.map((member) => (
                  <motion.div
                    key={`${member.id}-${member.job}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/10"
                  >
                    {member.profile_path ? (
                      <img
                        src={`${IMAGE_BASE_URL}${member.profile_path}`}
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-emerald-400/20 flex items-center justify-center flex-shrink-0">
                        <User className="h-6 w-6 text-emerald-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate" title={member.name}>
                        {member.name}
                      </p>
                      <p className="text-xs text-neutral-400 truncate" title={member.job}>
                        {member.job}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

