"use client";

import React from "react";
import { motion } from "framer-motion";
import NavBar from "@/components/home/NavBar";
import BackdropCarousel from "@/components/home/BackdropCarousel";
import TrustBar from "@/components/home/TrustBar";
import Footer from "@/components/home/Footer";
import MovieRow from "@/components/home/MovieRow";
import dynamic from "next/dynamic";
import { MovieCardGridSkeleton } from "@/components/ui/skeleton";

const SectionDiscover = dynamic(() => import("@/components/home/SectionDiscover"), {
  loading: () => (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <MovieCardGridSkeleton count={8} />
      </div>
    </section>
  ),
  ssr: false,
});

export default function Page() {
  return (
    <motion.main
      id="main"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background text-foreground"
    >
      <NavBar />
      <section className="relative w-full" aria-labelledby="hero-title">
        <BackdropCarousel />
      </section>
      <TrustBar />

      <MovieRow
        title="Trending Now"
        description="Most popular movies this week"
        endpoint="/api/movies/trending?time_window=week"
        icon="trending"
      />

      <MovieRow
        title="Popular"
        description="All time favorites"
        endpoint="/api/movies/popular"
        icon="star"
      />

      <MovieRow
        title="In Theaters"
        description="Movies currently playing in theaters"
        endpoint="/api/movies/now-playing"
        icon="ticket"
      />

      <MovieRow
        title="Coming Soon"
        description="Upcoming releases you can't miss"
        endpoint="/api/movies/upcoming"
        icon="calendar"
      />

      <SectionDiscover />
      <Footer />
    </motion.main>
  );
}
