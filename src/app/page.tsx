"use client";

import React from "react";
import Header from "@/components/layout/Header";
import HeroCarousel from "@/components/hero/HeroCarousel";
import MovieRow from "@/components/home/MovieRow";
import Footer from "@/components/layout/Footer";

export default function Page() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-primary/30">
      <Header />

      <HeroCarousel />

      <div className="relative z-10 -mt-20 pb-20 space-y-8 md:space-y-16 pl-0 md:pl-4">
        {/* Rows overlap with hero slightly for seamless look */}

        <MovieRow
          title="Trending Now"
          endpoint="/api/movies/trending?time_window=week"
          icon="trending"
        />

        <MovieRow
          title="Popular on FilmMuse"
          endpoint="/api/movies/popular"
          icon="star"
        />

        <MovieRow
          title="In Theaters"
          endpoint="/api/movies/now-playing"
          icon="ticket"
        />

        <MovieRow
          title="Coming Soon"
          endpoint="/api/movies/upcoming"
          icon="calendar"
        />
      </div>

      <Footer />
    </main>
  );
}
